/**
 * Cliente Supabase para uso em Server Components e API Routes
 * 
 * Este cliente é usado em:
 * - Server Components (componentes sem "use client")
 * - API Routes (app/api/*)
 * - Server Actions
 * 
 * Gerencia cookies de autenticação automaticamente
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server component - cookies já foram enviados
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server component - cookies já foram enviados
          }
        },
      },
    }
  )
}

// Re-export para compatibilidade com código legado
export { createClient as supabaseServer }

/**
 * Cliente Supabase com permissões de serviço (admin)
 *
 * Usa @supabase/supabase-js diretamente (recomendado para service_role).
 * O createServerClient do SSR pode ter comportamento diferente com sb_secret_.
 *
 * ⚠️ ATENÇÃO: Use apenas em API Routes server-side
 * NUNCA exponha a service_role key no código do navegador!
 */
export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}








