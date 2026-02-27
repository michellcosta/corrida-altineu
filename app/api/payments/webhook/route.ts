import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = request.nextUrl.searchParams.get('webhookSecret')
    const envSecret = process.env.ABACATEPAY_WEBHOOK_SECRET

    if (envSecret && webhookSecret !== envSecret) {
      console.error('Webhook: secret inválido')
      return NextResponse.json({ error: 'Secret inválido' }, { status: 401 })
    }

    const body = await request.json()
    const event = body.event

    if (event !== 'billing.paid') {
      return NextResponse.json({ received: true })
    }

    let registrationId: string | null = null
    let paymentId: string | null = null

    if (body.data?.pixQrCode) {
      const pix = body.data.pixQrCode
      if (pix.status !== 'PAID') return NextResponse.json({ received: true })
      paymentId = pix.id
      registrationId = body.data?.metadata?.registration_id || body.metadata?.registration_id
    } else if (body.data?.billing) {
      const billing = body.data.billing
      if (billing.status !== 'PAID') return NextResponse.json({ received: true })
      paymentId = billing.id
      registrationId = body.data?.metadata?.registration_id || body.metadata?.registration_id
    }

    if (!registrationId && paymentId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )
      const { data: reg } = await supabase
        .from('registrations')
        .select('id')
        .eq('payment_id', paymentId)
        .maybeSingle()
      if (reg) registrationId = reg.id
    }

    if (!registrationId) {
      console.error('Webhook AbacatePay: registration_id não encontrado', body)
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
        payment_id: paymentId,
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)

    if (error) {
      console.error('Webhook: erro ao atualizar inscrição:', error)
      return NextResponse.json({ error: 'Erro ao atualizar inscrição' }, { status: 500 })
    }

    console.log(`Inscrição ${registrationId} confirmada após pagamento PIX`)

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    console.error('Erro no webhook:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
