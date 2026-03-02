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

    console.log('[create-checkout] Recebido', { registrationId, amount, hasEmail: !!email?.trim(), hasFullName: !!fullName?.trim(), hasPhone: !!phone, hasTaxId: !!taxId })

    if (!registrationId) {
      console.warn('create-checkout 400: registrationId ausente', { body: { ...body, email: body?.email ? '[presente]' : '[ausente]' } })
      return NextResponse.json(
        { error: 'ID da inscrição não informado' },
        { status: 400 }
      )
    }
    if (!email?.trim()) {
      console.warn('create-checkout 400: e-mail ausente', { registrationId })
      return NextResponse.json(
        { error: 'E-mail é obrigatório para gerar o PIX. Edite os dados da inscrição.' },
        { status: 400 }
      )
    }

    const amountNum = Number(amount)
    const amountInCents = Math.round((Number.isNaN(amountNum) ? 20 : amountNum) * 100)

    if (amountInCents < 50) {
      console.warn('create-checkout 400: valor inválido', { amount, amountInCents, registrationId })
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

    console.log('[create-checkout] Enviando para AbacatePay', { amount: payload.amount })
    const res = await fetch(`${ABACATEPAY_API}/pixQrCode/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const json = await res.json()
    console.log('[create-checkout] AbacatePay resposta', { status: res.status, ok: res.ok, hasData: !!json?.data, hasId: !!json?.data?.id, hasBrCode: !!json?.data?.brCode, hasBrCodeBase64: !!json?.data?.brCodeBase64 })

    if (!res.ok) {
      const abacateError = json?.error || json?.message || JSON.stringify(json)
      console.error('AbacatePay create error:', { status: res.status, json })
      return NextResponse.json(
        { error: typeof abacateError === 'string' ? abacateError : 'Erro ao criar cobrança PIX' },
        { status: res.status }
      )
    }

    const data = json.data
    if (!data?.id || !data?.brCode || !data?.brCodeBase64) {
      console.error('AbacatePay resposta incompleta:', JSON.stringify({ id: data?.id, hasBrCode: !!data?.brCode, hasBrCodeBase64: !!data?.brCodeBase64 }))
      return NextResponse.json(
        { error: 'Resposta inválida da AbacatePay' },
        { status: 500 }
      )
    }

    // Garantir que brCodeBase64 seja data URL válida para <img src>
    let brCodeBase64 = String(data.brCodeBase64 || '')
    if (brCodeBase64 && !brCodeBase64.startsWith('data:')) {
      brCodeBase64 = `data:image/png;base64,${brCodeBase64}`
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

    console.log('[create-checkout] Sucesso', { paymentId: data.id, registrationId })
    return NextResponse.json({
      id: data.id,
      brCode: data.brCode,
      brCodeBase64,
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
