import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado')
      return NextResponse.json(
        { error: 'Pagamento não configurado. Configure Mercado Pago.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      registrationId,
      amount,
      email,
      fullName,
      phone,
      taxId,
    } = body

    if (!registrationId) {
      return NextResponse.json(
        { error: 'ID da inscrição não informado' },
        { status: 400 }
      )
    }
    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório para gerar o PIX. Edite os dados da inscrição.' },
        { status: 400 }
      )
    }

    const amountNum = Number(amount)
    const amountReais = Number.isNaN(amountNum) ? 22 : amountNum

    if (amountReais < 0.5) {
      return NextResponse.json(
        { error: 'Valor mínimo para PIX é R$ 0,50' },
        { status: 400 }
      )
    }

    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)

    const [firstName, ...lastNameParts] = (fullName || 'Atleta').trim().split(/\s+/)
    const lastName = lastNameParts.join(' ') || 'Corrida'

    const docNumber = (taxId || '').replace(/\D/g, '')
    const identification = docNumber.length >= 11
      ? { type: 'CPF' as const, number: docNumber }
      : docNumber.length >= 14
        ? { type: 'CNPJ' as const, number: docNumber }
        : undefined

    // Mercado Pago exige notification_url com https:// - localhost não é aceito
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://corridademacuco.vercel.app'
    const baseUrl = appUrl.startsWith('https://') ? appUrl.replace(/\/$/, '') : 'https://corridademacuco.vercel.app'
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    const notificationUrl = webhookSecret
      ? `${baseUrl}/api/payments/webhook?webhookSecret=${encodeURIComponent(webhookSecret)}`
      : `${baseUrl}/api/payments/webhook`

    const payment = await paymentClient.create({
      body: {
        transaction_amount: amountReais,
        description: 'Inscrição 51ª Corrida Rústica de Macuco',
        payment_method_id: 'pix',
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        external_reference: String(registrationId),
        notification_url: notificationUrl,
        payer: {
          email: email.trim(),
          first_name: firstName,
          last_name: lastName,
          identification,
        },
        metadata: {
          registration_id: registrationId,
        },
        additional_info: {
          items: [
            {
              id: String(registrationId),
              title: 'Inscrição 51ª Corrida Rústica de Macuco',
              description: 'Inscrição para a prova',
              category_id: 'events',
              quantity: 1,
              unit_price: amountReais,
            },
          ],
        },
      },
      requestOptions: {
        idempotencyKey: `reg-${registrationId}-${Date.now()}`,
      },
    })

    const poi = payment.point_of_interaction?.transaction_data
    const qrCode = poi?.qr_code
    const qrCodeBase64 = poi?.qr_code_base64

    if (!payment.id || !qrCode || !qrCodeBase64) {
      console.error('Mercado Pago resposta incompleta:', { id: payment.id, hasQrCode: !!qrCode, hasQrCodeBase64: !!qrCodeBase64 })
      return NextResponse.json(
        { error: 'Resposta inválida do Mercado Pago' },
        { status: 500 }
      )
    }

    let brCodeBase64 = String(qrCodeBase64)
    if (brCodeBase64 && !brCodeBase64.startsWith('data:')) {
      brCodeBase64 = `data:image/png;base64,${brCodeBase64}`
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    await supabase
      .from('registrations')
      .update({
        payment_id: String(payment.id),
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)

    return NextResponse.json({
      id: String(payment.id),
      brCode: qrCode,
      brCodeBase64,
      amount: payment.transaction_amount ? payment.transaction_amount * 100 : Math.round(amountReais * 100),
      expiresAt: payment.date_of_expiration ?? null,
    })
  } catch (err: unknown) {
    console.error('Erro ao criar checkout:', err)
    const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Erro ao processar pagamento'
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    )
  }
}
