'use client'

import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button, Input, Badge, Card } from '@/components/ui'
import { Search, Download, Filter, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browserClient'
import { getCountryLabel } from '@/lib/countries'
import { UserRole } from '@/lib/admin/types'

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

interface AthleteData {
  id: string
  full_name: string
  email: string
  phone: string | null
  birth_date: string
  gender: string | null
  city: string | null
  state: string | null
  country: string | null
  team_name: string | null
  tshirt_size: string | null
}

interface RegistrationRow {
  id: string
  athlete_id: string
  registration_number: string | null
  status: string
  bib_number: number | null
  notes: string | null
  athlete: AthleteData & { city?: string | null; state?: string | null; country?: string | null }
  category: { id: string; name: string }
}

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export default function SiteInscritosPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('todas')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, numerados: 0 })
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedReg, setSelectedReg] = useState<RegistrationRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [roleChecked, setRoleChecked] = useState(false)

  useEffect(() => {
    checkRoleAndLoad()
  }, [])

  async function checkRoleAndLoad() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin/login')
        return
      }
      const { data: profile } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single()
      if (!profile || profile.role !== UserRole.SITE_ADMIN) {
        router.push(profile?.role === UserRole.CHIP_ADMIN ? '/admin/chip' : '/admin/site')
        return
      }
      setRoleChecked(true)
      await loadData()
    } catch {
      router.push('/admin/login')
    }
  }

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
          athlete_id,
          registration_number,
          status,
          bib_number,
          notes,
          athlete:athletes(id, full_name, email, phone, birth_date, gender, city, state, country, team_name, tshirt_size),
          category:categories(id, name)
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

  function openEdit(reg: RegistrationRow) {
    setSelectedReg(reg)
    setEditModalOpen(true)
  }

  function openDelete(reg: RegistrationRow) {
    setSelectedReg(reg)
    setDeleteModalOpen(true)
  }

  async function handleSaveEdit(athleteData: Partial<AthleteData>, registrationData: { status: string; notes: string | null }) {
    if (!selectedReg) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error: athleteError } = await supabase
        .from('athletes')
        .update({
          full_name: athleteData.full_name,
          email: athleteData.email,
          phone: athleteData.phone || null,
          birth_date: athleteData.birth_date,
          gender: athleteData.gender || null,
          city: athleteData.city || null,
          state: athleteData.state || null,
          country: athleteData.country || null,
          team_name: athleteData.team_name || null,
          tshirt_size: athleteData.tshirt_size || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedReg.athlete_id)
      if (athleteError) throw athleteError

      const { error: regError } = await supabase
        .from('registrations')
        .update({
          status: registrationData.status,
          notes: registrationData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedReg.id)
      if (regError) throw regError

      toast.success('Inscrição atualizada com sucesso')
      setEditModalOpen(false)
      setSelectedReg(null)
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedReg) return
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', selectedReg.id)
      if (error) throw error
      toast.success('Inscrição excluída com sucesso')
      setDeleteModalOpen(false)
      setSelectedReg(null)
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir')
    } finally {
      setDeleting(false)
    }
  }

  if (!roleChecked) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    )
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
              Gestão completa: listar, editar e excluir inscrições
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Download size={18} />}
            onClick={handleExport}
          >
            Exportar
          </Button>
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
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        Nenhuma inscrição encontrada
                      </td>
                    </tr>
                  ) : (
                    filtered.map((reg) => (
                      <tr key={reg.id}>
                        <td className="font-mono font-bold">{reg.registration_number || '-'}</td>
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
                            <span className="font-mono font-bold text-primary-600">{reg.bib_number}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">Não atribuído</span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(reg)}
                              className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1"
                            >
                              <Pencil size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => openDelete(reg)}
                              className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                            >
                              <Trash2 size={16} />
                              Excluir
                            </button>
                          </div>
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

      {/* Edit Modal */}
      {editModalOpen && selectedReg && (
        <EditInscritoModal
          reg={selectedReg}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedReg(null)
          }}
          onSave={handleSaveEdit}
          saving={saving}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Excluir inscrição</h2>
              <p className="text-gray-600 mb-4">
                Tem certeza que deseja excluir a inscrição de <strong>{selectedReg.athlete?.full_name}</strong> (Nº {selectedReg.registration_number})? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDeleteModalOpen(false)
                    setSelectedReg(null)
                  }}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

