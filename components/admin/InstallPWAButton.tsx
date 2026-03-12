'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOS() {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function getManualInstructions() {
  const ua = navigator.userAgent.toLowerCase()
  const isHttp = typeof window !== 'undefined' && !window.location.href.startsWith('https://')
  const httpNote = isHttp
    ? '\n\n⚠️ Em HTTP (rede local) a instalação completa pode não funcionar. Use o site em produção (HTTPS) para instalar como app.'
    : ''

  if (/iphone|ipad|ipod/.test(ua)) {
    return 'iPhone: Toque no ícone Compartilhar (quadrado com seta) na barra do Safari e escolha "Adicionar à Tela de Início".' + httpNote
  }
  if (/android/.test(ua)) {
    return (
      'Android: Toque nos 3 pontos (⋮) no canto superior direito do Chrome. ' +
      'Procure "Instalar app" ou "Adicionar à tela de início".\n\n' +
      'Se não aparecer: o site precisa estar em HTTPS. Acesse a versão publicada do site para instalar.' +
      httpNote
    )
  }
  return 'Chrome: Clique nos 3 pontos do menu e escolha "Instalar app" ou "Adicionar ao Chrome".' + httpNote
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const installedHandler = () => setInstalled(true)

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setInstalled(true)
    } else {
      alert(getManualInstructions())
    }
  }

  if (installed) return null

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary-600 bg-white/70 hover:bg-white/90 rounded-md border border-primary-100 transition-colors"
    >
      <Download size={18} />
      Instalar app
    </button>
  )
}
