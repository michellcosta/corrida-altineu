'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/browserClient'
import { onEventConfigUpdated } from '@/lib/event-config-channel'

/**
 * Hook que escuta alterações na tabela events via:
 * 1. Supabase Realtime (qualquer dispositivo)
 * 2. BroadcastChannel (mesmo navegador - fallback)
 */
export function useEventConfigRealtime(onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('event-config-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
        },
        () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[EventConfig] Realtime Supabase disparou - refetch')
          }
          setTimeout(onUpdate, 150)
        }
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV === 'development' && status !== 'SUBSCRIBED') {
          console.log('[Realtime events]', status)
        }
      })

    const unbindBroadcast = onEventConfigUpdated(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[EventConfig] BroadcastChannel disparou - refetch')
      }
      setTimeout(onUpdate, 150)
    })

    return () => {
      supabase.removeChannel(channel)
      unbindBroadcast()
    }
  }, [onUpdate])
}
