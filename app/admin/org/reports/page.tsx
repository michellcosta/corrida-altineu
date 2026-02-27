'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { FileText, Download, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'
import { getCountryLabel } from '@/lib/countries'

function formatOrigin(athlete: { city?: string | null; state?: string | null; country?: string | null }): string {
  if (athlete?.country && athlete.country !== 'BRA') return getCountryLabel(athlete.country)
  if (athlete?.city && athlete?.state) return `${athlete.city} - ${athlete.state}`
  if (athlete?.city) return athlete.city
  return ''
}

function escapeCsv(val: string | number | null | undefined): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)

  async function exportRegistrations() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
      if (!event) throw new Error('Evento não encontrado')
      const { data: regs } = await supabase
        .from('registrations')
        .select(`
          registration_number, status, bib_number, registered_at, payment_status, payment_amount,
          athlete:athletes(full_name, email, phone, gender, city, state, country, birth_date),
          category:categories(name)
        `)
        .eq('event_id', event.id)
        .order('registered_at', { ascending: false })
      const list = (regs || []) as any[]
      const headers = ['Nº', 'Nome', 'Email', 'Categoria', 'Origem', 'Status', 'Pagamento', 'Valor', 'Data']
      const rows = list.map((r) => [
        r.registration_number ?? '',
        r.athlete?.full_name ?? '',
        r.athlete?.email ?? '',
        r.category?.name ?? '',
        formatOrigin(r.athlete) ?? '',
        r.status ?? '',
        r.payment_status ?? '',
        r.payment_amount ?? '',
        r.registered_at ? new Date(r.registered_at).toLocaleString('pt-BR') : '',
      ])
      const csv = [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\r\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-inscricoes-2026.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Relatório exportado')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao exportar')
    } finally {
      setLoading(false)
    }
  }

  const reports = [
    { name: 'Resumo Executivo', desc: 'Inscrições completas em CSV', action: exportRegistrations },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Relatórios</h1>
          <p className="text-gray-600">Exporte relatórios e métricas organizacionais.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((r) => (
            <div
              key={r.name}
              className="admin-card flex items-center justify-between hover:border-primary-200 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900">{r.name}</p>
                <p className="text-sm text-gray-600">{r.desc}</p>
              </div>
              <button
                onClick={() => r.action()}
                disabled={loading}
                className="admin-button-secondary flex items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Baixar
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
