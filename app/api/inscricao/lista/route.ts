import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Lista inscritos por categoria para o evento atual.
 * Retorna nome completo e data de nascimento.
 * Filtro opcional por categoria (slug).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('categoria')?.trim()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('year', 2026)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const { data: regs, error } = await supabase
      .from('registrations')
      .select(
        `
        id, registration_number, status,
        athlete:athletes(full_name, birth_date),
        category:categories(id, name, slug)
      `
      )
      .eq('event_id', event.id)
      .order('registered_at', { ascending: true })

    if (error) {
      console.error('Erro ao listar inscritos:', error)
      return NextResponse.json({ error: 'Erro ao listar inscritos' }, { status: 500 })
    }

    type RegItem = {
      id: string
      registration_number: string | null
      status: string
      athlete?: { full_name?: string; birth_date?: string } | { full_name?: string; birth_date?: string }[] | null
      category?: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null
    }

    const getAthlete = (r: RegItem) => (Array.isArray(r.athlete) ? r.athlete[0] : r.athlete)
    const getCategory = (r: RegItem) => (Array.isArray(r.category) ? r.category[0] : r.category)

    const excludedStatuses = ['cancelled', 'rejected']
    let list = (regs || [])
      .filter((r: RegItem) => !excludedStatuses.includes(r.status))
      .map((r: RegItem) => ({
        id: r.id,
        registration_number: r.registration_number,
        status: r.status,
        full_name: getAthlete(r)?.full_name ?? '',
        birth_date: getAthlete(r)?.birth_date ?? null,
        category_name: getCategory(r)?.name ?? '',
        category_slug: getCategory(r)?.slug ?? '',
      }))

    if (categorySlug) {
      list = list.filter((item) => item.category_slug === categorySlug)
    }

    const byCategory = list.reduce<Record<string, typeof list>>((acc, item) => {
      const key = item.category_slug || 'outros'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})

    const categories = Object.entries(byCategory).map(([slug, items]) => ({
      slug,
      name: items[0]?.category_name ?? slug,
      count: items.length,
      inscritos: items.map((i) => ({
        id: i.id,
        registration_number: i.registration_number,
        full_name: i.full_name,
        birth_date: i.birth_date
          ? new Date(i.birth_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : null,
      })),
    }))

    return NextResponse.json({ data: categories })
  } catch (err: unknown) {
    console.error('Erro:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
