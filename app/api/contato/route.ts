import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { CONTACT_EMAIL } from '@/lib/constants'

const ASSUNTO_LABELS: Record<string, string> = {
  geral: 'Informações Gerais',
  inscricao: 'Inscrição',
  pagamento: 'Pagamento',
  kit: 'Retirada de Kit',
  percurso: 'Percurso',
  resultado: 'Resultados',
  patrocinio: 'Patrocínio',
  outro: 'Outro',
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey?.trim()) return null
  return new Resend(apiKey.trim())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, telefone, assunto, mensagem } = body as {
      nome?: string
      email?: string
      telefone?: string
      assunto?: string
      mensagem?: string
    }

    if (!nome?.trim() || !email?.trim() || !mensagem?.trim()) {
      return NextResponse.json(
        { error: 'Nome, email e mensagem são obrigatórios.' },
        { status: 400 }
      )
    }

    const resend = getResendClient()
    if (!resend) {
      return NextResponse.json(
        { error: 'Serviço de email não configurado. Tente novamente mais tarde.' },
        { status: 500 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
    if (!fromEmail) {
      return NextResponse.json(
        { error: 'Serviço de email não configurado.' },
        { status: 500 }
      )
    }

    const fromName = process.env.RESEND_FROM_NAME || 'Corrida Rústica de Macuco'
    const from = `${fromName} <${fromEmail}>`
    const assuntoLabel = ASSUNTO_LABELS[assunto || 'geral'] || assunto || 'Contato'

    const html = `
      <h2>Nova mensagem do site - ${assuntoLabel}</h2>
      <p><strong>Nome:</strong> ${nome.trim()}</p>
      <p><strong>Email:</strong> ${email.trim()}</p>
      ${telefone?.trim() ? `<p><strong>Telefone:</strong> ${telefone.trim()}</p>` : ''}
      <p><strong>Assunto:</strong> ${assuntoLabel}</p>
      <hr />
      <p><strong>Mensagem:</strong></p>
      <p>${mensagem.trim().replace(/\n/g, '<br>')}</p>
    `

    const { error } = await resend.emails.send({
      from,
      to: CONTACT_EMAIL,
      replyTo: email.trim(),
      subject: `[Site] ${assuntoLabel} - ${nome.trim()}`,
      html,
    })

    if (error) {
      console.error('Erro Resend contato:', error)
      return NextResponse.json(
        { error: 'Falha ao enviar. Tente novamente ou use o WhatsApp.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Erro ao enviar contato:', err)
    return NextResponse.json(
      { error: 'Erro ao processar. Tente novamente.' },
      { status: 500 }
    )
  }
}
