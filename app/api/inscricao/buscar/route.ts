import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeDocument } from '@/lib/document'

/**
 * Busca inscrição por CPF, RG, código de confirmação ou e-mail.
 * Retorna todos os dados do formulário para exibição e edição.
 */
export async function POST(request: NextRequest) {
  try {
    const { cpf, rg, codigo, email } = (await request.json()) as {
      cpf?: string
      rg?: string
      codigo?: string
      email?: string
    }

    const searchCodigo = codigo?.toString().trim()
    const searchEmail = email?.toString().trim().toLowerCase()
    const rawDoc = cpf?.toString().trim() || rg?.toString().trim() || ''
    const searchDoc = rawDoc ? normalizeDocument(rawDoc) : ''

    if (!searchCodigo && !searchDoc && !searchEmail) {
      return NextResponse.json({ error: 'Informe CPF, RG, código ou e-mail' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: event } = await supabase.from('events').select('id, price_geral').eq('year', 2026).single()
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const { data: categories } = await supabase
      .from('categories')
      .select('slug, price, is_free')
      .eq('event_id', event.id)
    const priceBySlug = new Map<string, number>()
    const priceGeral = Number(event.price_geral) ?? 20
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
    } else if (searchEmail) {
      // Busca por e-mail do atleta
      const { data: athletes } = await supabase
        .from('athletes')
        .select('id')
        .ilike('email', searchEmail)
        .limit(10)
      const athleteIds = (athletes || []).map((a) => a.id)
      if (athleteIds.length === 0) {
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
      // Busca por documento do atleta ou responsável (normalizado)
      const docVariants = [searchDoc]
      if (searchDoc.length === 9 && searchDoc.startsWith('0')) {
        docVariants.push(searchDoc.slice(1))
      }

      // 1. Buscar atleta(s) pelo documento
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

      // 2. Buscar responsável(is) pelo documento
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

      // 3. Buscar todas as IDs de inscrições relacionadas
      let regIdsSet = new Set<string>()

      // Inscrições onde o documento é do atleta
      if (athleteIds.length > 0) {
        const { data: regsByAthlete } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', event.id)
          .in('athlete_id', athleteIds)
        if (regsByAthlete) {
          regsByAthlete.forEach((r) => regIdsSet.add(r.id))
        }
      }

      // Inscrições onde o documento é do responsável
      if (guardianIds.length > 0) {
        const { data: regsByGuardian } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', event.id)
          .in('guardian_id', guardianIds)
        if (regsByGuardian) {
          regsByGuardian.forEach((r) => regIdsSet.add(r.id))
        }
      }

      const regIdsToFetch = Array.from(regIdsSet)

      if (regIdsToFetch.length === 0) {
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
