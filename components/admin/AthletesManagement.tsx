'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Download, Filter, Pencil, Trash2, Loader2, X, Copy, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browserClient'
import { getCountryLabel } from '@/lib/countries'
import { UserRole } from '@/lib/admin/types'
import { Button, Input, Badge, Card } from '@/components/ui'

// --- Types ---

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
    document_number?: string | null
}

interface RegistrationRow {
    id: string
    athlete_id: string
    registration_number: string | null
    confirmation_code: string | null
    status: string
    payment_status?: string | null
    bib_number: number | null
    notes: string | null
    registered_at: string
    athlete: AthleteData
    category: { id: string; name: string }
}

const STATUS_LABELS: Record<string, string> = {
    pending_payment: 'Pagamento Pendente',
    confirmed: 'Confirmado',
}

const STATUS_BADGE_MAP: Record<string, 'success' | 'warning' | 'info' | 'error'> = {
    confirmed: 'success',
    pending: 'warning',
    pending_payment: 'warning',
    pending_documents: 'warning',
    under_review: 'info',
    rejected: 'error',
    cancelled: 'info',
    updated: 'info',
}

// --- Utils ---

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

function escapeCsv(val: string | number | null | undefined): string {
    if (val == null) return ''
    const s = String(val)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
    }
    return s
}

// --- Main Component ---

interface AthletesManagementProps {
    userRole: UserRole
}

