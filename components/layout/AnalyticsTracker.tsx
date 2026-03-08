'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function AnalyticsTracker() {
    const pathname = usePathname()

    useEffect(() => {
        // Não rastrear acessos do admin panel ou rotas de fallback internas
        if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/_next')) return

        const trackView = async () => {
            try {
                await fetch('/api/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: pathname }),
                })
            } catch (e) {
                // Ignorar erros silenciosamente em produção para não afetar o usuário
            }
        }

        // Um pequeno timeout evita spamming se o componente re-renderizar várias vezes seguidas
        const timer = setTimeout(trackView, 500)
        return () => clearTimeout(timer)
    }, [pathname])

    return null
}
