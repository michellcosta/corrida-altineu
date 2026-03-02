import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SLUG_TO_FRONTEND_ID: Record<string, string> = {
  'geral-10k': 'geral-10k',
  'morador-10k': 'morador-10k',
  '60-mais-10k': 'sessenta-10k',
  'infantil-2k': 'infantil-2k',
}

const SLUG_TO_EVENT_SLOTS: Record<string, keyof { slots_geral: number; slots_morador: number; slots_60plus: number; slots_infantil: number }> = {
  'geral-10k': 'slots_geral',
  'morador-10k': 'slots_morador',
  '60-mais-10k': 'slots_60plus',
  'infantil-2k': 'slots_infantil',
}

const DEFAULT_DOCUMENTS: Record<string, string[]> = {
  'geral-10k': ['Documento oficial com foto'],
  'morador-10k': ['Documento oficial com foto', 'Comprovante de residência emitido nos últimos 90 dias'],
  '60-mais-10k': ['Documento oficial com foto'],
  'infantil-2k': ['Documento da criança (certidão ou RG)', 'Termo de autorização assinado pelo responsável'],
}

/**
 * Retorna configuração do evento e categorias para a página de inscrição.
 * Alimentado pelos dados da página /admin/site/settings/event.
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('year', 2026)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug, name, description, min_age, max_age, is_free, price, requires_residence_proof, requires_guardian_authorization')
      .eq('event_id', event.id)
      .eq('is_active', true)
      .order('slug')

    if (catError) {
      console.error('Erro ao carregar categorias:', catError)
      return NextResponse.json({ error: 'Erro ao carregar categorias' }, { status: 500 })
    }

    const year = event.year
    const slotsMap = {
      slots_geral: event.slots_geral ?? 500,
      slots_morador: event.slots_morador ?? 200,
      slots_60plus: event.slots_60plus ?? 100,
      slots_infantil: event.slots_infantil ?? 300,
    }
    const priceGeral = Number(event.price_geral) ?? 20

    const categoriesFormatted = (categories || []).map((c: any) => {
      const slug = c.slug
      const slotsKey = SLUG_TO_EVENT_SLOTS[slug]
      const spots = slotsKey ? slotsMap[slotsKey] : c.total_slots ?? 500
      const isFree = c.is_free ?? (slug !== 'geral-10k')
      const price = slug === 'geral-10k' ? priceGeral : 0

      return {
        id: SLUG_TO_FRONTEND_ID[slug] ?? slug,
        name: c.name?.replace('Infantil 2K', 'Infantil 2.5K')?.replace('Geral 10K', 'Prova Geral 10K') ?? c.name,
        price,
        isFree,
        description: c.description ?? '',
        spots,
        ageMin: c.min_age ?? 15,
        ageMax: c.max_age ?? undefined,
        documents: DEFAULT_DOCUMENTS[slug] ?? ['Documento oficial com foto'],
        requiresGuardian: c.requires_guardian_authorization ?? (slug === 'infantil-2k'),
        requiresResidenceProof: c.requires_residence_proof ?? (slug === 'morador-10k'),
      }
    })

    const CATEGORY_ORDER = ['geral-10k', 'sessenta-10k', 'morador-10k', 'infantil-2k']
    const sorted = [...categoriesFormatted].sort((a, b) => {
      const i = CATEGORY_ORDER.indexOf(a.id)
      const j = CATEGORY_ORDER.indexOf(b.id)
      return (i === -1 ? 999 : i) - (j === -1 ? 999 : j)
    })

    return NextResponse.json(
      {
      event: {
        year: event.year,
        edition: event.edition,
        raceDate: event.race_date,
        raceDateFormatted: event.race_date
          ? new Date(event.race_date + 'T12:00:00').toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '',
        location: event.location,
        city: event.city,
        state: event.state,
        registrationsOpen: event.registrations_open ?? false,
        registrationOpenDate: event.registration_open_date,
        registrationCloseDate: event.registration_close_date,
        contactEmail: event.contact_email,
        contactPhone: event.contact_phone,
      },
      categories: sorted,
    },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  } catch (err: unknown) {
    console.error('Erro ao carregar config do evento:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
