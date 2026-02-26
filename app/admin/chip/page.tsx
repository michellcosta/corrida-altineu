'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { Users, CheckCircle, AlertTriangle, Award, Hash, Download, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  pending_payment: 'Pagamento Pendente',
  pending_documents: 'Documentos Pendentes',
  under_review: 'Em Análise',
  confirmed: 'Confirmado',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
}

interface ChipStats {
  total: number
  confirmed: number
  kitsRetirados: number
  pending: number
  numerados: number
}

interface CategoryBreakdown {
  category: string
  count: number
  percentage: number
}

interface Alert {
  id: string
  type: string
  title: string
  message: string | null
  severity: string
  status: string
}

interface RecentRegistration {
  id: string
  registration_number: string | null
  status: string
  bib_number: number | null
  registered_at: string
  athlete: { full_name: string }
  category: { name: string }
}

const PENDING_STATUSES = ['pending', 'pending_payment', 'pending_documents', 'under_review']

export default function ChipAdminDashboard() {
  const [stats, setStats] = useState<ChipStats | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recentRegs, setRecentRegs] = useState<RecentRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: event } = await supabase
        .from('events')
        .select('id')
        .eq('year', 2026)
        .single()

      if (!event) {
        setStats({ total: 0, confirmed: 0, kitsRetirados: 0, pending: 0, numerados: 0 })
        setCategoryBreakdown([])
        setAlerts([])
        setRecentRegs([])
        return
      }

      const { data: regs } = await supabase
        .from('registrations')
        .select(`
          id,
          registration_number,
          status,
          bib_number,
          kit_picked_at,
          registered_at,
          athlete:athletes(full_name),
          category:categories(name)
        `)
        .eq('event_id', event.id)
        .order('registered_at', { ascending: false })

      const list = (regs || []) as unknown as (RecentRegistration & { kit_picked_at?: string | null })[]
      const total = list.length
      const confirmed = list.filter((r) => r.status === 'confirmed').length
      const kitsRetirados = list.filter((r) => r.kit_picked_at != null).length
      const pending = list.filter((r) => PENDING_STATUSES.includes(r.status)).length
      const numerados = list.filter((r) => r.bib_number != null).length

      setStats({ total, confirmed, kitsRetirados, pending, numerados })
      setRecentRegs(list.slice(0, 8))

      const byCategory = list.reduce<Record<string, number>>((acc, r) => {
        const name = r.category?.name ?? 'Outros'
        acc[name] = (acc[name] || 0) + 1
        return acc
      }, {})
      const breakdown: CategoryBreakdown[] = Object.entries(byCategory).map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      setCategoryBreakdown(breakdown)

      const { data: alertList } = await supabase
        .from('alerts')
        .select('id, type, title, message, severity, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      setAlerts((alertList || []) as unknown as Alert[])
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      setStats({ total: 0, confirmed: 0, kitsRetirados: 0, pending: 0, numerados: 0 })
      setCategoryBreakdown([])
      setAlerts([])
      setRecentRegs([])
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats
    ? [
        { name: 'Total Inscritos', value: stats.total.toLocaleString('pt-BR'), icon: Users, color: 'blue' },
        {
          name: 'Kits Retirados',
          value: stats.kitsRetirados.toLocaleString('pt-BR'),
          percent: stats.total > 0 ? `${((stats.kitsRetirados / stats.total) * 100).toFixed(1)}%` : undefined,
          icon: CheckCircle,
          color: 'green',
        },
        { name: 'Pendências', value: stats.pending.toLocaleString('pt-BR'), icon: AlertTriangle, color: 'red' },
        {
          name: 'Numerados',
          value: stats.numerados.toLocaleString('pt-BR'),
          percent: stats.total > 0 ? `${((stats.numerados / stats.total) * 100).toFixed(1)}%` : undefined,
          icon: Hash,
          color: 'purple',
        },
      ]
    : []

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  }

  const severityStyles: Record<string, string> = {
    info: 'bg-blue-50 border-blue-500',
    warning: 'bg-yellow-50 border-yellow-500',
    error: 'bg-red-50 border-red-500',
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-display font-bold mb-2">Painel de Cronometragem ⏱️</h2>
          <p className="text-blue-100 text-lg">
            Gerencie inscritos, numeração, check-in e resultados da corrida.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="admin-card">
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="animate-spin text-primary-600" size={28} />
                </div>
              </div>
            ))
          ) : (
            statCards.map((stat) => {
              const Icon = stat.icon
              const colors = colorClasses[stat.color] || colorClasses.blue
              return (
                <div key={stat.name} className="admin-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={colors.text} size={24} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{stat.name}</p>
                    {stat.percent && (
                      <span className="text-xs font-semibold text-green-600">{stat.percent}</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="admin-card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Categoria</h3>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin text-primary-600" size={24} />
              </div>
            ) : categoryBreakdown.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma inscrição ainda.</p>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Alertas e Pendências</h3>
              <Link
                href="/admin/chip/alerts"
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Ver todos →
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="animate-spin text-primary-600" size={24} />
              </div>
            ) : alerts.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Nenhum alerta pendente.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    href="/admin/chip/alerts"
                    className={`block p-4 rounded-lg border-l-4 transition hover:opacity-90 ${
                      severityStyles[alert.severity] ?? severityStyles.warning
                    }`}
                  >
                    <p className="text-sm text-gray-700 font-medium">{alert.title}</p>
                    {alert.message && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/chip/exports"
              className="admin-button-primary flex flex-col items-center space-y-2"
            >
              <Download size={24} />
              <span>Exportar CSV</span>
            </Link>
            <Link
              href="/admin/chip/numbering"
              className="admin-button-secondary flex flex-col items-center space-y-2"
            >
              <Hash size={24} />
              <span>Gerar Numeração</span>
            </Link>
            <Link
              href="/admin/chip/checkin"
              className="admin-button-secondary flex flex-col items-center space-y-2"
            >
              <CheckCircle size={24} />
              <span>Check-in</span>
            </Link>
            <Link
              href="/admin/chip/results"
              className="admin-button-secondary flex flex-col items-center space-y-2"
            >
              <Award size={24} />
              <span>Resultados</span>
            </Link>
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Últimas Inscrições</h3>
            <Link
              href="/admin/chip/registrations"
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
            >
              Ver todas →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <Loader2 className="animate-spin text-primary-600 mx-auto" size={24} />
                    </td>
                  </tr>
                ) : recentRegs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhuma inscrição ainda.
                    </td>
                  </tr>
                ) : (
                  recentRegs.map((reg) => (
                    <tr key={reg.id}>
                      <td className="font-mono font-bold">
                        {reg.registration_number ?? reg.bib_number ?? '—'}
                      </td>
                      <td className="font-semibold">{reg.athlete?.full_name ?? '—'}</td>
                      <td>{reg.category?.name ?? '—'}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            reg.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : PENDING_STATUSES.includes(reg.status)
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {STATUS_LABELS[reg.status] ?? reg.status}
                        </span>
                      </td>
                      <td className="text-gray-500 text-sm">
                        {reg.registered_at
                          ? new Date(reg.registered_at).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
