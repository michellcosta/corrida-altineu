import { Resend } from 'resend'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey?.trim()) return null
  return new Resend(apiKey.trim())
}

function getFrom() {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim()
  const fromName = process.env.RESEND_FROM_NAME || 'Corrida Rústica de Macuco'
  if (!fromEmail) return null
  return `${fromName} <${fromEmail}>`
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://corridademacuco.vercel.app').replace(/\/$/, '')
}

export async function sendRegistrationConfirmation(params: {
  to: string
  athleteName: string
  registrationNumber: string
  confirmationCode: string
  categoryName: string
  status: 'pending_payment' | 'confirmed'
  paymentAmount?: number
}) {
  const resend = getResendClient()
  const from = getFrom()
  if (!resend || !from) return { ok: false }

  const { to, athleteName, registrationNumber, confirmationCode, categoryName, status, paymentAmount } = params
  const appUrl = getAppUrl()
  const acompanharUrl = `${appUrl}/inscricao/acompanhar`

  const isPending = status === 'pending_payment'
  const valorStr = paymentAmount != null && paymentAmount > 0
    ? `R$ ${Number(paymentAmount).toFixed(2).replace('.', ',')}`
    : ''

  const html = `
    <h2>Inscrição realizada - 51ª Corrida Rústica de Macuco</h2>
    <p>Olá, <strong>${athleteName}</strong>!</p>
    <p>Sua inscrição na categoria <strong>${categoryName}</strong> foi registrada com sucesso.</p>
    <p><strong>Nº Inscrição:</strong> ${registrationNumber}</p>
    <p><strong>Código de confirmação:</strong> ${confirmationCode}</p>
    ${isPending ? `
      <p>Para concluir sua inscrição, acesse o link abaixo e realize o pagamento via PIX:</p>
      <p><strong>Valor:</strong> ${valorStr}</p>
      <p><a href="${acompanharUrl}" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Acompanhar inscrição e pagar</a></p>
    ` : `
      <p>Sua inscrição está confirmada! Guarde o código de confirmação para a retirada do kit.</p>
    `}
    <p><a href="${acompanharUrl}">${acompanharUrl}</a></p>
    <p>Qualquer dúvida, entre em contato conosco.</p>
    <p>Até a largada! 🏃‍♂️</p>
  `

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Inscrição confirmada - ${registrationNumber} | Corrida de Macuco`,
    html,
  })
  return { ok: !error, error: error?.message }
}

export async function sendPaymentConfirmation(params: {
  to: string
  athleteName: string
  registrationNumber: string
  confirmationCode: string
  categoryName: string
}) {
  const resend = getResendClient()
  const from = getFrom()
  if (!resend || !from) return { ok: false }

  const { to, athleteName, registrationNumber, confirmationCode, categoryName } = params
  const appUrl = getAppUrl()
  const acompanharUrl = `${appUrl}/inscricao/acompanhar`

  const html = `
    <h2 style="margin:0 0 16px;">Inscrição confirmada — 51ª Corrida Rústica de Macuco</h2>
    <p>Olá, <strong>${athleteName}</strong>!</p>
    <p>Recebemos seu <strong>pagamento via PIX</strong>. Sua inscrição na categoria <strong>${categoryName}</strong> está <strong>confirmada e garantida</strong>. ✅</p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

    <p style="margin:0 0 8px;font-weight:bold;color:#111827;">Para acessar o portal (acompanhar ou corrigir dados)</p>
    <p style="margin:0 0 12px;color:#374151;">Você pode acessar de duas formas:</p>
    <ul style="margin:0 0 12px;padding-left:20px;color:#374151;">
      <li><strong>Código de confirmação:</strong> use o código abaixo para entrar direto na página Acompanhar inscrição e visualizar/corrigir seus dados;</li>
      <li><strong>OU</strong></li>
      <li><strong>CPF, RG ou e-mail:</strong> informe um desses dados + data de nascimento na página Acompanhar inscrição para visualizar/corrigir seus dados.</li>
    </ul>
    <p style="margin:0 0 8px;color:#374151;"><strong>Código de confirmação:</strong> ${confirmationCode}</p>
    <p style="margin:0 0 16px;">
      <a href="${acompanharUrl}" style="display:inline-block;background:#0d9488;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Acompanhar minha inscrição</a>
    </p>
    <p style="margin:0;font-size:14px;"><a href="${acompanharUrl}" style="color:#0d9488;">${acompanharUrl}</a></p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

    <p style="margin:0 0 8px;font-weight:bold;color:#111827;">Na retirada do kit</p>
    <p style="margin:0;color:#374151;">Apresente <strong>documento oficial com foto</strong> (RG, CNH ou equivalente). <strong>Não é necessário</strong> levar o código de confirmação para retirar o kit — ele é apenas para uso no site.</p>

    <p style="margin:24px 0 0;color:#374151;">Qualquer dúvida, entre em contato conosco.</p>
    <p style="margin:8px 0 0;">Até a largada! 🏃‍♂️</p>
  `

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Inscrição confirmada — pagamento recebido | Corrida de Macuco`,
    html,
  })
  return { ok: !error, error: error?.message }
}

export async function sendCodeResend(params: {
  to: string
  athleteName: string
  confirmationCode: string
  registrationNumber: string
}) {
  const resend = getResendClient()
  const from = getFrom()
  if (!resend || !from) return { ok: false }

  const { to, athleteName, confirmationCode, registrationNumber } = params
  const appUrl = getAppUrl()
  const acompanharUrl = `${appUrl}/inscricao/acompanhar`

  const html = `
    <h2>Reenvio do código de confirmação - Corrida Rústica de Macuco</h2>
    <p>Olá, <strong>${athleteName}</strong>!</p>
    <p>Segue o código de confirmação da sua inscrição:</p>
    <p><strong>Nº Inscrição:</strong> ${registrationNumber}</p>
    <p><strong>Código de confirmação:</strong> ${confirmationCode}</p>
    <p><a href="${acompanharUrl}" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Acompanhar inscrição</a></p>
    <p><a href="${acompanharUrl}">${acompanharUrl}</a></p>
    <p>Até a largada! 🏃‍♂️</p>
  `

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Código de confirmação - ${registrationNumber} | Corrida de Macuco`,
    html,
  })
  return { ok: !error, error: error?.message }
}
