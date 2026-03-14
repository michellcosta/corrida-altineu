import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/serverClient'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey?.trim()) return null
  return new Resend(apiKey.trim())
}

function getGreeting(): string {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: 'numeric',
    hour12: false,
  })
  const h = parseInt(formatter.format(new Date()), 10)
  if (h >= 6 && h < 12) return 'Bom dia'
  if (h >= 12 && h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function replaceVariables(text: string, vars: Record<string, string>): string {
  let result = text
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value ?? '')
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!profile || !['SITE_ADMIN', 'ORG_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ error: 'Sem permissão para enviar emails' }, { status: 403 })
    }

    const resend = getResendClient()
    if (!resend) {
      return NextResponse.json(
        { error: 'Resend não configurado. Adicione RESEND_API_KEY nas variáveis de ambiente.' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
    if (!fromEmail) {
      return NextResponse.json(
        { error: 'RESEND_FROM_EMAIL não configurado. Use um email do domínio verificado no Resend.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { subject, body: emailBody, recipients } = body as {
      subject: string
      body: string
      recipients: Array<{ email: string; athlete_name?: string }>
    }

    if (!subject?.trim() || !emailBody?.trim() || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'subject, body e recipients são obrigatórios' },
        { status: 400 }
      )
    }

    const fromName = process.env.RESEND_FROM_NAME || 'Corrida Rústica de Macuco'
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail

    let sent = 0
    const errors: string[] = []

    const greeting = getGreeting()
    const bodyWithGreeting = `${greeting} {{athlete_name}}!\n\n${emailBody}`

    for (const r of recipients) {
      if (!r.email?.trim()) continue
      const vars = { athlete_name: r.athlete_name ?? '' }
      const html = replaceVariables(bodyWithGreeting, vars)
        .replace(/\n/g, '<br>')
      const subj = replaceVariables(subject, vars)

      try {
        const { error } = await resend.emails.send({
          from,
          to: r.email.trim(),
          subject: subj,
          html,
        })
        if (error) throw new Error(error.message)
        sent++
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${r.email}: ${msg}`)
      }
    }

    return NextResponse.json({
      sent,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: unknown) {
    console.error('Erro ao enviar email:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao enviar emails' },
      { status: 500 }
    )
  }
}
