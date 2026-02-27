import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ABACATEPAY_API = 'https://api.abacatepay.com/v1'

/**
 * Checa status do PIX via AbacatePay GET /pixQrCode/check
 * @see https://docs.abacatepay.com/pages/pix-qrcode/check
 * Status: PENDING | EXPIRED | CANCELLED | PAID | REFUNDED
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ABACATEPAY_API_KEY
    const paymentId = request.nextUrl.searchParams.get('payment_id') || request.nextUrl.searchParams.get('id')

    if (!apiKey) {
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

    const res = await fetch(
      `${ABACATEPAY_API}/pixQrCode/check?id=${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    )

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error || 'Erro ao consultar status' },
        { status: res.status }
      )
    }

    const rawStatus = json.data?.status || 'PENDING'
    const status = typeof rawStatus === 'string' ? rawStatus.toUpperCase().replace('PAGO', 'PAID') : 'PENDING'
    const expiresAt = json.data?.expiresAt

    // Se PAID, atualiza a inscrição no DB (fallback caso webhook não tenha chegado)
    if (status === 'PAID') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      )
      const { data: reg } = await supabase
        .from('registrations')
        .select('id, payment_status, status')
        .eq('payment_id', paymentId)
        .single()

      if (reg && reg.payment_status !== 'paid') {
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
    }

    return NextResponse.json({
      status,
      expiresAt,
    })
  } catch (err: unknown) {
    console.error('Erro ao verificar status:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao verificar pagamento' },
      { status: 500 }
    )
  }
}
