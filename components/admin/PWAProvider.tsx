'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PWAProvider() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname?.startsWith('/admin')) return
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw-admin.js', {
          scope: '/admin',
        })
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      } catch {
        // SW registration failed - PWA still works with manifest
      }
    }

    register()
  }, [pathname])

  return null
}
