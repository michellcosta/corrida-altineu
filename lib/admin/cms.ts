'use client'

import { SECTION_TYPES } from '@/lib/cms/schemas'
import type { z } from 'zod'

type SectionType = (typeof SECTION_TYPES)[number]['type']

export interface CMSPage {
  id: string
  slug: string
  title: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
  sections_count?: number
}

export interface CMSSection {
  id: string
  page_id: string
  component_type: SectionType
  order_index: number
  content: Record<string, unknown>
  is_visible: boolean
  created_at: string
  updated_at: string
}

async function getSupabase() {
  const { createClient } = await import('@/lib/supabase/browserClient')
  return createClient()
}

const SECTION_DEFAULTS: Record<SectionType, Record<string, unknown>> = {
  hero: {
    headline: 'Novo titulo',
    subheadline: '',
    description: '',
    badges: [],
    stats: [],
  },
  countdown: {
    title: 'Contagem regressiva',
    subtitle: '',
    targetDate: new Date().toISOString(),
    backgroundColor: 'gradient-primary',
  },
  cards: {
    title: 'Nova grade',
    subtitle: '',
    layout: 'grid-3',
    cards: [],
  },
  timeline: {
    title: 'Linha do tempo',
    subtitle: '',
    milestones: [],
  },
  testimonials: {
    title: 'Testemunhos',
    subtitle: '',
    testimonials: [],
  },
  news: {
    title: 'Noticias',
    subtitle: '',
    showCount: 3,
  },
  sponsors: {
    title: 'Patrocinadores',
    subtitle: '',
    tiers: [],
  },
  cta: {
    title: 'Call to action',
    subtitle: '',
    features: [],
  },
  faq: {
    title: 'Perguntas frequentes',
    subtitle: '',
    items: [],
  },
  stats: {
    title: 'Estatisticas',
    subtitle: '',
    stats: [],
  },
}

function validatorFor(type: SectionType) {
  const meta = SECTION_TYPES.find((section) => section.type === type)
  return meta?.schema as z.ZodTypeAny | undefined
}

export async function listPages(): Promise<CMSPage[]> {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('pages')
    .select('*, sections:sections(count)')
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    (data as any[])?.map((row) => {
      const sectionsCount = Array.isArray(row.sections) && row.sections.length > 0 ? row.sections[0].count ?? 0 : 0
      const { sections, ...rest } = row
      return { ...rest, sections_count: sectionsCount } as CMSPage
    }) ?? []
  )
}

export async function createPage(payload: {
  title: string
  slug: string
  status?: 'draft' | 'published' | 'archived'
}) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('pages')
    .insert({
      title: payload.title,
      slug: payload.slug,
      status: payload.status ?? 'draft',
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as CMSPage
}

export async function updatePage(id: string, updates: Partial<Omit<CMSPage, 'id'>>) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('pages')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as CMSPage
}

export async function deletePage(id: string) {
  const supabase = await getSupabase()
  const { error } = await supabase.from('pages').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}

export async function getPageWithSections(pageId: string) {
  const supabase = await getSupabase()

  const [{ data: page, error: pageError }, { data: sections, error: sectionsError }] = await Promise.all([
    supabase.from('pages').select('*').eq('id', pageId).single(),
    supabase
      .from('sections')
      .select('*')
      .eq('page_id', pageId)
      .order('order_index', { ascending: true }),
  ])

  if (pageError) {
    throw new Error(pageError.message)
  }

  if (sectionsError) {
    throw new Error(sectionsError.message)
  }

  return {
    page: page as CMSPage,
    sections: (sections as any[]).map((section) => ({
      ...section,
      content: section.content || {},
    })) as CMSSection[],
  }
}

export async function createSection(pageId: string, type: SectionType, overrides?: Record<string, unknown>) {
  const supabase = await getSupabase()
  const baseContent = JSON.parse(JSON.stringify(SECTION_DEFAULTS[type] ?? {}))
  const content = { ...baseContent, ...(overrides ?? {}) }

  const schema = validatorFor(type)
  if (schema) {
    schema.parse({ type, ...content })
  }

  const { data, error } = await supabase
    .from('sections')
    .insert({
      page_id: pageId,
      component_type: type,
      content,
      order_index: Date.now(), // temporary, will normalize below
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await normalizeSectionOrder(pageId)

  return data as CMSSection
}

export async function updateSection(
  sectionId: string,
  updates: Partial<Pick<CMSSection, 'content' | 'order_index' | 'is_visible' | 'component_type'>>
) {
  const supabase = await getSupabase()

  if (updates.component_type) {
    const schema = validatorFor(updates.component_type)
    if (schema && updates.content) {
      schema.parse({ type: updates.component_type, ...updates.content })
    }
  }

  const { data, error } = await supabase
    .from('sections')
    .update(updates)
    .eq('id', sectionId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as CMSSection
}

export async function deleteSection(sectionId: string, pageId: string) {
  const supabase = await getSupabase()
  const { error } = await supabase.from('sections').delete().eq('id', sectionId)
  if (error) {
    throw new Error(error.message)
  }
  await normalizeSectionOrder(pageId)
}

export async function normalizeSectionOrder(pageId: string) {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('sections')
    .select('id')
    .eq('page_id', pageId)
    .order('order_index', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const updates = (data ?? []).map((section, index) => ({
    id: section.id,
    order_index: index,
  }))

  if (updates.length === 0) {
    return
  }

  const { error: updateError } = await supabase.from('sections').upsert(updates)
  if (updateError) {
    throw new Error(updateError.message)
  }
}

export async function moveSection(pageId: string, sectionId: string, direction: 'up' | 'down') {
  const { sections } = await getPageWithSections(pageId)
  const index = sections.findIndex((section) => section.id === sectionId)
  if (index === -1) return

  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= sections.length) return

  const current = sections[index]
  const target = sections[targetIndex]

  await Promise.all([
    updateSection(current.id, { order_index: target.order_index }),
    updateSection(target.id, { order_index: current.order_index }),
  ])

  await normalizeSectionOrder(pageId)
}

async function countRows(table: string, filters?: (query: any) => any) {
  const supabase = await getSupabase()
  let query = supabase.from(table).select('*', { count: 'exact', head: true })
  if (filters) {
    query = filters(query)
  }
  const { count, error } = await query
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function getContentStats() {
  const supabase = await getSupabase()

  const [{ count: totalPages, error: pagesError }, { count: publishedPages, error: publishedError }, { count: totalSections, error: sectionsError }, { count: totalPosts, error: postsError }] =
    await Promise.all([
      supabase.from('pages').select('*', { count: 'exact', head: true }),
      supabase.from('pages').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('sections').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
    ])

  if (pagesError) throw new Error(pagesError.message)
  if (publishedError) throw new Error(publishedError.message)
  if (sectionsError) throw new Error(sectionsError.message)
  if (postsError) throw new Error(postsError.message)

  return {
    totalPages: totalPages ?? 0,
    publishedPages: publishedPages ?? 0,
    totalSections: totalSections ?? 0,
    totalPosts: totalPosts ?? 0,
  }
}
