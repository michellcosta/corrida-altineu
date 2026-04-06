import { NextRequest, NextResponse } from 'next/server'
import { unstable_noStore } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/serverClient'
import { getCountryLabel } from '@/lib/countries'
import { CURRENT_EVENT_YEAR } from '@/lib/eventYear'
import { formatDateOnly } from '@/lib/formatDate'

export const dynamic = 'force-dynamic'

/** Top N exibido na lista pública (municípios BR e países). */
const TOP_MUNICIPIOS = 5
const TOP_PAISES = 5

/** Município (BR): cidade - UF ou cidade. Estrangeiros não entram aqui. */
function formatMunicipio(athlete: {
  city?: string | null
  state?: string | null
  country?: string | null
}): string | null {
  if (athlete?.country && athlete.country !== 'BRA') return null
  if (athlete?.city && athlete?.state) return `${athlete.city} - ${athlete.state}`
  if (athlete?.city) return athlete.city
  return null
}

function formatPais(athlete: { country?: string | null }): string | null {
  if (!athlete?.country) return null
  return getCountryLabel(athlete.country)
}

type AthleteRow = {
  gender?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

type RegItem = {
  id: string
  athlete_id: string
  category_id?: string
  registration_number: string | null
  confirmation_code: string | null
  status: string
  payment_status?: string | null
  bib_number: number | null
  notes: string | null
}

function buildPublicRankings(
  allRegs: RegItem[],
  athleteMap: Map<string, unknown>,
  isConfirmed: (s: string) => boolean
) {
  const confirmedList = allRegs.filter((r) => isConfirmed(r.status))
  const totalConfirmados = confirmedList.length

  const byMunicipio: Record<string, number> = {}
  const byPais: Record<string, number> = {}
  let masculino = 0
  let feminino = 0
  let outros = 0

  for (const r of confirmedList) {
    const a = athleteMap.get(r.athlete_id) as AthleteRow | undefined
    if (!a) continue
    const muni = formatMunicipio(a)
    if (muni) byMunicipio[muni] = (byMunicipio[muni] || 0) + 1
    const pais = formatPais(a)
    if (pais) byPais[pais] = (byPais[pais] || 0) + 1
    const g = (a.gender ?? 'M').toUpperCase()
    if (g === 'M') masculino++
    else if (g === 'F') feminino++
    else outros++
  }

  const topN = (rec: Record<string, number>, n: number) =>
    Object.entries(rec)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([label, count]) => ({ label, count }))

  return {
    totalConfirmados,
    municipios: topN(byMunicipio, TOP_MUNICIPIOS),
    paises: topN(byPais, TOP_PAISES),
    genero: { masculino, feminino, outros },
  }
}

/**
 * Lista inscritos por categoria para o evento atual.
 * - Público (sem ?admin=1): retorna apenas confirmados, agrupados por categoria.
 * - Admin (?admin=1 + auth SITE_ADMIN): retorna todos com dados completos.
 */
