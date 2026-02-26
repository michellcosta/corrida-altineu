/**
 * Cliente Supabase para uso em Client Components
 * 
 * Este cliente é usado em componentes que rodam no navegador (com "use client")
 * É seguro porque usa apenas a chave pública (anon key)
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devem estar configurados no .env.local')
  }

  return createBrowserClient(url, key)
}

// Re-export para compatibilidade com código legado
export { createClient as supabaseBrowser }

