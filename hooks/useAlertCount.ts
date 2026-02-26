'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browserClient'

export function useAlertCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const supabase = createClient()
        const { count: c, error } = await supabase
          .from('alerts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        if (!error) setCount(c ?? 0)
      } catch {
        setCount(0)
      }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [])

  return count
}
