import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeDocument } from '@/lib/document'
import { hashIp, getClientIp } from '@/lib/rateLimit'
import { CURRENT_EVENT_YEAR } from '@/lib/eventYear'

/**
 * Desbloqueia o chat após 5 tentativas erradas.
 * Exige código de confirmação que corresponde à inscrição do documento informado.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const ipHash = hashIp(ip)

    const body = (await request.json()) as {
      identifier: string
      identifierType: 'cpf' | 'rg'
      codigo: string
    }

    const { identifier, codigo } = body
    const searchDoc = normalizeDocument(identifier ?? '')
    const searchCodigo = codigo?.toString().trim().toUpperCase()

    if (!searchDoc || searchDoc.length < 9) {
      return NextResponse.json({ error: 'Informe CPF ou RG válido' }, { status: 400 })
    }

    if (!searchCodigo) {
      return NextResponse.json({ error: 'Informe o código de confirmação' }, { status: 400 })
    }

    const identifierTypeResolved = searchDoc.length === 11 ? 'cpf' : 'rg'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Verificar se está bloqueado
    const { data: lockoutRow } = await supabase
      .from('buscar_lockout')
      .select('id, locked_until')
      .eq('ip_hash', ipHash)
      .eq('identifier', searchDoc)
      .eq('identifier_type', identifierTypeResolved)
      .single()

    if (!lockoutRow) {
      return NextResponse.json(
        { error: 'Nenhum bloqueio encontrado para este documento.' },
        { status: 400 }
      )
    }

    if (!lockoutRow.locked_until || new Date(lockoutRow.locked_until) <= new Date()) {
      return NextResponse.json(
        { error: 'Você não está bloqueado. Tente acessar o chat normalmente.' },
        { status: 400 }
      )
    }

    // Buscar inscrição por documento + código (evento 2026)
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
        .select('id')
        .eq('document_number', doc)
        .limit(20)
      if (athletes?.length) athleteIds = [...athleteIds, ...athletes.map((a) => a.id)]
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
        .select('id')
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
      return NextResponse.json(
        { error: 'Código inválido. Verifique o código enviado no seu e-mail.' },
        { status: 400 }
      )
    }

    const { data: regs } = await supabase
      .from('registrations')
      .select('id, confirmation_code, athlete:athletes(full_name)')
      .in('id', regIds)

    const reg = (regs || []).find(
      (r) => (r.confirmation_code || '').toUpperCase().trim() === searchCodigo
    )

    if (!reg) {
      return NextResponse.json(
        { error: 'Código inválido. Verifique o código enviado no seu e-mail.' },
        { status: 400 }
      )
    }

    // Código correto: remover lockout
    await supabase
      .from('buscar_lockout')
      .delete()
      .eq('ip_hash', ipHash)
      .eq('identifier', searchDoc)
      .eq('identifier_type', identifierTypeResolved)

    const athlete = Array.isArray(reg.athlete) ? reg.athlete[0] : reg.athlete
    const userName = (athlete as any)?.full_name || 'Atleta'

    return NextResponse.json({
      success: true,
      userName,
      identifier: searchDoc,
      identifierType: identifierTypeResolved,
    })
  } catch (err: any) {
    console.error('Erro chat unlock:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
