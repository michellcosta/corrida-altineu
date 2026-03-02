'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Loader2, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'
import { getCountryLabel } from '@/lib/countries'
import ExcelJS from 'exceljs'

function formatDate(val: string | null | undefined): string {
  if (!val) return ''
  try {
    return new Date(val).toLocaleDateString('pt-BR')
  } catch {
    return String(val)
  }
}

const CATEGORY_ORDER = ['geral-10k', '60-mais-10k', 'morador-10k', 'infantil-2k']
const CATEGORY_SHEET_NAMES: Record<string, string> = {
  '60-mais-10k': '60+ 10K',
  'geral-10k': 'Geral 10K',
  'infantil-2k': 'Infantil 2.5K',
  'morador-10k': 'Morador 10K',
  outros: 'Outros',
}

const COLUMN_OPTIONS: { id: string; label: string; default: boolean }[] = [
  { id: 'nome', label: 'Nome', default: true },
  { id: 'data_nascimento', label: 'Data Nascimento', default: true },
  { id: 'sexo', label: 'Sexo', default: true },
  { id: 'telefone', label: 'Telefone', default: true },
  { id: 'equipe', label: 'Equipe', default: true },
  { id: 'categoria', label: 'Categoria', default: true },
  { id: 'pais', label: 'País', default: true },
  { id: 'email', label: 'Email', default: false },
  { id: 'whatsapp', label: 'WhatsApp', default: false },
  { id: 'cidade', label: 'Cidade', default: false },
  { id: 'estado', label: 'Estado', default: false },
  { id: 'numero_inscricao', label: 'Nº Inscrição', default: false },
  { id: 'data_inscricao', label: 'Data inscrição', default: false },
]

const DEFAULT_COLUMNS = new Set(COLUMN_OPTIONS.filter((c) => c.default).map((c) => c.id))

function buildHeadersAndRow(selectedIds: Set<string>) {
  const order = COLUMN_OPTIONS.map((c) => c.id).filter((id) => selectedIds.has(id))
  const headers = order.map((id) => COLUMN_OPTIONS.find((c) => c.id === id)!.label)

  const rowFromReg = (r: any): (string | number)[] => {
    const row: (string | number)[] = []
    for (const id of order) {
      switch (id) {
        case 'nome':
          row.push(r.athlete?.full_name ?? '')
          break
        case 'data_nascimento':
          row.push(formatDate(r.athlete?.birth_date) ?? '')
          break
        case 'sexo':
          row.push(r.athlete?.gender === 'M' ? 'M' : r.athlete?.gender === 'F' ? 'F' : r.athlete?.gender ?? '')
          break
        case 'telefone':
          row.push(r.athlete?.phone ?? '')
          break
        case 'equipe':
          row.push(r.athlete?.team_name ?? '')
          break
        case 'categoria':
          row.push(r.category?.name ?? '')
          break
        case 'pais':
          row.push(r.athlete?.country ? (r.athlete.country === 'BRA' ? 'Brasil' : getCountryLabel(r.athlete.country)) : '')
          break
        case 'email':
          row.push(r.athlete?.email ?? '')
          break
        case 'whatsapp':
          row.push(r.athlete?.whatsapp ?? '')
          break
        case 'cidade':
          row.push(r.athlete?.city ?? '')
          break
        case 'estado':
          row.push(r.athlete?.state ?? '')
          break
        case 'numero_inscricao':
          row.push(r.registration_number ?? '')
          break
        case 'data_inscricao':
          row.push(r.registered_at ? new Date(r.registered_at).toLocaleString('pt-BR') : '')
          break
        default:
          row.push('')
      }
    }
    return row
  }
  return { headers, rowFromReg }
}

