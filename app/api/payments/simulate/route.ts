import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Simula pagamento PIX (apenas modo teste - MERCADOPAGO_ACCESS_TOKEN começa com TEST-).
 * Útil para testes em desenvolvimento sem pagar de verdade.
 * Atualiza a inscrição no DB para status paid.
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      return NextResponse.json(
        { error: 'MERCADOPAGO_ACCESS_TOKEN não configurado' },
        { status: 500 }
      )
    }

    if (!accessToken.startsWith('TEST-')) {
      return NextResponse.json(
        { error: 'Simulação só funciona com credenciais de teste (TEST-)' },
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: reg } = await supabase
      .from('registrations')
      .select('id, payment_status')
      .eq('payment_id', String(paymentId))
      .maybeSingle()

    if (!reg) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada para este payment_id' },
        { status: 404 }
      )
    }

    if (reg.payment_status === 'paid') {
      return NextResponse.json({ success: true, status: 'PAID', message: 'Já estava pago' })
    }

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

    return NextResponse.json({ success: true, status: 'PAID', simulated: true })
  } catch (err: unknown) {
    console.error('Erro ao simular:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao simular' },
      { status: 500 }
    )
  }
}
