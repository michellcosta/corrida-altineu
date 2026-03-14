import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { sendPaymentConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = request.nextUrl.searchParams.get('webhookSecret')
    const envSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET

    if (envSecret && webhookSecret !== envSecret) {
      console.error('Webhook Mercado Pago: secret inválido')
      return NextResponse.json({ error: 'Secret inválido' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    if (type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = data?.id
    if (!paymentId) {
      console.error('Webhook Mercado Pago: payment id não encontrado', body)
      return NextResponse.json({ received: true })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken) {
      console.error('Webhook: MERCADOPAGO_ACCESS_TOKEN não configurado')
      return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 })
    }

    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: String(paymentId) })

    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true })
    }

    let registrationId: string | null = payment.metadata?.registration_id ?? null

    if (!registrationId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )
      const { data: reg } = await supabase
        .from('registrations')
        .select('id')
        .eq('payment_id', String(paymentId))
        .maybeSingle()
      if (reg) registrationId = reg.id
    }

    if (!registrationId) {
      console.error('Webhook Mercado Pago: registration_id não encontrado', { paymentId, metadata: payment.metadata })
      return NextResponse.json({ error: 'Registration não encontrado' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { error } = await supabase
      .from('registrations')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        payment_method: 'pix',
        payment_id: String(paymentId),
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)

    if (error) {
      return NextResponse.json({ error: 'Erro ao atualizar inscrição' }, { status: 500 })
    }

    const { data: regWithDetails } = await supabase
      .from('registrations')
      .select('registration_number, confirmation_code, athlete:athletes(full_name, email), guardian:guardians(email), categories(name)')
      .eq('id', registrationId)
      .single()

    if (regWithDetails) {
      const athlete = Array.isArray(regWithDetails.athlete) ? regWithDetails.athlete[0] : regWithDetails.athlete
      const guardian = Array.isArray(regWithDetails.guardian) ? regWithDetails.guardian[0] : regWithDetails.guardian
      const category = Array.isArray(regWithDetails.categories) ? regWithDetails.categories[0] : regWithDetails.categories
      const toEmail = (athlete as { email?: string })?.email || (guardian as { email?: string })?.email
      const athleteName = (athlete as { full_name?: string })?.full_name || 'Atleta'
      const categoryName = (category as { name?: string })?.name || 'Geral'

      if (toEmail?.trim()) {
        sendPaymentConfirmation({
          to: toEmail.trim(),
          athleteName,
          registrationNumber: regWithDetails.registration_number || '',
          confirmationCode: regWithDetails.confirmation_code || '',
          categoryName,
        }).catch((err) => console.error('[webhook] Erro ao enviar email de pagamento:', err))
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    console.error('Erro no webhook Mercado Pago:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
