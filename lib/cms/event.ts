import { createClient, createServiceClient } from '@/lib/supabase/serverClient'

export async function getLatestEvent() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('year', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return null
  }

  return data
}

const SLUG_TO_SLOTS: Record<string, string> = {
  'geral-10k': 'slots_geral',
  'morador-10k': 'slots_morador',
  '60-mais-10k': 'slots_60plus',
  'infantil-2k': 'slots_infantil',
}

export interface EventConfigCategory {
  id: string
  name: string
  price: number
  isFree: boolean
  description: string
  spots: number
  ageMin: number
  ageMax?: number
}

export interface EventConfig {
  event: { year: number; price_geral?: number }
  categories: EventConfigCategory[]
}

/** Retorna evento e categorias no formato da API /api/event/config (para uso em Server Components) */
export async function getEventConfig(year = 2026): Promise<EventConfig | null> {
  try {
    const supabase = createServiceClient()

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('year', year)
      .single()

    if (eventError || !event) return null

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, slug, name, description, min_age, max_age, is_free, price, requires_residence_proof')
      .eq('event_id', event.id)
      .eq('is_active', true)
      .order('slug')

    if (catError) return null

    const slotsMap = {
      slots_geral: event.slots_geral ?? 500,
      slots_morador: event.slots_morador ?? 200,
      slots_60plus: event.slots_60plus ?? 100,
      slots_infantil: event.slots_infantil ?? 300,
    }
    const priceGeral = Number(event.price_geral) ?? 20

    const categoriesFormatted = (categories || []).map((c: any) => {
      const slug = c.slug
      const slotsKey = SLUG_TO_SLOTS[slug]
      const spots = slotsKey ? slotsMap[slotsKey as keyof typeof slotsMap] : 500
      const isFree = c.is_free ?? (slug !== 'geral-10k')
      const price = slug === 'geral-10k' ? priceGeral : 0

      return {
        id: slug,
        name: c.name?.replace('Infantil 2K', 'Infantil 2.5K')?.replace('Geral 10K', 'Prova Geral 10K') ?? c.name,
        price,
        isFree,
        description: c.description ?? '',
        spots,
        ageMin: c.min_age ?? 15,
        ageMax: c.max_age ?? undefined,
      }
    })

    return {
      event: { year: event.year, price_geral: priceGeral },
      categories: categoriesFormatted,
    }
  } catch {
    return null
  }
}

