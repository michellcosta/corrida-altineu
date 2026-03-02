import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/serverClient'

export const dynamic = 'force-dynamic'

/**
 * Lista inscritos por categoria para o evento atual.
 * - Público (sem ?admin=1): retorna apenas confirmados, agrupados por categoria.
 * - Admin (?admin=1 + auth SITE_ADMIN): retorna todos com dados completos.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('categoria')?.trim()
    const isAdmin = searchParams.get('admin') === '1'

    const supabaseService = createServiceClient()

    const { data: event } = await supabaseService
      .from('events')
      .select('id, edition')
      .eq('year', 2026)
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
      if (!profile || profile.role !== 'SITE_ADMIN') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    const { data: cats } = await supabaseService
      .from('categories')
      .select('id, name, slug')
      .eq('event_id', event.id)
      .order('name')

    const { data: regs, error } = await supabaseService
      .from('registrations')
      .select('id, athlete_id, category_id, registration_number, status, bib_number, notes')
      .eq('event_id', event.id)
      .order('registered_at', { ascending: isAdmin ? false : true })

    const athleteIds = [...new Set((regs || []).map((r: { athlete_id: string }) => r.athlete_id))]

    const { data: athletes } = athleteIds.length > 0
      ? await supabaseService.from('athletes').select('id, full_name, email, phone, birth_date, gender, city, state, country, team_name, tshirt_size').in('id', athleteIds)
      : { data: [] }

    const athleteMap = new Map((athletes || []).map((a: Record<string, unknown>) => [a.id as string, a]))

    if (error) {
      console.error('Erro ao listar inscritos:', error)
      return NextResponse.json({ error: 'Erro ao listar inscritos' }, { status: 500 })
    }

    type RegItem = {
      id: string
      athlete_id: string
      category_id?: string
      registration_number: string | null
      status: string
      bib_number: number | null
      notes: string | null
    }

    const catMap = new Map((cats || []).map((c: { id: string; name: string; slug?: string }) => [c.id, { id: c.id, name: c.name, slug: c.slug || '' }]))

    const isConfirmed = (s: string) => {
      const v = (s || '').toLowerCase().trim()
      return v === 'confirmed' || v === 'confirmado' || v.includes('confirm')
    }

    const allRegs = (regs || []) as RegItem[]

    if (isAdmin) {
      const merged = allRegs.map((r) => {
        const athlete = athleteMap.get(r.athlete_id)
        const cat = r.category_id ? catMap.get(r.category_id) : null
        return {
          ...r,
          athlete,
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
    const confirmedRegs = allRegs.filter((r) => isConfirmed(r.status)).map((r) => {
      const athlete = athleteMap.get(r.athlete_id)
      const cat = r.category_id ? catMap.get(r.category_id) : null
      return {
        id: r.id,
        registration_number: r.registration_number,
        status: r.status,
        full_name: athlete?.full_name ?? '',
        birth_date: athlete?.birth_date ?? null,
        category_id: r.category_id,
        category_slug: cat?.slug ?? 'outros',
        category_name: cat?.name ?? 'Outros',
      }
    })

    const categoriesList = (cats || []) as { id: string; name: string; slug?: string }[]
    const categories = categoriesList
      .filter((c) => !categorySlug || categorySlug === (c.slug || ''))
      .map((c) => {
        const slug = c.slug || c.id
        const items = confirmedRegs.filter((r) => r.category_id === c.id)
        return {
          slug,
          name: c.name,
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
        }
      })
      .filter((cat) => cat.count > 0 || (categorySlug && categorySlug === cat.slug))

    // Incluir registros sem category_id válido em "outros" (fallback)
    const regsWithUnknownCategory = confirmedRegs.filter((r) => !r.category_id || !catMap.get(r.category_id))
    if (regsWithUnknownCategory.length > 0) {
      const outrosSlug = 'outros'
      if (!categories.some((c) => c.slug === outrosSlug)) {
        categories.push({
          slug: outrosSlug,
          name: 'Outros',
          count: regsWithUnknownCategory.length,
          inscritos: regsWithUnknownCategory.map((i) => ({
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
        })
      }
    }

    const debug = searchParams.get('_debug') === '1'
    const payload: Record<string, unknown> = { data: categories, edition: event.edition ?? 51 }
    if (debug) {
      payload._debug = {
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
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    })
  } catch (err: unknown) {
    console.error('Erro:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
