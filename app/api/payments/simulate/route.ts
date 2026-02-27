import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ABACATEPAY_API = 'https://api.abacatepay.com/v1'

/**
 * Simula pagamento PIX (apenas chave abc_dev_).
 * Útil para testes em desenvolvimento.
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

    const json = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.error || 'Erro ao simular pagamento' },
        { status: res.status }
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
