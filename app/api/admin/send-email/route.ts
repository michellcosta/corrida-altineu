import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/serverClient'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

function getSESClient() {
  const region = process.env.AWS_SES_REGION || 'us-east-1'
  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!accessKey || !secretKey) {
    return null
  }

  return new SESClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  })
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

    const ses = getSESClient()
    if (!ses) {
      return NextResponse.json(
        { error: 'AWS SES não configurado. Adicione AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY e SES_FROM_EMAIL nas variáveis de ambiente.' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.SES_FROM_EMAIL?.trim()
    if (!fromEmail) {
      return NextResponse.json(
        { error: 'SES_FROM_EMAIL não configurado. Use um email verificado no Amazon SES.' },
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

    const fromName = process.env.SES_FROM_NAME || 'Corrida Rústica de Macuco'

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
        const command = new SendEmailCommand({
          Source: `${fromName} <${fromEmail}>`,
          Destination: {
            ToAddresses: [r.email.trim()],
          },
          Message: {
            Subject: {
              Data: subj,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: html,
                Charset: 'UTF-8',
              },
            },
          },
        })

        await ses.send(command)
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
