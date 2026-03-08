import { NextRequest, NextResponse } from 'next/server'
import { unstable_noStore } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/serverClient'

export const dynamic = 'force-dynamic'

const CATEGORY_SLUGS = ['geral-10k', '60-mais-10k'] as const

function getAge(birthDate: string | null | undefined, cutoffYear: number): number | null {
  if (!birthDate) return null
  const str = String(birthDate).slice(0, 10)
  const match = str.match(/^(\d{4})-\d{2}-\d{2}$/)
  if (!match) return null
  return cutoffYear - parseInt(match[1], 10)
}

function parseNetTimeToSeconds(netTime: string | null | undefined): number | null {
  if (!netTime) return null
  const s = String(netTime).trim()
  const m = s.match(/^(\d+):(\d{2}):(\d{2})$/)
  if (m) return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10)
  const m2 = s.match(/^(\d+):(\d{2})$/)
  if (m2) return parseInt(m2[1], 10) * 60 + parseInt(m2[2], 10)
  return null
}

function formatNetTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export async function GET(request: NextRequest) {
  unstable_noStore()
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')?.trim()
    const year = yearParam ? parseInt(yearParam, 10) : 2026
    const cutoffYear = year
    const isExport = searchParams.get('export') === '1'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = isExport
      ? Math.min(5000, Math.max(1, parseInt(searchParams.get('limit') || '5000', 10)))
      : Math.min(60, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const categoria = searchParams.get('categoria')?.trim() || 'todos'
    const search = searchParams.get('search')?.trim() || ''
    const sexo = searchParams.get('sexo')?.trim() || ''

    const supabase = createServiceClient()

    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('year', year)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const categorySlugs = CATEGORY_SLUGS

    // Stats: best times and completion rate (always over full event, no filters)
    const [statsResults, statsRegistrations] = await Promise.all([
      supabase
        .from('results')
        .select(
          `
          net_time,
          registration:registrations(athlete:athletes(gender))
        `
        )
        .eq('event_id', event.id)
        .eq('disqualified', false),
      supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .in('status', ['confirmed', 'paid']),
    ])

    type StatsRow = {
      net_time: string | null
      registration?: { athlete?: { gender?: string } }
    }
    const allForStats = (statsResults.data || []) as StatsRow[]
    let bestTimeM: number | null = null
    let bestTimeF: number | null = null
    for (const r of allForStats) {
      const sec = parseNetTimeToSeconds(r.net_time)
      if (sec == null) continue
      const g = r.registration?.athlete?.gender
      if (g === 'M') bestTimeM = bestTimeM == null ? sec : Math.min(bestTimeM, sec)
      else if (g === 'F') bestTimeF = bestTimeF == null ? sec : Math.min(bestTimeF, sec)
    }
    const totalRegistrations = statsRegistrations.count ?? 0
    const totalResults = allForStats.length
    const completionRate =
      totalRegistrations > 0 ? Math.round((totalResults / totalRegistrations) * 100) : null

    let query = supabase
      .from('results')
      .select(
        `
        id, bib_number, net_time, position_overall, position_category, position_gender, certificate_url,
        registration:registrations(
          athlete:athletes(full_name, birth_date, gender, city, team_name),
          category:categories(name, slug)
        )
      `,
      )
      .eq('event_id', event.id)
      .eq('disqualified', false)

    if (categoria !== 'todos' && categorySlugs.includes(categoria)) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('event_id', event.id)
        .eq('slug', categoria)
        .single()
      if (cat) {
        query = query.eq('category_id', cat.id)
      }
    }

    const { data: rawResults, error } = await query.order('position_overall', {
      ascending: true,
      nullsFirst: false,
    })

    if (error) {
      console.error('Erro ao buscar resultados:', error)
      return NextResponse.json({ error: 'Erro ao buscar resultados' }, { status: 500 })
    }

    type RawResult = {
      id: string
      bib_number: number
      net_time: string | null
      position_overall: number | null
      position_category: number | null
      position_gender: number | null
      certificate_url: string | null
      registration?: {
        athlete?: {
          full_name?: string
          birth_date?: string
          gender?: string
          city?: string
          team_name?: string
        }
        category?: { name?: string; slug?: string }
      }
    }

    let filtered = (rawResults || []) as RawResult[]

    if (search) {
      const term = search.toLowerCase()
      const termNum = search.replace(/\D/g, '')
      filtered = filtered.filter((r) => {
        const nome = (r.registration?.athlete?.full_name || '').toLowerCase()
        const bib = String(r.bib_number)
        if (nome.includes(term)) return true
        if (bib.includes(term) || (termNum && bib.includes(termNum))) return true
        return false
      })
    }

    if (sexo && (sexo === 'M' || sexo === 'F')) {
      filtered = filtered.filter((r) => r.registration?.athlete?.gender === sexo)
    }

    filtered = [...filtered].sort((a, b) => {
      const sa = parseNetTimeToSeconds(a.net_time) ?? 999999
      const sb = parseNetTimeToSeconds(b.net_time) ?? 999999
      return sa - sb
    })

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const from = (page - 1) * limit
    const to = from + limit
    const pageData = filtered.slice(from, to)

    const data = pageData.map((r, i) => {
      const athlete = r.registration?.athlete
      const age = getAge(athlete?.birth_date, cutoffYear)
      const seconds = parseNetTimeToSeconds(r.net_time)
      const netTimeStr = seconds != null ? formatNetTime(seconds) : null

      return {
        id: r.id,
        position_overall: from + i + 1,
        bib_number: r.bib_number,
        full_name: athlete?.full_name ?? '-',
        gender: athlete?.gender ?? '-',
        age: age ?? '-',
        team_name: athlete?.team_name ?? '-',
        net_time: netTimeStr ?? '-',
        certificate_url: r.certificate_url ?? null,
      }
    })

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages,
      year,
      bestTimeM: bestTimeM != null ? formatNetTime(bestTimeM) : null,
      bestTimeF: bestTimeF != null ? formatNetTime(bestTimeF) : null,
      completionRate,
    })
  } catch (err) {
    console.error('Erro em /api/resultados:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
