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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // 1. Verifica no nosso DB primeiro (webhook pode ter atualizado)
    const { data: reg } = await supabase
      .from('registrations')
      .select('id, payment_status, status')
      .eq('payment_id', paymentId)
      .maybeSingle()

    if (reg?.payment_status === 'paid') {
      return NextResponse.json({ status: 'PAID', expiresAt: null, source: 'db' })
    }

    // 2. Consulta AbacatePay
    const res = await fetch(
      `${ABACATEPAY_API}/pixQrCode/check?id=${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        cache: 'no-store',
      }
    )

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error || 'Erro ao consultar status' },
        { status: res.status }
      )
    }

    // AbacatePay pode retornar status em data.status ou data.pixQrCode?.status
    const rawStatus = json.data?.status ?? json.data?.pixQrCode?.status ?? json.status ?? 'PENDING'
    const status = typeof rawStatus === 'string'
      ? rawStatus.toUpperCase().replace('PAGO', 'PAID')
      : 'PENDING'
    const expiresAt = json.data?.expiresAt ?? json.data?.pixQrCode?.expiresAt

    // Se PAID, atualiza a inscrição no DB (fallback caso webhook não tenha chegado)
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

    const result: Record<string, unknown> = { status, expiresAt }
    if (request.nextUrl.searchParams.get('_debug') === '1') {
      result._raw = json
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
