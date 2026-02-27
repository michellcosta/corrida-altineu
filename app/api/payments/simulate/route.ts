import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ABACATEPAY_API = 'https://api.abacatepay.com/v1'

/**
 * Simula pagamento PIX (apenas chave abc_dev_).
 * Útil para testes em desenvolvimento.
 * Se AbacatePay retornar "Insufficient permissions", faz fallback: atualiza a inscrição no DB.
 * @see https://docs.abacatepay.com/api-reference/simular-pagamento
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ABACATEPAY_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ABACATEPAY_API_KEY não configurada' },
        { status: 500 }
      )
    }

    if (!apiKey.startsWith('abc_dev_')) {
      return NextResponse.json(
        { error: 'Simulação só funciona com chave de desenvolvimento (abc_dev_)' },
        { status: 403 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const paymentId = body.payment_id ?? body.id ?? request.nextUrl.searchParams.get('payment_id') ?? request.nextUrl.searchParams.get('id')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'payment_id ou id obrigatório' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `${ABACATEPAY_API}/pixQrCode/simulate-payment?id=${encodeURIComponent(paymentId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ metadata: {} }),
      }
    )

    const json = await res.json().catch(() => ({}))
    const apiError = json?.error ?? json?.message
    const isInsufficientPermissions = typeof apiError === 'string' && apiError.toLowerCase().includes('insufficient permissions')

    if (!res.ok || (json?.success === false && apiError)) {
      if (isInsufficientPermissions) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        )
        const { data: reg } = await supabase
          .from('registrations')
          .select('id, payment_status')
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
          return NextResponse.json({ success: true, status: 'PAID', fallback: true })
        }
      }
      const message = apiError || `Erro ao simular (${res.status})`
      console.error('[simulate] AbacatePay error:', { status: res.status, json })
      return NextResponse.json(
        { error: message, details: json },
        { status: res.ok ? 502 : res.status }
      )
    }

    return NextResponse.json({
      success: true,
      status: json.data?.status ?? 'PAID',
    })
  } catch (err: unknown) {
    console.error('Erro ao simular:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao simular' },
      { status: 500 }
    )
  }
}
