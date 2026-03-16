import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeDocument } from '@/lib/document'
import { hashIp, getClientIp, parseBirthDate, datesMatch } from '@/lib/rateLimit'

const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const LOCKOUT_DURATION_MS = 60 * 60 * 1000 // 1 hora

/**
 * Busca inscrição por CPF, RG, código de confirmação ou e-mail.
 * Protegido por: rate limit (10 req/min), validação de data de nascimento (CPF/RG/email),
 * bloqueio após 5 tentativas erradas.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const ipHash = hashIp(ip)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // 1. Rate limit
    const now = new Date().toISOString()
    const { data: rateRow } = await supabase
      .from('buscar_rate_limit')
      .select('count, window_start')
      .eq('ip_hash', ipHash)
      .single()

    const windowStart = rateRow?.window_start ? new Date(rateRow.window_start).getTime() : 0
    const elapsed = Date.now() - windowStart
    let count = rateRow?.count ?? 0

    if (elapsed > RATE_LIMIT_WINDOW_MS) {
      count = 0
    }
    if (count >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
        { status: 429 }
      )
    }

    await supabase.from('buscar_rate_limit').upsert(
      {
        ip_hash: ipHash,
        count: elapsed > RATE_LIMIT_WINDOW_MS ? 1 : count + 1,
        window_start: elapsed > RATE_LIMIT_WINDOW_MS ? now : rateRow?.window_start ?? now,
      },
      { onConflict: 'ip_hash' }
    )

    const { cpf, rg, codigo, email, birthDate } = (await request.json()) as {
      cpf?: string
      rg?: string
      codigo?: string
      email?: string
      birthDate?: string
    }

    const searchCodigo = codigo?.toString().trim()
    const searchEmail = email?.toString().trim().toLowerCase()
    const rawDoc = cpf?.toString().trim() || rg?.toString().trim() || ''
    const searchDoc = rawDoc ? normalizeDocument(rawDoc) : ''

    if (!searchCodigo && !searchDoc && !searchEmail) {
      return NextResponse.json({ error: 'Informe CPF, RG, código ou e-mail' }, { status: 400 })
    }

    const { data: event } = await supabase.from('events').select('id, price_geral').eq('year', 2026).single()
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const { data: categories } = await supabase
      .from('categories')
      .select('slug, price, is_free')
      .eq('event_id', event.id)
    const priceBySlug = new Map<string, number>()
    const priceGeral = Number(event.price_geral) ?? 22
    for (const c of categories || []) {
      const p = Number(c.price) || priceGeral
      priceBySlug.set(c.slug, c.is_free ? 0 : p)
    }

    const athleteSelect = `
      id, full_name, email, phone, whatsapp, document_type, document_number,
      birth_date, gender, team_name, city, state, country, address, zip_code,
      emergency_contact_name, emergency_contact_phone, tshirt_size
    `
    const regSelect = `
      id, registration_number, confirmation_code, status, bib_number, kit_picked_at, payment_amount, payment_id,
      athlete:athletes(${athleteSelect}),
      guardian:guardians(full_name, document_type, document_number, phone, email, relationship),
      category:categories(name, slug)
    `

    let regs: any[] = []

    if (searchCodigo) {
      // Busca por código: fluxo direto, sem birthDate, sem lockout
      const { data, error } = await supabase
        .from('registrations')
        .select(regSelect)
        .eq('event_id', event.id)
        .eq('confirmation_code', searchCodigo)
        .order('registered_at', { ascending: false })
        .limit(5)
      if (error) {
        console.error('Erro ao buscar inscrição:', error)
        return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 })
      }
      regs = data || []

      if (regs.length > 0) {
        // Resetar lockout para este IP ao acertar com código
        await supabase
          .from('buscar_lockout')
          .delete()
          .eq('ip_hash', ipHash)
      }
    } else {
      // Busca por CPF/RG/email: exige birthDate
      const parsedBirth = parseBirthDate(birthDate ?? '')
      if (!parsedBirth) {
        return NextResponse.json(
          { error: 'Para buscar por CPF, RG ou e-mail, informe a data de nascimento.' },
          { status: 400 }
        )
      }

      const identifier = searchEmail || searchDoc
      const identifierType = searchEmail ? 'email' : (searchDoc.length === 11 ? 'cpf' : 'rg')

      // Verificar lockout
      const { data: lockoutRow } = await supabase
        .from('buscar_lockout')
        .select('id, locked_until, failed_count')
        .eq('ip_hash', ipHash)
        .eq('identifier', identifier)
        .eq('identifier_type', identifierType)
        .single()

      if (lockoutRow?.locked_until && new Date(lockoutRow.locked_until) > new Date()) {
        return NextResponse.json(
          {
            locked: true,
            error: 'Muitas tentativas. Use o código de confirmação enviado no seu e-mail.',
          },
          { status: 403 }
        )
      }

      if (searchEmail) {
        const { data: athletes } = await supabase
          .from('athletes')
          .select('id')
          .ilike('email', searchEmail)
          .limit(10)
        const athleteIds = (athletes || []).map((a) => a.id)
        if (athleteIds.length === 0) {
          await incrementLockout(supabase, ipHash, identifier, identifierType)
          return NextResponse.json({ data: [] })
        }
        const { data, error } = await supabase
          .from('registrations')
          .select(regSelect)
          .eq('event_id', event.id)
          .in('athlete_id', athleteIds)
          .order('registered_at', { ascending: false })
          .limit(5)
        if (error) {
          console.error('Erro ao buscar inscrição:', error)
          return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 })
        }
        regs = data || []
      } else {
        const docVariants = [searchDoc]
        if (searchDoc.length === 9 && searchDoc.startsWith('0')) {
          docVariants.push(searchDoc.slice(1))
        }

        let athleteIds: string[] = []
        for (const doc of docVariants) {
          const { data: athletes } = await supabase
            .from('athletes')
            .select('id')
            .eq('document_number', doc)
            .limit(20)
          if (athletes && athletes.length > 0) {
            athleteIds = [...athleteIds, ...athletes.map((a) => a.id)]
          }
        }

        let guardianIds: string[] = []
        for (const doc of docVariants) {
          const { data: guardians } = await supabase
            .from('guardians')
            .select('id')
            .eq('document_number', doc)
            .limit(20)
          if (guardians && guardians.length > 0) {
            guardianIds = [...guardianIds, ...guardians.map((g) => g.id)]
          }
        }

        let regIdsSet = new Set<string>()
        if (athleteIds.length > 0) {
          const { data: regsByAthlete } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', event.id)
            .in('athlete_id', athleteIds)
          if (regsByAthlete) regsByAthlete.forEach((r) => regIdsSet.add(r.id))
        }
        if (guardianIds.length > 0) {
          const { data: regsByGuardian } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', event.id)
            .in('guardian_id', guardianIds)
          if (regsByGuardian) regsByGuardian.forEach((r) => regIdsSet.add(r.id))
        }

        const regIdsToFetch = Array.from(regIdsSet)
        if (regIdsToFetch.length === 0) {
          await incrementLockout(supabase, ipHash, identifier, identifierType)
          return NextResponse.json({ data: [] })
        }

        const { data, error } = await supabase
          .from('registrations')
          .select(regSelect)
          .in('id', regIdsToFetch)
          .order('registered_at', { ascending: false })
          .limit(20)
        if (error) {
          console.error('Erro ao buscar inscrição:', error)
          return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 })
        }
        regs = data || []
      }

      // Validar birthDate contra athlete.birth_date
      const firstAthlete = regs[0]
      const athlete = Array.isArray(firstAthlete?.athlete) ? firstAthlete?.athlete[0] : firstAthlete?.athlete
      const dbBirth = athlete?.birth_date

      if (!datesMatch(dbBirth, parsedBirth)) {
        await incrementLockout(supabase, ipHash, identifier, identifierType)
        return NextResponse.json({ data: [] })
      }

      // Acertou: resetar lockout
      await supabase
        .from('buscar_lockout')
        .delete()
        .eq('ip_hash', ipHash)
        .eq('identifier', identifier)
        .eq('identifier_type', identifierType)
    }

    const list = regs.map((r: any) => {
      const athlete = Array.isArray(r.athlete) ? r.athlete[0] : r.athlete
      const guardian = Array.isArray(r.guardian) ? r.guardian[0] : r.guardian
      const category = Array.isArray(r.category) ? r.category[0] : r.category
      const slug = category?.slug
      const correctAmount = slug && priceBySlug.has(slug) ? priceBySlug.get(slug)! : (Number(r.payment_amount) || priceGeral)
      return {
        id: r.id,
        registration_number: r.registration_number,
        confirmation_code: r.confirmation_code,
        status: r.status,
        bib_number: r.bib_number,
        kit_picked_at: r.kit_picked_at,
        payment_amount: correctAmount,
        payment_id: r.payment_id,
        category_name: category?.name,
        category_slug: category?.slug,
        athlete_id: athlete?.id,
        athlete: athlete
          ? {
              full_name: athlete.full_name,
              email: athlete.email,
              phone: athlete.phone,
              whatsapp: athlete.whatsapp,
              document_type: athlete.document_type,
              document_number: athlete.document_number,
              birth_date: athlete.birth_date,
              gender: athlete.gender,
              team_name: athlete.team_name,
              city: athlete.city,
              state: athlete.state,
              country: athlete.country,
              address: athlete.address,
              zip_code: athlete.zip_code,
              emergency_contact_name: athlete.emergency_contact_name,
              emergency_contact_phone: athlete.emergency_contact_phone,
              tshirt_size: athlete.tshirt_size,
            }
          : null,
        guardian: guardian
          ? {
              full_name: guardian.full_name,
              document_type: guardian.document_type,
              document_number: guardian.document_number,
              phone: guardian.phone,
              email: guardian.email,
              relationship: guardian.relationship,
            }
          : null,
      }
    })

    return NextResponse.json({ data: list })
  } catch (err: any) {
    console.error('Erro:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}

async function incrementLockout(
  supabase: any,
  ipHash: string,
  identifier: string,
  identifierType: string
) {
  const { data: existing } = await supabase
    .from('buscar_lockout')
    .select('id, failed_count')
    .eq('ip_hash', ipHash)
    .eq('identifier', identifier)
    .eq('identifier_type', identifierType)
    .single()

  const failedCount = (existing?.failed_count ?? 0) + 1
  const lockedUntil = failedCount >= 5 ? new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString() : null

  await supabase.from('buscar_lockout').upsert(
    {
      ip_hash: ipHash,
      identifier,
      identifier_type: identifierType,
      failed_count: failedCount,
      locked_until: lockedUntil,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'ip_hash,identifier,identifier_type',
    }
  )
}
