import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Busca inscrição por CPF, RG ou código de confirmação.
 * Usa service role para permitir busca pública (RLS bloqueia usuários não autenticados).
 * Retorna apenas dados necessários para o comprovante.
 */
export async function POST(request: NextRequest) {
  try {
    const { cpf, rg, codigo } = (await request.json()) as {
      cpf?: string
      rg?: string
      codigo?: string
    }

    const searchCodigo = codigo?.toString().trim()
    const searchDoc = (cpf?.toString().trim() || rg?.toString().trim() || '').replace(/\D/g, '')

    if (!searchCodigo && !searchDoc) {
      return NextResponse.json({ error: 'Informe CPF, RG ou código' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    let athleteIds: string[] = []

    if (searchCodigo) {
      const { data: regs } = await supabase
        .from('registrations')
        .select('id, registration_number, confirmation_code, status, bib_number, kit_picked_at, athlete_id')
        .eq('event_id', event.id)
        .eq('confirmation_code', searchCodigo)
        .limit(5)
      if (regs?.length) {
        const { data: fullRegs } = await supabase
          .from('registrations')
          .select(
            `
            id, registration_number, confirmation_code, status, bib_number, kit_picked_at,
            athlete:athletes(full_name, email),
            category:categories(name)
          `
          )
          .in('id', regs.map((r) => r.id))
        const list = (fullRegs || []).map((r: any) => ({
          id: r.id,
          registration_number: r.registration_number,
          confirmation_code: r.confirmation_code,
          status: r.status,
          bib_number: r.bib_number,
          kit_picked_at: r.kit_picked_at,
          athlete_name: r.athlete?.full_name,
          category_name: r.category?.name,
        }))
        return NextResponse.json({ data: list })
      }
    } else if (searchDoc) {
      const { data: athletes } = await supabase
        .from('athletes')
        .select('id')
        .eq('document_number', searchDoc)
        .limit(10)
      athleteIds = (athletes || []).map((a) => a.id)
    }

    if (athleteIds.length === 0 && !searchCodigo) {
      return NextResponse.json({ data: [] })
    }

    let regQuery = supabase
      .from('registrations')
      .select(
        `
        id, registration_number, confirmation_code, status, bib_number, kit_picked_at,
        athlete:athletes(full_name, email),
        category:categories(name)
      `
      )
      .eq('event_id', event.id)

    if (athleteIds.length > 0) {
      regQuery = regQuery.in('athlete_id', athleteIds)
    }

    const { data: regs, error } = await regQuery.order('registered_at', { ascending: false }).limit(5)

    if (error) {
      console.error('Erro ao buscar inscrição:', error)
      return NextResponse.json({ error: 'Erro ao buscar' }, { status: 500 })
    }

    const list = (regs || []).map((r: any) => ({
      id: r.id,
      registration_number: r.registration_number,
      confirmation_code: r.confirmation_code,
      status: r.status,
      bib_number: r.bib_number,
      kit_picked_at: r.kit_picked_at,
      athlete_name: r.athlete?.full_name,
      category_name: r.category?.name,
    }))

    return NextResponse.json({ data: list })
  } catch (err: any) {
    console.error('Erro:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
