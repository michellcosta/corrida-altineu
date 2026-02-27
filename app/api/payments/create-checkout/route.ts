import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ABACATEPAY_API = 'https://api.abacatepay.com/v1'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ABACATEPAY_API_KEY

    if (!apiKey) {
      console.error('ABACATEPAY_API_KEY não configurada')
      return NextResponse.json(
        { error: 'Pagamento não configurado. Configure AbacatePay.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      registrationId,
      amount,
      email,
      fullName,
      phone,
      taxId,
    } = body

    if (!registrationId || !amount || !email?.trim()) {
      return NextResponse.json(
        { error: 'Dados incompletos para pagamento' },
        { status: 400 }
      )
    }

    const amountInCents = Math.round(Number(amount) * 100)

    if (amountInCents < 50) {
      return NextResponse.json(
        { error: 'Valor mínimo para PIX é R$ 0,50' },
        { status: 400 }
      )
    }

    const payload: Record<string, unknown> = {
      amount: amountInCents,
      expiresIn: 3600,
      description: 'Inscrição 51ª Corrida Rústica de Macuco',
      metadata: {
        registration_id: registrationId,
      },
    }

    if (fullName?.trim() && phone?.trim() && taxId) {
      const taxIdDigits = String(taxId).replace(/\D/g, '')
      if (taxIdDigits.length >= 11) {
        payload.customer = {
          name: fullName.trim(),
          cellphone: String(phone).trim(),
          email: email.trim().toLowerCase(),
          taxId: taxIdDigits.length === 11
            ? `${taxIdDigits.slice(0, 3)}.${taxIdDigits.slice(3, 6)}.${taxIdDigits.slice(6, 9)}-${taxIdDigits.slice(9, 11)}`
            : taxIdDigits,
        }
      }
    }

    const res = await fetch(`${ABACATEPAY_API}/pixQrCode/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const json = await res.json()

    if (!res.ok) {
      console.error('AbacatePay create error:', json)
      return NextResponse.json(
        { error: json?.error || 'Erro ao criar cobrança PIX' },
        { status: res.status }
      )
    }

    const data = json.data
    if (!data?.id || !data?.brCode || !data?.brCodeBase64) {
      return NextResponse.json(
        { error: 'Resposta inválida da AbacatePay' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    await supabase
      .from('registrations')
      .update({
        payment_id: data.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId)

    return NextResponse.json({
      id: data.id,
      brCode: data.brCode,
      brCodeBase64: data.brCodeBase64,
      amount: data.amount,
      expiresAt: data.expiresAt,
    })
  } catch (err: unknown) {
    console.error('Erro ao criar checkout:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao processar pagamento' },
      { status: 500 }
    )
  }
}
