import { createClient } from '@/lib/supabase/serverClient'

export async function getSeoMetadata() {
  try {
    const supabase = createClient()
    const keys = [
      'seo_meta_title',
      'seo_meta_description',
      'seo_og_image',
      'seo_meta_keywords',
      'seo_site_name',
      'seo_twitter_handle',
      'seo_canonical_url',
    ]
    const result: Record<string, string> = {}
    for (const key of keys) {
      const { data } = await supabase.from('settings').select('value').eq('key', key).single()
      if (data?.value && typeof data.value === 'object' && 'v' in data.value) {
        result[key.replace('seo_', '')] = String((data.value as { v: string }).v)
      }
    }
    return result
  } catch {
    return {}
  }
}