export default function AthletesManagement({ userRole }: AthletesManagementProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '')
    const [filterCategory, setFilterCategory] = useState('todas')
    const [filterStatus, setFilterStatus] = useState('todos')
    const [registrations, setRegistrations] = useState<RegistrationRow[]>([])
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, numerados: 0 })

    // Modals
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedReg, setSelectedReg] = useState<RegistrationRow | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Permissions
    const canEdit = userRole === UserRole.SITE_ADMIN
    const canDelete = userRole === UserRole.SITE_ADMIN
    const isChipAdmin = userRole === UserRole.CHIP_ADMIN

    // Sync search term with URL param and reload data when it changes (e.g. notification click)
    useEffect(() => {
        const paramSearch = searchParams.get('search') || ''
        setSearchTerm(paramSearch)
        loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    async function loadData() {
        try {
            setLoading(true)
            const res = await fetch('/api/inscricao/lista?admin=1', { credentials: 'include' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Erro ao carregar inscritos')

            setRegistrations((json.registrations as RegistrationRow[]) || [])
            setCategories(json.categories || [])
            setStats(json.stats || { total: 0, confirmed: 0, pending: 0, numerados: 0 })
        } catch (err: any) {
            console.error('Erro ao carregar inscritos:', err)
            toast.error(err.message || 'Erro ao carregar inscritos')
            setRegistrations([])
        } finally {
            setLoading(false)
        }
    }

    const filtered = useMemo(() => {
        return registrations.filter((reg) => {
            const matchSearch = !searchTerm || reg.athlete?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchCat = filterCategory === 'todas' || reg.category?.name === filterCategory
            const matchStatus = filterStatus === 'todos' || reg.status === filterStatus
            return matchSearch && matchCat && matchStatus
        })
    }, [registrations, searchTerm, filterCategory, filterStatus])

    async function handleExport() {
        try {
            const headers = ['Nº Inscrição', 'Nome', 'Email', 'Telefone', 'Categoria', 'Sexo', 'Origem', 'Nº Peito', 'Status', 'Data Inscrição']
            const rows = filtered.map((r) => [
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

    async function handleSaveEdit(athleteData: Partial<AthleteData>, registrationData: { status: string }) {
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
                    updated_at: new Date().toISOString(),
                })
                .eq('id', selectedReg.athlete_id)
            if (athleteError) throw athleteError

            const regUpdate: Record<string, unknown> = {
                status: registrationData.status,
                updated_at: new Date().toISOString(),
            }
            // Ao confirmar inscrição, marcar como gratuito (exceto se já pago)
            if (registrationData.status === 'confirmed' && selectedReg.payment_status !== 'paid') {
                regUpdate.payment_status = 'free'
            }

            const { error: regError } = await supabase
                .from('registrations')
                .update(regUpdate)
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

            // 1. Deletar a inscrição (registration)
            const { error: regError } = await supabase
                .from('registrations')
                .delete()
                .eq('id', selectedReg.id)
            if (regError) throw regError

            // 2. Verificar se o atleta possui outras inscrições
            const { data: otherRegs, error: checkError } = await supabase
                .from('registrations')
                .select('id')
                .eq('athlete_id', selectedReg.athlete_id)
                .limit(1)

            if (checkError) throw checkError

            // 3. Se não houver outras inscrições, deletar o atleta (athlete)
            if (!otherRegs || otherRegs.length === 0) {
                const docNumber = selectedReg.athlete?.document_number?.replace(/\D/g, '')
                const { error: athleteError } = await supabase
                    .from('athletes')
                    .delete()
                    .eq('id', selectedReg.athlete_id)

                // Nota: Se falhar aqui (ex: FK em outra tabela), não travamos o processo principal
                if (athleteError) {
                    console.warn('Não foi possível deletar o atleta órfão:', athleteError.message)
                } else if (docNumber && docNumber.length >= 5) {
                    // Limpar ai_usage para que a IA não continue reconhecendo o usuário excluído
                    try {
                        await fetch('/api/admin/ai-usage/cleanup', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ document_number: docNumber }),
                        })
                    } catch {
                        // Silencioso: não bloqueia a exclusão principal
                    }
                }
            }

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

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl md:text-3xl font-display font-bold text-gray-900 mb-1 md:mb-2">
                        Central de Inscritos
                    </h1>
                    <p className="text-sm md:text-base text-gray-600">
                        {canEdit ? 'Gestão completa: listar, editar e excluir inscrições' : 'Visualização e acompanhamento de inscrições'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                    {isChipAdmin && (
                        <Button
                            variant="secondary"
                            leftIcon={<Hash size={18} />}
                            onClick={() => router.push('/admin/chip/numbering')}
                        >
                            Atribuir Números
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        leftIcon={<Download size={18} />}
                        onClick={handleExport}
                    >
                        Exportar CSV
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
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
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

            {/* Table - Desktop */}
            <div className="admin-card hidden md:block">
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
                                    {(canEdit || canDelete) && <th className="text-right">Ações</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={canEdit || canDelete ? 8 : 7} className="text-center py-12 text-gray-500">
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
                                                    <span className="font-mono text-primary-600 font-bold">{reg.bib_number}</span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">Pendente</span>
                                                )}
                                            </td>
                                            {(canEdit || canDelete) && (
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => openEdit(reg)}
                                                                className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1"
                                                            >
                                                                <Pencil size={16} />
                                                                Editar
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => openDelete(reg)}
                                                                className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                                                            >
                                                                <Trash2 size={16} />
                                                                Excluir
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Cards - Mobile */}
            <div className="admin-card md:hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="text-center py-12 text-gray-500">Nenhuma inscrição encontrada</p>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((reg) => (
                            <div
                                key={reg.id}
                                className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 truncate">{reg.athlete?.full_name || '-'}</p>
                                        <p className="text-xs text-gray-500 font-mono">{reg.registration_number || '-'}</p>
                                    </div>
                                    <Badge variant={STATUS_BADGE_MAP[reg.status] || 'neutral'} className="shrink-0">
                                        {STATUS_LABELS[reg.status] || reg.status}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600 mb-3">
                                    <span>{reg.category?.name || '-'}</span>
                                    <span>•</span>
                                    <span>{reg.athlete?.gender || '-'}</span>
                                    <span>•</span>
                                    <span className="truncate">{formatOrigin(reg.athlete)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                        {reg.bib_number != null ? (
                                            <span className="font-mono text-primary-600 font-bold">Peito {reg.bib_number}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Peito pendente</span>
                                        )}
                                    </span>
                                    {(canEdit || canDelete) && (
                                        <div className="flex items-center gap-2">
                                            {canEdit && (
                                                <button
                                                    onClick={() => openEdit(reg)}
                                                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                                                    aria-label="Editar"
                                                >
                                                    <Pencil size={20} />
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => openDelete(reg)}
                                                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    aria-label="Excluir"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total</p>
                </Card>
                <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
                    <p className="text-sm text-gray-500">Confirmas</p>
                </Card>
                <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    <p className="text-sm text-gray-500">Pendentes</p>
                </Card>
                <Card className="text-center py-4">
                    <p className="text-2xl font-bold text-primary-600">{stats.numerados}</p>
                    <p className="text-sm text-gray-500">Numerados</p>
                </Card>
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
        </div>
    )
}

// --- Internal Components ---

interface EditInscritoModalProps {
    reg: RegistrationRow
    onClose: () => void
    onSave: (athlete: Partial<AthleteData>, registration: { status: string }) => Promise<void>
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
    })
    const [status, setStatus] = useState(reg.status)

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
        })
        setStatus(reg.status)
    }, [reg])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        await onSave(
            {
                ...athlete,
            },
            { status }
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
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Dados do Atleta</h3>
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
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
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
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Equipe</label>
                                <input
                                    type="text"
                                    value={athlete.team_name}
                                    onChange={(e) => setAthlete((a) => ({ ...a, team_name: e.target.value }))}
                                    className="admin-input w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg border-t pt-6">Inscrição</h3>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Confirmação</label>
                                <div className="flex items-center gap-2">
                                    <p className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-gray-900">
                                        {reg.confirmation_code || '-'}
                                    </p>
                                    {reg.confirmation_code && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(reg.confirmation_code!)
                                                toast.success('Código copiado!')
                                            }}
                                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={saving}>
                            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
