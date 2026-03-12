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
          setTimeout(onUpdate, 150)
        }
      )
      .subscribe((status) => {
        // Status logger removed for cleaner console
      })

    const unbindBroadcast = onEventConfigUpdated(() => {
      setTimeout(onUpdate, 150)
    })

    return () => {
      supabase.removeChannel(channel)
      unbindBroadcast()
    }
  }, [onUpdate])
}
