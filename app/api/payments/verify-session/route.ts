import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // AbacatePay pode usar payment_id, session_id ou bill_id
    const paymentId = request.nextUrl.searchParams.get('payment_id')
      || request.nextUrl.searchParams.get('session_id')
      || request.nextUrl.searchParams.get('bill_id')

    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pagamento obrigatório' }, { status: 400 })
    }

    // TODO: Integrar com AbacatePay
    // GET /billing/get ou endpoint equivalente para verificar status do pagamento
    // Se status === 'PAID', buscar registration_id do metadata e retornar dados da inscrição

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Fallback: buscar inscrição pelo payment_id salvo
    const { data: reg, error } = await supabase
      .from('registrations')
      .select(`
        id,
        registration_number,
        confirmation_code,
        status,
        payment_status,
        category:categories ( name )
      `)
      .eq('payment_id', paymentId)
      .maybeSingle()

    if (error || !reg) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado ou ainda não confirmado. Consulte em Acompanhar Inscrição.' },
        { status: 404 }
      )
    }

    if (reg.payment_status !== 'paid' && reg.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Pagamento ainda não confirmado', payment_status: reg.payment_status },
        { status: 400 }
      )
    }

    const cat = reg.category as { name?: string } | null | undefined
    const categoryName = cat?.name || 'Prova Geral 10K'

    return NextResponse.json({
      registration_number: reg.registration_number,
      confirmation_code: reg.confirmation_code,
      category_name: categoryName,
      status: reg.status,
      payment_status: reg.payment_status,
    })
  } catch (err: unknown) {
    console.error('Erro ao verificar sessão:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao verificar pagamento' },
      { status: 500 }
    )
  }
}
