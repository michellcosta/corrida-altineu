'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { parseLocalDate } from '@/lib/utils/dates'
import {
  Activity,
  AlertCircle,
  BarChart2,
  Calendar,
  CheckCircle,
  CreditCard,
  Database,
  Globe,
  Loader2,
  Mail,
  RefreshCw,
} from 'lucide-react'

interface SiteStats {
  health: {
    database: boolean
    payment: boolean
    email: boolean
  }
  analytics: {
    views: number
    conversionRate: string
    topPages: Array<{ path: string; count: number }>
    period: string
  }
}

interface EventSummary {
  edition: number
  year: number
  raceDate?: string
  registrationsOpen: boolean
  city?: string
  state?: string
}

type ToastState = { id: string; message: string; type: 'success' | 'error' }

async function fetchEventSummary(): Promise<EventSummary | null> {
  try {
    const { createClient } = await import('@/lib/supabase/browserClient')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('year', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return {
      edition: data.edition,
      year: data.year,
      raceDate: data.race_date ?? undefined,
      registrationsOpen: Boolean(data.registrations_open),
      city: data.city ?? undefined,
      state: data.state ?? undefined,
    }
  } catch {
    return null
  }
}

export default function SiteAdminDashboard() {
  const router = useRouter()
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null)
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastState[]>([])
  const [togglingRegistrations, setTogglingRegistrations] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)

      const [event, siteStatsData] = await Promise.all([
        fetchEventSummary().catch((err) => {
          console.error('Erro ao buscar evento:', err)
          return null
        }),
        fetch('/api/admin/stats')
          .then(res => res.ok ? res.json() : null)
          .catch((err) => {
            console.error('Erro ao buscar site stats:', err)
            return null
          })
      ])

      setEventSummary(event)
      setSiteStats(siteStatsData)
    } catch (err: any) {
      console.error('Erro ao carregar painel:', err)
      setError(err?.message ?? 'Nao foi possivel carregar os dados do painel.')
      setEventSummary(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboard()
    notify('Painel atualizado.', 'success')
  }

  const notify = (message: string, type: ToastState['type']) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const handleToggleRegistrations = async () => {
    if (!eventSummary || togglingRegistrations) return
    const newState = !eventSummary.registrationsOpen
    setTogglingRegistrations(true)
    try {
      const res = await fetch('/api/admin/event/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ open: newState }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `Erro ${res.status}`)
      }
      setEventSummary({ ...eventSummary, registrationsOpen: newState })
      notify(
        newState ? 'Inscrições reabertas com sucesso!' : 'Inscrições encerradas com sucesso!',
        'success'
      )
    } catch (err: any) {
      notify(err.message || 'Erro ao alternar inscrições', 'error')
    } finally {
      setTogglingRegistrations(false)
    }
  }

  const formattedRaceDate = useMemo(() => {
    if (!eventSummary?.raceDate) return null
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(parseLocalDate(eventSummary.raceDate))
    } catch {
      return eventSummary.raceDate
    }
  }, [eventSummary])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Painel do site
            </h1>
            <p className="mt-1 text-gray-600">
              Centralize a gestão de páginas, seções, posts e configurações do portal oficial.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="admin-button-secondary flex items-center gap-2"
              disabled={refreshing}
            >
              {refreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Atualizar
            </button>
            <button
              onClick={() => router.push('/')}
              className="admin-button-secondary"
            >
              Ver site
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Evento</p>
                <h2 className="text-lg font-semibold text-gray-900">Resumo da próxima edição</h2>
              </div>
              <Calendar className="text-primary-600" size={24} />
            </div>
            {eventSummary ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>
                    {eventSummary.edition}ª edição • {eventSummary.year}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <Globe size={16} className="mt-0.5 text-primary-500" />
                  <span>
                    {eventSummary.city ?? 'Macuco'}
                    {eventSummary.state ? ` - ${eventSummary.state}` : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Data prevista:{' '}
                  <strong className="text-gray-900">{formattedRaceDate ?? 'Defina em Configurações'}</strong>
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Inscrições {eventSummary.registrationsOpen ? 'abertas' : 'fechadas'}
                </p>
                <button
                  onClick={handleToggleRegistrations}
                  disabled={togglingRegistrations}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    eventSummary.registrationsOpen
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {togglingRegistrations
                    ? 'Aguarde...'
                    : eventSummary.registrationsOpen
                      ? 'Encerrar inscrições'
                      : 'Reabrir inscrições'}
                </button>
                <button
                  onClick={() => router.push('/admin/site/settings/event')}
                  className="admin-button-secondary w-full"
                >
                  Ajustar configurações
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                Nenhuma configuração de evento encontrada. Cadastre no módulo de configurações.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Analytics Básico */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart2 size={20} className="text-blue-600" />
                  Analytics Básico
                </h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Últimos 7 dias</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Visitas Totais</p>
                  <div className="flex items-end justify-between">
                    {loading ? (
                      <Loader2 size={24} className="animate-spin text-primary-600" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {(siteStats?.analytics?.views ?? 0).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Conversões</p>
                  <div className="flex items-end justify-between">
                    {loading ? (
                      <Loader2 size={24} className="animate-spin text-primary-600" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {siteStats?.analytics?.conversionRate ?? '0'}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Páginas mais acessadas</h3>

                {loading ? (
                  <div className="flex min-h-[80px] items-center justify-center text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  </div>
                ) : !siteStats?.analytics?.topPages?.length ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    Nenhuma visualização registrada nos últimos 7 dias.
                  </div>
                ) : (
                  siteStats.analytics.topPages.map((page, idx) => {
                    const maxCount = Math.max(...siteStats.analytics.topPages.map((p) => p.count), 1)
                    const widthPct = Math.round((page.count / maxCount) * 100)
                    return (
                      <div key={page.path}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 truncate max-w-[70%]">{page.path || '/'}</span>
                          <span className="font-medium text-gray-900 text-xs">
                            {page.count.toLocaleString('pt-BR')} visualizações
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* NOVO WIDGET: Status do Sistema */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-indigo-600" />
                Saúde do Sistema
              </h2>
              {loading ? (
                <Loader2 size={16} className="animate-spin text-gray-400" />
              ) : (
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${(siteStats?.health?.database && siteStats?.health?.payment) ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                  }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${(siteStats?.health?.database && siteStats?.health?.payment) ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                  {(siteStats?.health?.database && siteStats?.health?.payment) ? 'Operacional' : 'Com Alertas'}
                </span>
              )}
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Database size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Banco de Dados</h3>
                    <p className="text-xs text-gray-500">Conexão Supabase</p>
                  </div>
                </div>
                {loading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : (
                  siteStats?.health?.database
                    ? <div className="text-xs font-bold text-emerald-600">Online</div>
                    : <div className="text-xs font-bold text-red-600">Offline</div>
                )}
              </div>

              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <CreditCard size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Integração AbacatePay</h3>
                    <p className="text-xs text-gray-500">API de Pagamentos</p>
                  </div>
                </div>
                {loading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : (
                  siteStats?.health?.payment
                    ? <div className="text-xs font-bold text-emerald-600">Configurado</div>
                    : <div className="text-xs font-bold text-amber-600">Falta Chave API</div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                    <Mail size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Serviço de E-mail</h3>
                    <p className="text-xs text-gray-500">Resend / SMTP</p>
                  </div>
                </div>
                {loading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : (
                  siteStats?.health?.email
                    ? <div className="text-xs font-bold text-emerald-600">Configurado</div>
                    : <div className="text-xs font-bold text-amber-600">Não Conectado</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AdminLayout >
  )
}






