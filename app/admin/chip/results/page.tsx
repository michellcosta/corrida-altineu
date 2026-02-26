'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Upload, Loader2, FileText, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

// Converte "01:23:45" ou "1:23:45" para segundos
function parseTime(s: string): number | null {
  const m = s.trim().match(/^(\d+):(\d{2}):(\d{2})$/)
  if (m) return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10)
  const m2 = s.trim().match(/^(\d+):(\d{2})$/)
  if (m2) return parseInt(m2[1], 10) * 60 + parseInt(m2[2], 10)
  return null
}

function formatInterval(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)

  useEffect(() => {
    loadResults()
  }, [])

  async function loadResults() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
      setEventId(event?.id ?? null)
      if (!event) {
        setResults([])
        return
      }
      const { data } = await supabase
        .from('results')
        .select(`
          id, bib_number, net_time, position_overall, position_category, position_gender,
          registration:registrations(athlete:athletes(full_name), category:categories(name))
        `)
        .eq('event_id', event.id)
        .order('position_overall', { ascending: true })
      setResults(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !eventId) return
    try {
      setUploading(true)
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter((l) => l.trim())
      const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase())
      const bibIdx = headers.findIndex((h) => h.includes('bib') || h === 'numero' || h === 'nº')
      const timeIdx = headers.findIndex((h) => h.includes('tempo') || h.includes('time') || h === 'net')
      const posIdx = headers.findIndex((h) => h.includes('pos') || h.includes('colocacao'))
      const posCatIdx = headers.findIndex((h) => h.includes('categoria') || h.includes('cat'))
      const posGenIdx = headers.findIndex((h) => h.includes('sexo') || h.includes('genero'))

      if (bibIdx < 0 || timeIdx < 0) {
        toast.error('CSV deve ter colunas: bib/número e tempo (formato HH:MM:SS)')
        return
      }

      const supabase = createClient()
      const { data: regs } = await supabase
        .from('registrations')
        .select('id, bib_number, category_id')
        .eq('event_id', eventId)
        .not('bib_number', 'is', null)

      const regByBib = (regs || []).reduce<Record<number, any>>((acc, r) => {
        if (r.bib_number) acc[r.bib_number] = r
        return acc
      }, {})

      let imported = 0
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ''))
        const bib = parseInt(cols[bibIdx], 10)
        if (isNaN(bib)) continue
        const reg = regByBib[bib]
        if (!reg) continue

        const timeStr = cols[timeIdx] ?? ''
        const seconds = parseTime(timeStr)
        const netTime = seconds != null ? formatInterval(seconds) : null

        const { error } = await supabase.from('results').upsert(
          {
            registration_id: reg.id,
            event_id: eventId,
            category_id: reg.category_id,
            bib_number: bib,
            net_time: netTime,
            position_overall: posIdx >= 0 && cols[posIdx] ? parseInt(cols[posIdx], 10) : null,
            position_category: posCatIdx >= 0 && cols[posCatIdx] ? parseInt(cols[posCatIdx], 10) : null,
            position_gender: posGenIdx >= 0 && cols[posGenIdx] ? parseInt(cols[posGenIdx], 10) : null,
          },
          { onConflict: 'registration_id' }
        )
        if (!error) imported++
      }
      toast.success(`${imported} resultados importados`)
      await loadResults()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao importar')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function handleExport() {
    const headers = ['Pos', 'Bib', 'Nome', 'Categoria', 'Tempo', 'Pos Cat', 'Pos Sexo']
    const rows = results.map((r) => [
      r.position_overall ?? '',
      r.bib_number ?? '',
      r.registration?.athlete?.full_name ?? '',
      r.registration?.category?.name ?? '',
      r.net_time ?? '',
      r.position_category ?? '',
      r.position_gender ?? '',
    ])
    const csv = [headers.join(','), ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultados-2026-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exportado')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Resultados</h1>
            <p className="text-gray-600">Importe resultados da cronometragem em CSV.</p>
          </div>
          <div className="flex gap-3">
            <label className="admin-button-primary flex items-center gap-2 cursor-pointer">
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              {uploading ? 'Importando...' : 'Importar CSV'}
              <input type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
            </label>
            <button onClick={handleExport} className="admin-button-secondary flex items-center gap-2">
              <Download size={20} />
              Exportar
            </button>
          </div>
        </div>

        <div className="admin-card bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            <strong>Formato do CSV:</strong> Use colunas como <code>bib</code> ou <code>numero</code>, <code>tempo</code> (HH:MM:SS ou MM:SS), e opcionalmente <code>posicao</code>, <code>pos_categoria</code>, <code>pos_sexo</code>. Separador: vírgula ou ponto-e-vírgula.
          </p>
        </div>

        <div className="admin-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum resultado importado. Faça upload de um arquivo CSV.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Bib</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Tempo</th>
                    <th>Pos Cat</th>
                    <th>Pos Sexo</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td className="font-bold">{r.position_overall ?? '-'}</td>
                      <td className="font-mono">{r.bib_number}</td>
                      <td className="font-semibold">{r.registration?.athlete?.full_name ?? '-'}</td>
                      <td>{r.registration?.category?.name ?? '-'}</td>
                      <td className="font-mono">{r.net_time ?? '-'}</td>
                      <td>{r.position_category ?? '-'}</td>
                      <td>{r.position_gender ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