interface EditInscritoModalProps {
  reg: RegistrationRow
  onClose: () => void
  onSave: (athlete: Partial<AthleteData>, registration: { status: string; notes: string | null }) => Promise<void>
  saving: boolean
}

function EditInscritoModal({ reg, onClose, onSave, saving }: EditInscritoModalProps) {
  const [athlete, setAthlete] = useState({
    full_name: reg.athlete?.full_name || '',
    email: reg.athlete?.email || '',
    phone: reg.athlete?.phone || '',
    birth_date: reg.athlete?.birth_date?.slice(0, 10) || '',
    gender: reg.athlete?.gender || '',
    city: reg.athlete?.city || '',
    state: reg.athlete?.state || '',
    country: reg.athlete?.country || 'BRA',
    team_name: reg.athlete?.team_name || '',
    tshirt_size: reg.athlete?.tshirt_size || '',
  })
  const [status, setStatus] = useState(reg.status)
  const [notes, setNotes] = useState(reg.notes || '')

  useEffect(() => {
    setAthlete({
      full_name: reg.athlete?.full_name || '',
      email: reg.athlete?.email || '',
      phone: reg.athlete?.phone || '',
      birth_date: reg.athlete?.birth_date?.slice(0, 10) || '',
      gender: reg.athlete?.gender || '',
      city: reg.athlete?.city || '',
      state: reg.athlete?.state || '',
      country: reg.athlete?.country || 'BRA',
      team_name: reg.athlete?.team_name || '',
      tshirt_size: reg.athlete?.tshirt_size || '',
    })
    setStatus(reg.status)
    setNotes(reg.notes || '')
  }, [reg])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSave(
      {
        ...athlete,
        phone: athlete.phone || null,
        gender: athlete.gender || null,
        city: athlete.city || null,
        state: athlete.state || null,
        country: athlete.country || null,
        team_name: athlete.team_name || null,
        tshirt_size: athlete.tshirt_size || null,
      },
      { status, notes: notes.trim() || null }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-display font-bold text-gray-900">
            Editar inscrição – {reg.registration_number}
          </h2>
          <button onClick={onClose} disabled={saving} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Dados do atleta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={athlete.full_name}
                  onChange={(e) => setAthlete((a) => ({ ...a, full_name: e.target.value }))}
                  className="admin-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={athlete.email}
                  onChange={(e) => setAthlete((a) => ({ ...a, email: e.target.value }))}
                  className="admin-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={athlete.phone}
                  onChange={(e) => setAthlete((a) => ({ ...a, phone: e.target.value }))}
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento *</label>
                <input
                  type="date"
                  value={athlete.birth_date}
                  onChange={(e) => setAthlete((a) => ({ ...a, birth_date: e.target.value }))}
                  className="admin-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select
                  value={athlete.gender}
                  onChange={(e) => setAthlete((a) => ({ ...a, gender: e.target.value }))}
                  className="admin-input w-full"
                >
                  <option value="">Selecione</option>
                  <option value="M">M</option>
                  <option value="F">F</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={athlete.city}
                  onChange={(e) => setAthlete((a) => ({ ...a, city: e.target.value }))}
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input
                  type="text"
                  value={athlete.state}
                  onChange={(e) => setAthlete((a) => ({ ...a, state: e.target.value }))}
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                <input
                  type="text"
                  value={athlete.country}
                  onChange={(e) => setAthlete((a) => ({ ...a, country: e.target.value }))}
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipe</label>
                <input
                  type="text"
                  value={athlete.team_name}
                  onChange={(e) => setAthlete((a) => ({ ...a, team_name: e.target.value }))}
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho camiseta</label>
                <select
                  value={athlete.tshirt_size}
                  onChange={(e) => setAthlete((a) => ({ ...a, tshirt_size: e.target.value }))}
                  className="admin-input w-full"
                >
                  <option value="">Selecione</option>
                  <option value="PP">PP</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                  <option value="GG">GG</option>
                  <option value="XG">XG</option>
                  <option value="XXG">XXG</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Inscrição</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="admin-input w-full"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="admin-input w-full min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
