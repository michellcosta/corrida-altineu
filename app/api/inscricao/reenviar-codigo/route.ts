import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normalizeDocument } from '@/lib/document'
import { hashIp, getClientIp } from '@/lib/rateLimit'
import { sendCodeResend } from '@/lib/email'
import { CURRENT_EVENT_YEAR } from '@/lib/eventYear'

const RESEND_BLOCK_DURATION_MS = 60 * 60 * 1000 // 1 hora
const WRONG_RESEND_LIMIT = 5

/**
 * Reenvia o código de confirmação por e-mail.
 * Só disponível quando o usuário está bloqueado (locked) por muitas tentativas erradas.
 * O e-mail informado deve ser o mesmo cadastrado na inscrição.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const ipHash = hashIp(ip)

    const body = (await request.json()) as {
      identifier: string
      identifierType: 'cpf' | 'rg' | 'email'
      email: string
    }

    const { identifier, identifierType, email } = body
    const trimmedEmail = email?.toString().trim().toLowerCase()
    const trimmedIdentifier = identifier?.toString().trim()

    if (!trimmedIdentifier || !trimmedEmail) {
      return NextResponse.json(
        { error: 'Informe o identificador e o e-mail.' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const normIdentifier = identifierType === 'email' ? trimmedIdentifier.toLowerCase() : normalizeDocument(trimmedIdentifier)

    // 1. Buscar lockout - deve existir com locked_until > now()
    const { data: lockoutRow } = await supabase
      .from('buscar_lockout')
      .select('id, locked_until, resend_blocked_until, wrong_resend_count')
      .eq('ip_hash', ipHash)
      .eq('identifier', normIdentifier)
      .eq('identifier_type', identifierType)
      .single()

    if (!lockoutRow) {
      return NextResponse.json(
        { error: 'Reenvio não disponível. Faça uma busca primeiro.' },
        { status: 400 }
      )
    }

    const now = new Date()
    if (!lockoutRow.locked_until || new Date(lockoutRow.locked_until) <= now) {
      return NextResponse.json(
        { error: 'Reenvio não disponível. Você não está bloqueado.' },
        { status: 400 }
      )
    }

    if (lockoutRow.resend_blocked_until && new Date(lockoutRow.resend_blocked_until) > now) {
      return NextResponse.json(
        {
          error: 'Você excedeu o limite de tentativas. Tente novamente em 1 hora.',
          resendBlocked: true,
        },
        { status: 429 }
      )
    }

    // 2. Buscar inscrição por identifier (evento 2026)
    const { data: event } = await supabase.from('events').select('id').eq('year', CURRENT_EVENT_YEAR).single()
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const regSelect = `
      id, registration_number, confirmation_code,
      athlete:athletes(id, full_name, email)
    `

    let reg: any = null

    if (identifierType === 'email') {
      const searchEmail = trimmedIdentifier
      const { data: athletes } = await supabase
        .from('athletes')
        .select('id')
        .ilike('email', searchEmail)
        .limit(5)
      const athleteIds = (athletes || []).map((a) => a.id)
      if (athleteIds.length === 0) {
        await incrementWrongResend(supabase, lockoutRow)
        return NextResponse.json(
          { error: 'Não foi possível enviar o código. Verifique se o e-mail está correto.' },
          { status: 400 }
        )
      }
      const { data: regs } = await supabase
        .from('registrations')
        .select(regSelect)
        .eq('event_id', event.id)
        .in('athlete_id', athleteIds)
        .order('registered_at', { ascending: false })
        .limit(10)
      reg = (regs || []).find((r: any) => {
        const a = Array.isArray(r.athlete) ? r.athlete[0] : r.athlete
        return a?.email?.trim().toLowerCase() === trimmedEmail
      }) || regs?.[0]
    } else {
      const searchDoc = normalizeDocument(trimmedIdentifier)
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
          .limit(10)
        if (athletes?.length) athleteIds = [...athleteIds, ...athletes.map((a) => a.id)]
      }

      let guardianIds: string[] = []
      for (const doc of docVariants) {
        const { data: guardians } = await supabase
          .from('guardians')
          .select('id')
          .eq('document_number', doc)
          .limit(10)
        if (guardians?.length) guardianIds = [...guardianIds, ...guardians.map((g) => g.id)]
      }

      let regIds: string[] = []
      if (athleteIds.length > 0) {
        const { data: r } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', event.id)
          .in('athlete_id', athleteIds)
        if (r?.length) regIds = r.map((x) => x.id)
      }
      if (guardianIds.length > 0) {
        const { data: r } = await supabase
          .from('registrations')
          .select('id')
          .eq('event_id', event.id)
          .in('guardian_id', guardianIds)
        if (r?.length) regIds = [...regIds, ...r.map((x) => x.id)]
      }

      if (regIds.length === 0) {
        await incrementWrongResend(supabase, lockoutRow)
        return NextResponse.json(
          { error: 'Não foi possível enviar o código. Verifique se o e-mail está correto.' },
          { status: 400 }
        )
      }

      const { data: regs } = await supabase
        .from('registrations')
        .select(regSelect)
        .in('id', regIds)
        .order('registered_at', { ascending: false })
        .limit(10)
      reg = (regs || []).find((r: any) => {
        const a = Array.isArray(r.athlete) ? r.athlete[0] : r.athlete
        return a?.email?.trim().toLowerCase() === trimmedEmail
      }) || regs?.[0]
    }

    if (!reg) {
      await incrementWrongResend(supabase, lockoutRow)
      return NextResponse.json(
        { error: 'Não foi possível enviar o código. Verifique se o e-mail está correto.' },
        { status: 400 }
      )
    }

    const athlete = Array.isArray(reg.athlete) ? reg.athlete[0] : reg.athlete
    const athleteEmail = athlete?.email?.trim().toLowerCase()

    if (!athleteEmail || athleteEmail !== trimmedEmail) {
      await incrementWrongResend(supabase, lockoutRow)
      return NextResponse.json(
        { error: 'Não foi possível enviar o código. Verifique se o e-mail está correto.' },
        { status: 400 }
      )
    }

    const { ok, error: sendError } = await sendCodeResend({
      to: trimmedEmail,
      athleteName: athlete?.full_name || 'Atleta',
      confirmationCode: reg.confirmation_code || '',
      registrationNumber: reg.registration_number || '',
    })

    if (!ok) {
      console.error('Erro ao enviar e-mail:', sendError)
      return NextResponse.json(
        { error: 'Erro ao enviar e-mail. Tente novamente.' },
        { status: 500 }
      )
    }

    // Resetar wrong_resend_count
    await supabase
      .from('buscar_lockout')
      .update({
        wrong_resend_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('ip_hash', ipHash)
      .eq('identifier', normIdentifier)
      .eq('identifier_type', identifierType)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Erro reenviar-codigo:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}

async function incrementWrongResend(
  supabase: any,
  lockoutRow: { id: string; wrong_resend_count?: number }
) {
  const wrongCount = (lockoutRow.wrong_resend_count ?? 0) + 1
  const resendBlockedUntil = wrongCount >= WRONG_RESEND_LIMIT
    ? new Date(Date.now() + RESEND_BLOCK_DURATION_MS).toISOString()
    : null

  await supabase
    .from('buscar_lockout')
    .update({
      wrong_resend_count: wrongCount,
      resend_blocked_until: resendBlockedUntil,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lockoutRow.id)
}
