'use client'

import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button, Input, Badge, Card } from '@/components/ui'
import { Search, Download, Filter, Hash, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browserClient'
import { getCountryLabel } from '@/lib/countries'

function formatOrigin(athlete: { city?: string | null; state?: string | null; country?: string | null }): string {
  if (athlete?.country && athlete.country !== 'BRA') {
    return getCountryLabel(athlete.country)
  }
  if (athlete?.city && athlete?.state) {
    return `${athlete.city} - ${athlete.state}`
  }
  if (athlete?.city) return athlete.city
  return '-'
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  pending_payment: 'Pagamento Pendente',
  pending_documents: 'Documentos Pendentes',
  under_review: 'Em Análise',
  confirmed: 'Confirmado',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
}

const STATUS_BADGE_MAP: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
  confirmed: 'success',
  pending: 'warning',
  pending_payment: 'warning',
  pending_documents: 'warning',
  under_review: 'info',
  rejected: 'error',
  cancelled: 'info',
}

interface RegistrationRow {
  id: string
  registration_number: string | null
  status: string
  bib_number: number | null
  athlete: { full_name: string; gender: string | null; city: string | null; state: string | null; country: string | null }
  category: { name: string }
}

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export default function ChipRegistrationsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('todas')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, numerados: 0 })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: event } = await supabase
        .from('events')
        .select('id')
        .eq('year', 2026)
        .single()

      if (!event) {
        setRegistrations([])
        setCategories([])
        return
      }

      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .eq('event_id', event.id)
        .order('name')
      setCategories(cats || [])

      const { data: regs, error } = await supabase
        .from('registrations')
        .select(`
          id,
          registration_number,
          status,
          bib_number,
          athlete:athletes(full_name, gender, city, state, country),
          category:categories(name)
        `)
        .eq('event_id', event.id)
        .order('registered_at', { ascending: false })

      if (error) throw error
      setRegistrations((regs as unknown as RegistrationRow[]) || [])

      const total = (regs || []).length
      const confirmed = (regs || []).filter((r: any) => r.status === 'confirmed').length
      const pending = (regs || []).filter((r: any) => ['pending', 'pending_payment', 'pending_documents', 'under_review'].includes(r.status)).length
      const numerados = (regs || []).filter((r: any) => r.bib_number != null).length
      setStats({ total, confirmed, pending, numerados })
    } catch (err: any) {
      console.error('Erro ao carregar inscritos:', err)
      toast.error(err.message || 'Erro ao carregar inscritos')
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = registrations.filter((reg) => {
    const matchSearch = !searchTerm || reg.athlete?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCat = filterCategory === 'todas' || reg.category?.name === filterCategory
    const matchStatus = filterStatus === 'todos' || reg.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  async function handleExport() {
    try {
      const supabase = createClient()
      const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
      if (!event) {
        toast.error('Evento não encontrado')
        return
      }
      const { data: regs, error } = await supabase
        .from('registrations')
        .select(`
          id, registration_number, status, bib_number, registered_at,
          athlete:athletes(full_name, email, phone, gender, city, state, country, birth_date),
          category:categories(name)
        `)
        .eq('event_id', event.id)
        .order('registered_at', { ascending: false })
      if (error) throw error
      const list = (regs || []) as any[]
      const headers = ['Nº Inscrição', 'Nome', 'Email', 'Telefone', 'Categoria', 'Sexo', 'Origem', 'Nº Peito', 'Status', 'Data Inscrição']
      const rows = list.map((r) => [
        r.registration_number ?? '',
        r.athlete?.full_name ?? '',
        r.athlete?.email ?? '',
        r.athlete?.phone ?? '',
        r.category?.name ?? '',
        r.athlete?.gender ?? '',
        formatOrigin(r.athlete) ?? '',
        r.bib_number ?? '',
        STATUS_LABELS[r.status] ?? r.status,
        r.registered_at ? new Date(r.registered_at).toLocaleString('pt-BR') : '',
      ])
      const csv = [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\r\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inscricoes-2026-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exportação concluída')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao exportar')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Inscritos
            </h1>
            <p className="text-gray-600">
              Visualização e ações de chip (numeração)
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              leftIcon={<Hash size={18} />}
              onClick={() => router.push('/admin/chip/numbering')}
            >
              Atribuir Números
            </Button>
            <Button
              variant="primary"
              leftIcon={<Download size={18} />}
              onClick={handleExport}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="admin-input"
            >
              <option value="todas">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="admin-input"
            >
              <option value="todos">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="pending_payment">Pagamento Pendente</option>
              <option value="pending_documents">Documentos Pendentes</option>
              <option value="under_review">Em Análise</option>
              <option value="confirmed">Confirmado</option>
              <option value="rejected">Rejeitado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <Button
              variant="secondary"
              leftIcon={<Filter size={18} />}
              onClick={() => toast.info('Filtros aplicados')}
            >
              Filtrar
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="admin-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nº Inscrição</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Sexo</th>
                    <th>Origem</th>
                    <th>Status</th>
                    <th>Nº Peito</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        Nenhuma inscrição encontrada
                      </td>
                    </tr>
                  ) : (
                    filtered.map((reg) => (
                      <tr key={reg.id}>
                        <td className="font-mono">{reg.registration_number || '-'}</td>
                        <td className="font-semibold">{reg.athlete?.full_name || '-'}</td>
                        <td>{reg.category?.name || '-'}</td>
                        <td>{reg.athlete?.gender || '-'}</td>
                        <td className="text-gray-600">{formatOrigin(reg.athlete)}</td>
                        <td>
                          <Badge variant={STATUS_BADGE_MAP[reg.status] || 'neutral'}>
                            {STATUS_LABELS[reg.status] || reg.status}
                          </Badge>
                        </td>
                        <td>
                          {reg.bib_number != null ? (
                            <span className="font-mono text-primary-600">{reg.bib_number}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">Não atribuído</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card variant="default" className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </Card>
          <Card variant="default" className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
            <p className="text-sm text-gray-500">Confirmados</p>
          </Card>
          <Card variant="default" className="text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pendentes</p>
          </Card>
          <Card variant="default" className="text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.numerados}</p>
            <p className="text-sm text-gray-500">Numerados</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
