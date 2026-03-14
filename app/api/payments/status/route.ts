import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export const dynamic = 'force-dynamic'

/**
 * Checa status do PIX via Mercado Pago GET /v1/payments/{id}
 * Status: pending | approved | authorized | in_process | in_mediation | rejected | cancelled | refunded | charged_back
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const paymentId = request.nextUrl.searchParams.get('payment_id') || request.nextUrl.searchParams.get('id')

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Pagamento não configurado' },
        { status: 500 }
      )
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: 'payment_id ou id obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: reg } = await supabase
      .from('registrations')
      .select('id, payment_status, status')
      .eq('payment_id', paymentId)
      .maybeSingle()

    if (reg?.payment_status === 'paid') {
      return NextResponse.json({ status: 'PAID', expiresAt: null, source: 'db' })
    }

    const client = new MercadoPagoConfig({ accessToken })
    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: paymentId })

    const statusMap: Record<string, string> = {
      approved: 'PAID',
      authorized: 'PAID',
      pending: 'PENDING',
      in_process: 'PENDING',
      in_mediation: 'PENDING',
      rejected: 'REJECTED',
      cancelled: 'CANCELLED',
      refunded: 'REFUNDED',
      charged_back: 'REFUNDED',
    }
    const status = statusMap[payment.status ?? ''] ?? 'PENDING'

    if (status === 'PAID' && reg && reg.payment_status !== 'paid') {
      await supabase
        .from('registrations')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          payment_method: 'pix',
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reg.id)
    }

    const result: Record<string, unknown> = {
      status,
      expiresAt: payment.date_of_expiration ?? null,
    }
    if (request.nextUrl.searchParams.get('_debug') === '1') {
      result._raw = payment
    }
    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('Erro ao verificar status:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao verificar pagamento' },
      { status: 500 }
    )
  }
}
