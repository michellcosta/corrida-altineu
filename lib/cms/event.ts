import { createClient } from '@/lib/supabase/serverClient'

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

