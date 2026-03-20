import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeDocument } from '@/lib/document'
import { hashIp, getClientIp, parseBirthDate, datesMatch } from '@/lib/rateLimit'
import { CURRENT_EVENT_YEAR } from '@/lib/eventYear'

const LOCKOUT_DURATION_MS = 60 * 60 * 1000 // 1 hora

/**
 * Verifica CPF/RG + data de nascimento para liberar acesso ao chat.
 * Usa buscar_lockout para bloqueio após 5 tentativas erradas.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const ipHash = hashIp(ip)

    const body = (await request.json()) as {
      identifier: string
      identifierType: 'cpf' | 'rg'
      birthDate: string
    }

    const { identifier, birthDate } = body
    const searchDoc = normalizeDocument(identifier ?? '')
    const parsedBirth = parseBirthDate(birthDate ?? '')

    if (!searchDoc || searchDoc.length < 9) {
      return NextResponse.json({ error: 'Informe CPF ou RG válido' }, { status: 400 })
    }

    if (!parsedBirth) {
      return NextResponse.json(
        { error: 'Informe a data de nascimento (dia, mês e ano)' },
        { status: 400 }
      )
    }

    const identifierTypeResolved = searchDoc.length === 11 ? 'cpf' : 'rg'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Verificar lockout
    const { data: lockoutRow } = await supabase
      .from('buscar_lockout')
      .select('id, locked_until, failed_count')
      .eq('ip_hash', ipHash)
      .eq('identifier', searchDoc)
      .eq('identifier_type', identifierTypeResolved)
      .single()

    if (lockoutRow?.locked_until && new Date(lockoutRow.locked_until) > new Date()) {
      return NextResponse.json(
        {
          locked: true,
          error: 'Muitas tentativas. Use o código de confirmação enviado no seu e-mail para desbloquear.',
        },
        { status: 403 }
      )
    }

    // Buscar inscrição por documento (evento 2026)
    const { data: event } = await supabase.from('events').select('id').eq('year', CURRENT_EVENT_YEAR).single()
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const docVariants = [searchDoc]
    if (searchDoc.length === 9 && searchDoc.startsWith('0')) {
      docVariants.push(searchDoc.slice(1))
    }

    let athleteIds: string[] = []
    for (const doc of docVariants) {
      const { data: athletes } = await supabase
        .from('athletes')
        .select('id, full_name, birth_date')
        .eq('document_number', doc)
        .limit(20)
      if (athletes?.length) {
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
      if (guardians?.length) guardianIds = [...guardianIds, ...guardians.map((g) => g.id)]
    }

    let regIdsSet = new Set<string>()
    if (athleteIds.length > 0) {
      const { data: r } = await supabase
        .from('registrations')
        .select('id, athlete_id')
        .eq('event_id', event.id)
        .in('athlete_id', athleteIds)
      if (r?.length) r.forEach((x) => regIdsSet.add(x.id))
    }
    if (guardianIds.length > 0) {
      const { data: r } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', event.id)
        .in('guardian_id', guardianIds)
      if (r?.length) r.forEach((x) => regIdsSet.add(x.id))
    }

    const regIds = Array.from(regIdsSet)
    if (regIds.length === 0) {
      await incrementLockout(supabase, ipHash, searchDoc, identifierTypeResolved)
      return NextResponse.json(
        { valid: false, error: 'Não encontramos inscrição com esses dados.' },
        { status: 200 }
      )
    }

    // Buscar atletas com birth_date para validar (pode haver múltiplas inscrições, ex: responsável com 2 filhos)
    const { data: regs } = await supabase
      .from('registrations')
      .select('athlete:athletes(full_name, birth_date)')
      .in('id', regIds)

    const matchingReg = (regs || []).find((r) => {
      const a = Array.isArray(r.athlete) ? r.athlete[0] : r.athlete
      return datesMatch((a as any)?.birth_date, parsedBirth)
    })

    if (!matchingReg) {
      await incrementLockout(supabase, ipHash, searchDoc, identifierTypeResolved)
      return NextResponse.json(
        { valid: false, error: 'Data de nascimento não confere.' },
        { status: 200 }
      )
    }

    // Sucesso: resetar lockout e retornar
    await supabase
      .from('buscar_lockout')
      .delete()
      .eq('ip_hash', ipHash)
      .eq('identifier', searchDoc)
      .eq('identifier_type', identifierTypeResolved)

    const athlete = Array.isArray(matchingReg.athlete) ? matchingReg.athlete[0] : matchingReg.athlete
    const userName = (athlete as any)?.full_name || 'Atleta'

    return NextResponse.json({
      valid: true,
      userName,
      identifier: searchDoc,
      identifierType: identifierTypeResolved,
    })
  } catch (err: any) {
    console.error('Erro chat verify:', err)
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
    { onConflict: 'ip_hash,identifier,identifier_type' }
  )
}
