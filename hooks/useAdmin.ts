// hooks/useAdmin.ts - Hooks para uso no painel admin

'use client'

import { useState, useEffect } from 'react'
import { AdminUser } from '@/lib/admin/types'
import { getCurrentUser } from '@/lib/admin/auth'

// Hook para verificar sessão do admin
export function useAdminSession() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser?.profile || null)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  return { user, loading, isAuthenticated: !!user }
}

// Hook para verificar permissões
// Hook para configurações do evento
export function useEventSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      setError(null)

      // Importar cliente Supabase dinamicamente para evitar problemas de SSR
      const { createClient } = await import('@/lib/supabase/browserClient')
      const supabase = createClient()

      // Buscar evento do ano 2026
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          categories (*)
        `)
        .eq('year', 2026)
        .single()

      if (eventError) {
        console.error('Erro ao carregar evento:', eventError)
        setError('Erro ao carregar configurações do evento')
        return
      }

      // Transformar dados do Supabase para o formato esperado
      const formattedSettings = {
        anoProva: event.year,
        edicao: event.edition,
        dataProva: event.race_date,
        horaLargada10K: event.start_time_10k || '07:00',
        horaLargada2K: event.start_time_2k || '08:30',
        localLargada: event.location,
        cidade: event.city,
        estado: event.state,
        vagasGeral: event.slots_geral || 500,
        vagasMorador: event.slots_morador || 200,
        vagasSessenta: event.slots_60plus || 100,
        vagasInfantil: event.slots_infantil || 300,
        valorGeral: event.price_geral || 20.00,
        inscricoesAbertas: event.registrations_open,
        dataAberturaInscricoes: event.registration_open_date?.split('T')[0] || '2025-12-01',
        dataEncerramentoInscricoes: event.registration_close_date?.split('T')[0] || '2026-06-20',
        premiacaoTotal: event.total_prize || 0,
        contatoEmail: event.contact_email,
        contatoTelefone: event.contact_phone,
        instagram: event.social_instagram,
        // Dados das categorias
        categorias: event.categories || []
      }

      setSettings(formattedSettings)
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings(data: any) {
    setSaving(true)
    setError(null)
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Admin] Enviando vagasSessenta:', data.vagasSessenta)
      }
      const res = await fetch('/api/admin/event/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(json.error || `Erro ${res.status}`)
      }
      if (process.env.NODE_ENV === 'development' && json.slots_60plus != null) {
        console.log('[Admin] API confirmou slots_60plus salvo:', json.slots_60plus)
      }

      // Notificar outras abas no mesmo navegador (BroadcastChannel)
      try {
        const { notifyEventConfigUpdated } = await import('@/lib/event-config-channel')
        notifyEventConfigUpdated()
        if (process.env.NODE_ENV === 'development') {
          console.log('[Admin] API atualizou evento, BroadcastChannel enviado')
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Admin] Erro ao notificar BroadcastChannel:', e)
        }
      }

      // Recarregar dados atualizados
      await loadSettings()

      return {
        success: true,
        message: 'Configurações salvas com sucesso!',
        revalidationFailed: false,
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      return { success: false, message: error.message }
    } finally {
      setSaving(false)
    }
  }

  return { 
    settings, 
    loading, 
    saving, 
    error,
    saveSettings, 
    reloadSettings: loadSettings 
  }
}
