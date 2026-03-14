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
    <h2>Pagamento confirmado - 51ª Corrida Rústica de Macuco</h2>
    <p>Olá, <strong>${athleteName}</strong>!</p>
    <p>Recebemos seu pagamento. Sua inscrição na categoria <strong>${categoryName}</strong> está confirmada! ✅</p>
    <p><strong>Nº Inscrição:</strong> ${registrationNumber}</p>
    <p><strong>Código de confirmação:</strong> ${confirmationCode}</p>
    <p>Guarde o código de confirmação e leve um documento com foto na retirada do kit.</p>
    <p><a href="${acompanharUrl}">Acompanhar inscrição</a></p>
    <p>Até a largada! 🏃‍♂️</p>
  `

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Pagamento confirmado - ${registrationNumber} | Corrida de Macuco`,
    html,
  })
  return { ok: !error, error: error?.message }
}
