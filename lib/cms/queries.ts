'use server'

import { createClient } from '@/lib/supabase/serverClient'

export interface PublishedSection {
  id: string
  component_type: string
  order_index: number
  content: Record<string, unknown>
  is_visible: boolean
}

export interface PublishedPage {
  id: string
  title: string
  slug: string
  meta_description?: string | null
  sections: PublishedSection[]
}

export async function getPublishedPage(slug: string): Promise<PublishedPage | null> {
  const supabase = createClient()

  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (pageError || !page) {
    return null
  }

  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', page.id)
    .eq('is_visible', true)
    .order('order_index', { ascending: true })

  if (sectionsError) {
    return null
  }

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    meta_description: page.meta_description ?? null,
    sections: (sections ?? []).map((section) => ({
      id: section.id,
      component_type: section.component_type,
      order_index: section.order_index,
      content: section.content ?? {},
      is_visible: section.is_visible,
    })),
  }
}