const EXPORT_BUTTONS: { slug: string; label: string; description: string }[] = [
  { slug: 'geral-10k', label: 'Geral 10K', description: 'Apenas inscritos confirmados na prova principal de 10 km (categoria aberta).' },
  { slug: '60-mais-10k', label: '60+ 10K', description: 'Apenas inscritos confirmados na categoria 60 anos ou mais (10 km).' },
  { slug: 'morador-10k', label: 'Morador 10K', description: 'Apenas inscritos confirmados na categoria exclusiva para moradores de Macuco (10 km).' },
  { slug: 'infantil-2k', label: 'Infantil 2,5K', description: 'Apenas inscritos confirmados na prova infantil de 2,5 km.' },
]

export default function ExportsPage() {
  const [exporting, setExporting] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(() => new Set(DEFAULT_COLUMNS))

  function toggleColumn(id: string) {
    setSelectedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function fetchRegistrations() {
    const supabase = createClient()
    const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
    if (!event) throw new Error('Evento não encontrado')

    const { data: regs, error } = await supabase
      .from('registrations')
      .select(`
        id, registration_number, confirmation_code, status, bib_number, registered_at,
        athlete:athletes(full_name, email, phone, whatsapp, gender, city, state, country, birth_date, team_name),
        category:categories(name, slug)
      `)
      .eq('event_id', event.id)
      .eq('status', 'confirmed')
      .order('registered_at', { ascending: false })

    if (error) throw error
    return (regs || []) as any[]
  }

  function sortByRegNumber(list: any[]) {
    const parseNum = (rn: string | null): number => {
      if (!rn) return 999999
      const m = String(rn).match(/-(\d+)$/)
      return m ? parseInt(m[1], 10) : 999999
    }
    return [...list].sort((a, b) => parseNum(a.registration_number) - parseNum(b.registration_number))
  }

  async function downloadExcel(wb: ExcelJS.Workbook, filename: string) {
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const HEADER_STYLE: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F2F2F' } },
    alignment: { horizontal: 'left', vertical: 'middle' },
  }

  function addStyledDataSheet(
    wb: ExcelJS.Workbook,
    sheetName: string,
    headers: string[],
    rows: (string | number)[][]
  ) {
    const ws = wb.addWorksheet(sheetName.substring(0, 31))
    const data = [headers, ...rows]
    ws.addRows(data)
    const lastCol = String.fromCharCode(64 + headers.length)
    const lastRow = data.length
    for (let c = 1; c <= headers.length; c++) {
      const cell = ws.getCell(1, c)
      cell.style = HEADER_STYLE
    }
    ws.autoFilter = { from: 'A1', to: `${lastCol}${lastRow}` }
    headers.forEach((h, i) => {
      ws.getColumn(i + 1).width = Math.max(12, Math.min(35, (h?.length ?? 10) + 8))
    })
  }

  async function handleExportByCategory(slug: string) {
    if (selectedColumns.size === 0) {
      toast.error('Selecione pelo menos uma coluna para exportar.')
      return
    }
    try {
      setExporting(slug)
      const list = await fetchRegistrations()
      const items = sortByRegNumber(list.filter((r) => (r.category?.slug || 'outros') === slug))
      const sheetName = CATEGORY_SHEET_NAMES[slug] || slug
      const { headers, rowFromReg } = buildHeadersAndRow(selectedColumns)
      const rows = items.map(rowFromReg)
      const wb = new ExcelJS.Workbook()
      addStyledDataSheet(wb, sheetName, headers, rows)
      await downloadExcel(wb, `inscricoes-2026-${slug}-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success(`Exportado ${items.length} inscritos (${sheetName})`)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao exportar')
    } finally {
      setExporting(null)
    }
  }

  async function handleExportAll() {
    if (selectedColumns.size === 0) {
      toast.error('Selecione pelo menos uma coluna para exportar.')
      return
    }
    try {
      setExporting('all')
      const list = await fetchRegistrations()
      const byCategory = new Map<string, any[]>()
      for (const r of list) {
        const slug = r.category?.slug || 'outros'
        if (!byCategory.has(slug)) byCategory.set(slug, [])
        byCategory.get(slug)!.push(r)
      }
      for (const arr of byCategory.values()) {
        arr.sort((a: any, b: any) => {
          const parseNum = (rn: string | null): number => {
            if (!rn) return 999999
            const m = String(rn).match(/-(\d+)$/)
            return m ? parseInt(m[1], 10) : 999999
          }
          return parseNum(a.registration_number) - parseNum(b.registration_number)
        })
      }

      const wb = new ExcelJS.Workbook()
      const summaryData: (string | number)[][] = [['Categoria', 'Total']]
      const seenSlugs = new Set<string>()

      const { headers, rowFromReg } = buildHeadersAndRow(selectedColumns)
      for (const slug of [...CATEGORY_ORDER, 'outros']) {
        const items = byCategory.get(slug) || []
        if (items.length === 0) continue
        seenSlugs.add(slug)
        const sheetName = CATEGORY_SHEET_NAMES[slug] || slug
        const rows = items.map(rowFromReg)
        addStyledDataSheet(wb, sheetName, headers, rows)
        summaryData.push([sheetName, items.length])
      }

      for (const [slug, items] of byCategory) {
        if (!seenSlugs.has(slug) && items.length > 0) {
          const sheetName = (CATEGORY_SHEET_NAMES[slug] || items[0]?.category?.name || slug).substring(0, 31)
          const rows = items.map(rowFromReg)
          addStyledDataSheet(wb, sheetName, headers, rows)
          summaryData.push([sheetName, items.length])
        }
      }

      addStyledDataSheet(wb, 'Resumo', ['Categoria', 'Total'], summaryData.slice(1))

      await downloadExcel(wb, `inscricoes-2026-todas-${new Date().toISOString().slice(0, 10)}.xlsx`)
      toast.success(`Exportado ${list.length} inscrições em Excel`)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao exportar')
    } finally {
      setExporting(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Exportações</h1>
          <p className="text-gray-600">Exporte inscrições confirmadas em Excel (.xlsx). Escolha por categoria ou baixe tudo.</p>
        </div>

        <div className="admin-card max-w-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Colunas do Excel</h2>
          <p className="text-sm text-gray-500 mb-4">
            Marque as colunas que deseja incluir no arquivo exportado.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
            {COLUMN_OPTIONS.map((col) => (
              <label key={col.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColumns.has(col.id)}
                  onChange={() => toggleColumn(col.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{col.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="admin-card max-w-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Exportar por categoria</h2>
          <p className="text-sm text-gray-500 mb-6">
            Cada botão gera um arquivo Excel com apenas os inscritos confirmados daquela categoria.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {EXPORT_BUTTONS.map(({ slug, label, description }) => (
              <div
                key={slug}
                className="flex flex-col p-4 border border-gray-200 rounded-lg hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
              >
                <p className="text-sm text-gray-600 mb-4 flex-1">{description}</p>
                <button
                  onClick={() => handleExportByCategory(slug)}
                  disabled={exporting !== null}
                  className="admin-button-primary flex items-center justify-center gap-2 w-full shrink-0"
                >
                  {exporting === slug ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <FileSpreadsheet size={18} />
                  )}
                  {exporting === slug ? 'Exportando...' : label}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card max-w-2xl">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Exportar Total (todas as abas)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Gera um único arquivo Excel com uma aba para cada categoria (60+ 10K, Geral 10K, Infantil 2.5K, Morador 10K) e uma aba Resumo com o total de inscritos por categoria. Ideal para ter tudo em um só arquivo.
          </p>
          <button
            onClick={handleExportAll}
            disabled={exporting !== null}
            className="admin-button-primary flex items-center gap-2"
          >
            {exporting === 'all' ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={20} />
            )}
            {exporting === 'all' ? 'Exportando...' : 'Total Abas'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
