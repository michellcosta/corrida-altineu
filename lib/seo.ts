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
    
    const { data: rows } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', keys)

    if (rows) {
      for (const row of rows) {
        const val = row.value
        if (val && typeof val === 'object' && 'v' in val) {
          result[row.key.replace('seo_', '')] = String((val as { v: string }).v)
        }
      }
    }
    return result
  } catch {
    return {}
  }
}
