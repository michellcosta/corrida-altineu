'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Download, Loader2, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'
import { getCountryLabel } from '@/lib/countries'

function formatOrigin(athlete: { city?: string | null; state?: string | null; country?: string | null }): string {
  if (athlete?.country && athlete.country !== 'BRA') return getCountryLabel(athlete.country)
  if (athlete?.city && athlete?.state) return `${athlete.city} - ${athlete.state}`
  if (athlete?.city) return athlete.city
  return ''
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

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

export default function ExportsPage() {
  const [exporting, setExporting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'confirmed'>('all')

  async function handleExportCsv() {
    try {
      setExporting(true)
      const supabase = createClient()
      const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
      if (!event) {
        toast.error('Evento não encontrado')
        return
      }
      let query = supabase
        .from('registrations')
        .select(`
          id, registration_number, status, bib_number, registered_at,
          athlete:athletes(full_name, email, phone, gender, city, state, country, birth_date),
          category:categories(name)
        `)
        .eq('event_id', event.id)
        .order('registered_at', { ascending: false })
      if (filter === 'confirmed') query = query.eq('status', 'confirmed')
      const { data: regs, error } = await query
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
      a.download = `inscricoes-2026-${filter}-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exportado ${list.length} inscrições`)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao exportar')
    } finally {
      setExporting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Exportações</h1>
          <p className="text-gray-600">Exporte inscrições em CSV para uso em planilhas.</p>
        </div>

        <div className="admin-card max-w-xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Exportar Inscrições</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtro</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'confirmed')}
                className="admin-input w-full"
              >
                <option value="all">Todas as inscrições</option>
                <option value="confirmed">Apenas confirmadas</option>
              </select>
            </div>
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="admin-button-primary flex items-center gap-2"
            >
              {exporting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={20} />
              )}
              {exporting ? 'Exportando...' : 'Baixar CSV'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
