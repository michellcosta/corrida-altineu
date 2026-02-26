'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { AlertTriangle, CheckCircle, Info, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

interface Alert {
  id: string
  type: string
  title: string
  message: string | null
  entity_type: string | null
  entity_id: string | null
  severity: string
  status: string
  created_at: string
}

const SEVERITY_ICONS: Record<string, typeof AlertTriangle> = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

const SEVERITY_STYLES: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending')

  useEffect(() => {
    loadAlerts()
  }, [filter])

  async function loadAlerts() {
    try {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setAlerts(data || [])
    } catch (err: any) {
      console.error('Erro ao carregar alertas:', err)
      toast.error(err.message || 'Erro ao carregar alertas')
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  async function resolveAlert(id: string) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      const { error } = await supabase
        .from('alerts')
        .update({
          status: 'resolved',
          resolved_by: profile?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      toast.success('Alerta resolvido')
      loadAlerts()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao resolver')
    }
  }

  async function generateAlerts() {
    try {
      const supabase = createClient()
      const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
      if (!event) return

      const { data: regs } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', event.id)
        .is('bib_number', null)
        .eq('status', 'confirmed')

      const count = regs?.length || 0
      if (count > 0) {
        const { data: existing } = await supabase
          .from('alerts')
          .select('id')
          .eq('type', 'no_bib_number')
          .eq('status', 'pending')
          .maybeSingle()

        if (!existing) {
          await supabase.from('alerts').insert({
            type: 'no_bib_number',
            title: 'Atletas sem número de peito',
            message: `${count} atleta(s) confirmado(s) ainda sem número atribuído`,
            entity_type: 'registrations',
            severity: 'warning',
          })
        }
      }

      toast.success('Alertas atualizados')
      loadAlerts()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar alertas')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Alertas
            </h1>
            <p className="text-gray-600">
              Avisos que exigem sua atenção
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateAlerts}
              className="admin-button-secondary flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Atualizar Alertas
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['pending', 'resolved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'pending' ? 'Pendentes' : f === 'resolved' ? 'Resolvidos' : 'Todos'}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="admin-card text-center py-16">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-700">Nenhum alerta</p>
              <p className="text-gray-500 mt-2">
                {filter === 'pending'
                  ? 'Não há alertas pendentes no momento.'
                  : 'Nenhum alerta encontrado.'}
              </p>
              {filter === 'pending' && (
                <button
                  onClick={generateAlerts}
                  className="mt-4 admin-button-primary"
                >
                  Verificar e gerar alertas
                </button>
              )}
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = SEVERITY_ICONS[alert.severity] || AlertTriangle
              const style = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info
              return (
                <div
                  key={alert.id}
                  className={`admin-card border-l-4 ${style} flex items-start justify-between gap-4`}
                >
                  <div className="flex gap-4">
                    <Icon size={24} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-gray-900">{alert.title}</h3>
                      {alert.message && (
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {alert.status === 'pending' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="admin-button-secondary flex items-center gap-2 flex-shrink-0"
                    >
                      <CheckCircle size={18} />
                      Resolver
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
