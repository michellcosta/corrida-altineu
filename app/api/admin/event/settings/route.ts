import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClientFromRequest, createServiceClient } from '@/lib/supabase/serverClient'

export const dynamic = 'force-dynamic'

const PATHS_TO_REVALIDATE = [
  '/',
  '/inscricao',
  '/inscricao/acompanhar',
  '/prova-10k',
  '/morador-10k',
  '/60-mais-10k',
  '/prova-kids',
]

/**
 * POST: Salva configurações do evento no Supabase (usa Service Role, bypassa RLS).
 * Requer autenticação SITE_ADMIN.
 */
export async function POST(request: Request) {
  try {
    const supabase = createClientFromRequest(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile || profile.role !== 'SITE_ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const data = await request.json()
    const anoProva = Number(data.anoProva ?? 2026)

    // Garantir que vagas sejam números válidos - SEMPRE incluir slots no update
    const n = (v: unknown, def: number) => {
      if (v == null || v === '') return def
      const num = Number(v)
      return Number.isNaN(num) ? def : num
    }
    const slotsGeral = n(data.vagasGeral, 500)
    const slotsMorador = n(data.vagasMorador, 200)
    const slots60plus = n(data.vagasSessenta, 100)
    const slotsInfantil = n(data.vagasInfantil, 300)

    const updatePayload: Record<string, unknown> = {
      edition: data.edicao,
      race_date: data.dataProva,
      start_time_10k: data.horaLargada10K ?? undefined,
      start_time_2k: data.horaLargada2K ?? undefined,
      location: data.localLargada,
      city: data.cidade,
      state: data.estado,
      slots_geral: slotsGeral,
      slots_morador: slotsMorador,
      slots_60plus: slots60plus,
      slots_infantil: slotsInfantil,
      price_geral: n(data.valorGeral, 22),
      registrations_open: data.inscricoesAbertas,
      registration_open_date: data.dataAberturaInscricoes
        ? new Date(data.dataAberturaInscricoes).toISOString()
        : null,
      registration_close_date: data.dataEncerramentoInscricoes
        ? new Date(data.dataEncerramentoInscricoes).toISOString()
        : null,
      total_prize: n(data.premiacaoTotal, 0),
      contact_email: data.contatoEmail ?? undefined,
      contact_phone: data.contatoTelefone ?? undefined,
      social_instagram: data.instagram ?? undefined,
    }

    const serviceClient = createServiceClient()
    const { data: updated, error: updateError } = await serviceClient
      .from('events')
      .update(updatePayload)
      .eq('year', anoProva)
      .select('id, slots_60plus, slots_geral, slots_morador, slots_infantil')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (!updated) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    for (const path of PATHS_TO_REVALIDATE) {
      revalidatePath(path)
    }

    return NextResponse.json({ success: true, slots_60plus: updated.slots_60plus })
  } catch (err) {
    console.error('Erro ao salvar evento:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao salvar' },
      { status: 500 }
    )
  }
}
