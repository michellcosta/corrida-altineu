import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ABACATEPAY_API = 'https://api.abacatepay.com/v1'

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
        { error: 'payment_id obrigatório' },
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

    const status = json.data?.status || 'PENDING'
    return NextResponse.json({
      status,
      expiresAt: json.data?.expiresAt,
    })
  } catch (err: unknown) {
    console.error('Erro ao verificar status:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao verificar pagamento' },
      { status: 500 }
    )
  }
}
