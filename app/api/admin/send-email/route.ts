import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/serverClient'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY não configurada. Adicione no .env.local' },
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

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const fromName = process.env.RESEND_FROM_NAME || 'Corrida Macuco'

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

      const { error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: r.email.trim(),
        subject: subj,
        html,
      })

      if (error) {
        errors.push(`${r.email}: ${error.message}`)
      } else {
        sent++
      }
    }

    return NextResponse.json({
      sent,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error('Erro ao enviar email:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao enviar emails' },
      { status: 500 }
    )
  }
}