export async function GET(request: NextRequest) {
  unstable_noStore()
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('categoria')?.trim()
    const search = searchParams.get('search')?.trim() || ''
    const isAdmin = searchParams.get('admin') === '1'

    const supabaseService = createServiceClient()

    const { data: event } = await supabaseService
      .from('events')
      .select('id, edition')
      .eq('year', CURRENT_EVENT_YEAR)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    if (isAdmin) {
      const supabaseAuth = createClient()
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }
      const { data: profile } = await supabaseAuth
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()
      const ALLOWED_ADMIN_ROLES = ['SITE_ADMIN', 'CHIP_ADMIN', 'ORG_ADMIN']
      if (!profile || !ALLOWED_ADMIN_ROLES.includes(profile.role)) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Para admin: só categorias ativas. Para lista pública: todas (inclui Infantil mesmo se inativa por engano)
    const { data: cats } = await supabaseService
      .from('categories')
      .select('id, name, slug, is_active')
      .eq('event_id', event.id)
      .order('name')

    const { data: regsRaw, error } = await supabaseService
      .from('registrations')
      .select(`
        id, athlete_id, category_id, registration_number, confirmation_code, status, payment_status, bib_number, notes,
        athlete:athletes(id, full_name, email, phone, birth_date, gender, city, state, country, team_name, tshirt_size, document_number)
      `)
      .eq('event_id', event.id)
      .order('registered_at', { ascending: isAdmin ? false : true })
      .limit(10000)

    if (error) {
      console.error('Erro ao listar inscritos:', error)
      return NextResponse.json({ error: 'Erro ao listar inscritos' }, { status: 500 })
    }

    const regs = (regsRaw || []).map((r: any) => ({
      ...r,
      athlete: Array.isArray(r.athlete) ? r.athlete[0] : r.athlete,
    }))

    const athleteMap = new Map(regs.map((r: any) => [r.athlete_id as string, r.athlete]).filter(([, a]: any) => a))

    const catMap = new Map((cats || []).map((c: { id: string; name: string; slug?: string }) => [c.id, { id: c.id, name: c.name, slug: c.slug || '' }]))

    const isConfirmed = (s: string) => {
      const v = (s || '').toLowerCase().trim()
      return v === 'confirmed' || v === 'confirmado' || v.includes('confirm')
    }

    const allRegs = (regs || []) as RegItem[]

    if (isAdmin) {
      const merged = allRegs.map((r: any) => {
        const cat = r.category_id ? catMap.get(r.category_id) : null
        return {
          ...r,
          category: cat ? { id: cat.id, name: cat.name } : null,
        }
      })
      const total = merged.length
      const confirmed = merged.filter((r) => isConfirmed(r.status)).length
      const pending = merged.filter((r) =>
        ['pending', 'pending_payment', 'pending_documents', 'under_review'].includes(r.status)
      ).length
      const numerados = merged.filter((r) => r.bib_number != null).length

      return NextResponse.json({
        registrations: merged,
        categories: (cats || []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })),
        stats: { total, confirmed, pending, numerados },
        edition: event.edition ?? 51,
      })
    }

    // Lista pública: iterar por categorias do banco (fonte da verdade) e incluir inscritos confirmados
    const confirmedRegs = allRegs.filter((r: any) => isConfirmed(r.status)).map((r: any) => {
      const athlete = r.athlete as { full_name?: string; birth_date?: string | number; document_number?: string } | undefined
      const cat = r.category_id ? catMap.get(r.category_id) : null
      return {
        id: r.id,
        registration_number: r.registration_number,
        confirmation_code: r.confirmation_code ?? null,
        status: r.status,
        full_name: athlete?.full_name ?? '',
        birth_date: formatDateOnly(athlete?.birth_date) || null,
        document_number: athlete?.document_number ?? null,
        category_id: r.category_id,
        category_slug: cat?.slug ?? 'outros',
        category_name: cat?.name ?? 'Outros',
      }
    })

    // Filtro de busca: nome, CPF/RG ou código (document_number não é retornado na resposta)
    let regsToUse = confirmedRegs
    if (search) {
      const term = search.toLowerCase().trim()
      const termDigits = search.replace(/\D/g, '')
      regsToUse = confirmedRegs.filter((r) => {
        if (r.full_name?.toLowerCase().includes(term)) return true
        if (r.confirmation_code?.toLowerCase() === term) return true
        if (termDigits.length >= 4 && r.document_number) {
          const docDigits = String(r.document_number).replace(/\D/g, '')
          if (docDigits.includes(termDigits) || termDigits.includes(docDigits)) return true
        }
        return false
      })
    }

    // Lista pública: apenas estas categorias, na ordem definida
    const PUBLIC_CATEGORY_SLUGS = ['geral-10k', '60-mais-10k', 'morador-10k', 'infantil-2k']
    const CATEGORY_ORDER = ['geral-10k', '60-mais-10k', 'morador-10k', 'infantil-2k']
    const categoriesList = (cats || []) as { id: string; name: string; slug?: string }[]
    const categoriesRaw = categoriesList
      .filter((c) => PUBLIC_CATEGORY_SLUGS.includes(c.slug || ''))
      .filter((c) => !categorySlug || categorySlug === (c.slug || ''))
      .map((c) => {
        const slug = c.slug || c.id
        const items = regsToUse.filter((r) => r.category_id && String(r.category_id) === String(c.id))
        const inscritosOrdenados = [...items].sort((a, b) => {
          const nameA = (a.full_name || '').toLowerCase().trim()
          const nameB = (b.full_name || '').toLowerCase().trim()
          return nameA.localeCompare(nameB, 'pt-BR')
        })
        return {
          slug,
          name: c.name,
          count: items.length,
          inscritos: inscritosOrdenados.map((i) => ({
            id: i.id,
            registration_number: i.registration_number,
            full_name: i.full_name,
            birth_date: i.birth_date,
          })),
        }
      })
      .filter((cat) => cat.count > 0 || (categorySlug && categorySlug === cat.slug))

    // Ordenar por CATEGORY_ORDER para garantir ordem consistente
    const categories = [...categoriesRaw].sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a.slug)
      const idxB = CATEGORY_ORDER.indexOf(b.slug)
      return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99)
    })

    // Incluir em "outros" todos os confirmados que não estão nas 4 categorias principais
    const regsWithUnknownCategory = regsToUse.filter((r) => {
      if (!r.category_id) return true
      const cat = catMap.get(r.category_id)
      if (!cat) return true
      return !PUBLIC_CATEGORY_SLUGS.includes(cat.slug)
    })
    if (regsWithUnknownCategory.length > 0) {
      const outrosSlug = 'outros'
      if (!categories.some((c) => c.slug === outrosSlug)) {
        const outrosOrdenados = [...regsWithUnknownCategory].sort((a, b) => {
          const nameA = (a.full_name || '').toLowerCase().trim()
          const nameB = (b.full_name || '').toLowerCase().trim()
          return nameA.localeCompare(nameB, 'pt-BR')
        })
        categories.push({
          slug: outrosSlug,
          name: 'Outros',
          count: regsWithUnknownCategory.length,
          inscritos: outrosOrdenados.map((i) => ({
            id: i.id,
            registration_number: i.registration_number,
            full_name: i.full_name,
            birth_date: i.birth_date,
          })),
        })
      }
    }

    const rankings = buildPublicRankings(allRegs, athleteMap, isConfirmed)

    const debug = searchParams.get('_debug') === '1'
    const payload: Record<string, unknown> = {
      data: categories,
      edition: event.edition ?? 51,
      rankings,
    }
    if (debug) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? '?'
      payload._debug = {
        supabaseProjectRef: projectRef,
        totalRegs: allRegs.length,
        confirmedCount: confirmedRegs.length,
        categoriesFromDb: categoriesList.length,
        regs: allRegs.map((r) => ({
          registration_number: r.registration_number,
          status: r.status,
          category_id: r.category_id,
          category_slug: r.category_id ? catMap.get(r.category_id)?.slug : null,
          isConfirmed: isConfirmed(r.status),
        })),
      }
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    })
  } catch (err: unknown) {
    console.error('Erro:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
