'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { getContentStats, listPages } from '@/lib/admin/cms'
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle,
  FileText,
  Globe,
  Layers,
  Loader2,
  RefreshCw,
  Settings,
  TrendingUp,
} from 'lucide-react'

interface DashboardStats {
  totalPages: number
  publishedPages: number
  totalSections: number
  totalPosts: number
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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPages, setRecentPages] = useState<Array<{ id: string; title: string; slug: string; updated_at: string }>>([])
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastState[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [contentStats, pages, event] = await Promise.all([
        getContentStats().catch((err) => {
          console.error('Erro ao buscar stats:', err)
          return {
            totalPages: 0,
            publishedPages: 0,
            totalSections: 0,
            totalPosts: 0,
          }
        }),
        listPages().catch((err) => {
          console.error('Erro ao buscar páginas:', err)
          return []
        }),
        fetchEventSummary().catch((err) => {
          console.error('Erro ao buscar evento:', err)
          return null
        }),
      ])

      setStats(contentStats)
      setRecentPages(pages.slice(0, 5).map(({ id, title, slug, updated_at }) => ({ id, title, slug, updated_at })))
      setEventSummary(event)
    } catch (err: any) {
      console.error('Erro ao carregar painel:', err)
      setError(err?.message ?? 'Nao foi possivel carregar os dados do painel.')
      // Definir valores padrão em caso de erro
      setStats({
        totalPages: 0,
        publishedPages: 0,
        totalSections: 0,
        totalPosts: 0,
      })
      setRecentPages([])
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

  const statsCards = useMemo(() => {
    return [
      {
        title: 'Paginas totais',
        value: stats?.totalPages ?? 0,
        description: 'Inclui rascunhos e arquivadas',
        icon: FileText,
        accent: 'bg-primary-100 text-primary-700',
      },
      {
        title: 'Paginas publicadas',
        value: stats?.publishedPages ?? 0,
        description: 'Disponiveis no site publico',
        icon: Globe,
        accent: 'bg-emerald-100 text-emerald-700',
      },
      {
        title: 'Secoes em uso',
        value: stats?.totalSections ?? 0,
        description: 'Componentes ativos nas paginas',
        icon: Layers,
        accent: 'bg-indigo-100 text-indigo-700',
      },
      {
        title: 'Posts do blog',
        value: stats?.totalPosts ?? 0,
        description: 'Conteudo editorial publicado',
        icon: TrendingUp,
        accent: 'bg-amber-100 text-amber-700',
      },
    ]
  }, [stats])

  const formattedRaceDate = useMemo(() => {
    if (!eventSummary?.raceDate) return null
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(eventSummary.raceDate))
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
              Centralize a gestao de paginas, secoes, posts e configuracoes do portal oficial.
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className={`mb-4 inline-flex rounded-xl px-3 py-2 text-sm font-semibold ${card.accent}`}>
                  <Icon size={18} className="mr-2" />
                  {card.title}
                </div>
                {loading ? (
                  <Loader2 size={28} className="animate-spin text-primary-600" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">{card.description}</p>
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Paginas recentes</h2>
              <button
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                onClick={() => router.push('/admin/site/content/pages')}
              >
                Ver todas
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="flex min-h-[140px] items-center justify-center text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : recentPages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
                  Nenhuma pagina cadastrada. Comece criando a estrutura da home.
                </div>
              ) : (
                recentPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => router.push(`/admin/site/content/pages/${page.id}`)}
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left transition hover:border-primary-200 hover:bg-primary-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-widest text-gray-400">/{page.slug}</p>
                        <p className="text-base font-semibold text-gray-900">{page.title}</p>
                      </div>
                      <span className="text-xs font-semibold text-primary-600">Editar</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Atualizado em{' '}
                      {new Date(page.updated_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Evento</p>
                <h2 className="text-lg font-semibold text-gray-900">Resumo da proxima edicao</h2>
              </div>
              <Calendar className="text-primary-600" size={24} />
            </div>
            {eventSummary ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>
                    {eventSummary.edition}ª edicao • {eventSummary.year}
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
                  <strong className="text-gray-900">{formattedRaceDate ?? 'Defina em Configuracoes'}</strong>
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Inscricoes {eventSummary.registrationsOpen ? 'abertas' : 'fechadas'}
                </p>
                <button
                  onClick={() => router.push('/admin/site/settings/event')}
                  className="admin-button-secondary w-full"
                >
                  Ajustar configuracoes
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                Nenhuma configuracao de evento encontrada. Cadastre no modulo de configuracoes.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Acoes rapidas</h2>
            <p className="mt-1 text-sm text-gray-500">
              Atalhos para as areas mais utilizadas na gestao do site.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <button
                onClick={() => router.push('/admin/site/content/pages')}
                className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-4 text-left transition hover:border-primary-300 hover:bg-primary-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-primary-700">Gerenciar paginas</h3>
                    <p className="text-xs text-primary-600">Editar estrutura e conteudo</p>
                  </div>
                  <FileText size={20} className="text-primary-700" />
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/site/content/posts')}
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-left transition hover:border-amber-300 hover:bg-amber-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-amber-700">Posts e noticias</h3>
                    <p className="text-xs text-amber-600">Publicar conteudo editorial</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/site/settings/templates')}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-left transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-emerald-700">Templates de comunicacao</h3>
                    <p className="text-xs text-emerald-600">Emails e notificacoes</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/site/settings/event')}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-left transition hover:border-indigo-300 hover:bg-indigo-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-indigo-700">Configuracoes do evento</h3>
                    <p className="text-xs text-indigo-600">Datas, vagas, contato</p>
                  </div>
                  <Settings size={20} className="text-indigo-700" />
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Checklist de publicacao</h2>
            <p className="mt-1 text-sm text-gray-500">
              Garanta que todas as frentes estao prontas antes de divulgar a proxima edicao.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 text-primary-500" size={16} />
                Atualize o hero e a contagem regressiva na pagina inicial.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 text-primary-500" size={16} />
                Revise categorias, premios e regulamentos no CMS.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 text-primary-500" size={16} />
                Ajuste templates de email e notificacoes para o novo cronograma.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 text-primary-500" size={16} />
                Publique noticias com comunicados oficiais e patrocinadores.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}






