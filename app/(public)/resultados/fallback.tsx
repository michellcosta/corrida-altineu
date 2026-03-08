'use client'

import { Search, Download, Trophy, Loader2, FileDown } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

const LIMIT_OPTIONS = [20, 40, 60] as const

type ResultItem = {
  id: string
  position_overall?: number | string
  bib_number: number
  full_name: string
  category_name?: string
  city?: string
  age?: number | string
  faixa?: string
  gender?: string
  team_name?: string
  net_time: string
  pace?: string
  position_category?: number | string
  position_gender?: number | string
  certificate_url?: string | null
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export default function ResultadosPage() {
  const [selectedYear, setSelectedYear] = useState<2025 | 2026>(2026)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('todos')
  const [filterGender, setFilterGender] = useState('todos')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const [data, setData] = useState<ResultItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [bestTimeM, setBestTimeM] = useState<string | null>(null)
  const [bestTimeF, setBestTimeF] = useState<string | null>(null)
  const [completionRate, setCompletionRate] = useState<number | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingExcel, setExportingExcel] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('year', String(selectedYear))
      params.set('page', String(page))
      params.set('limit', String(limit))
      params.set('categoria', filterCategory)
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (filterGender !== 'todos') params.set('sexo', filterGender)

      const res = await fetch(`/api/resultados?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar')

      setData(json.data || [])
      setTotal(json.total ?? 0)
      setTotalPages(json.totalPages ?? 0)
      setBestTimeM(json.bestTimeM ?? null)
      setBestTimeF(json.bestTimeF ?? null)
      setCompletionRate(json.completionRate ?? null)
    } catch {
      setData([])
      setTotal(0)
      setTotalPages(0)
      setBestTimeM(null)
      setBestTimeF(null)
      setCompletionRate(null)
    } finally {
      setLoading(false)
    }
  }, [selectedYear, page, limit, filterCategory, filterGender, debouncedSearch])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  useEffect(() => {
    setPage(1)
  }, [selectedYear, limit, filterCategory, filterGender, debouncedSearch])

  async function fetchAllForExport(): Promise<ResultItem[]> {
    const params = new URLSearchParams()
    params.set('year', String(selectedYear))
    params.set('page', '1')
    params.set('limit', '5000')
    params.set('export', '1')
    params.set('categoria', filterCategory)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (filterGender !== 'todos') params.set('sexo', filterGender)
    const res = await fetch(`/api/resultados?${params}`)
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Erro ao carregar')
    return json.data || []
  }

  async function handleExportPdf() {
    try {
      setExportingPdf(true)
      const items = await fetchAllForExport()
      if (items.length === 0) {
        alert('Nenhum resultado para exportar')
        return
      }
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      doc.setFontSize(16)
      const edicao = selectedYear === 2025 ? '50ª' : '51ª'
      doc.text(`Resultados - ${edicao} Corrida Rústica de Macuco`, 14, 12)
      doc.setFontSize(10)
      doc.text(`Exportado em ${new Date().toLocaleDateString('pt-BR')} - ${items.length} atletas`, 14, 18)
      const tableData = items.map((r) => [
        String(r.position_overall ?? ''),
        r.bib_number,
        r.full_name ?? '',
        r.gender === 'M' ? 'M' : r.gender === 'F' ? 'F' : '-',
        String(r.age ?? '-'),
        r.team_name || '-',
        r.net_time ?? '-',
      ])
      autoTable(doc, {
        startY: 24,
        head: [['Pos', 'Nº', 'Nome', 'Sexo', 'Idade', 'Equipe', 'Tempo']],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] },
      })
      doc.save(`resultados-${selectedYear === 2025 ? '50a' : '51a'}-corrida-macuco-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Erro ao gerar PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  async function handleExportExcel() {
    try {
      setExportingExcel(true)
      const items = await fetchAllForExport()
      if (items.length === 0) {
        alert('Nenhum resultado para exportar')
        return
      }
      const wb = new ExcelJS.Workbook()
      wb.creator = 'Corrida Rústica de Macuco'
      const ws = wb.addWorksheet('Resultados', { views: [{ state: 'frozen', ySplit: 1 }] })
      ws.columns = [
        { header: 'Pos', key: 'pos', width: 6 },
        { header: 'Nº', key: 'bib', width: 6 },
        { header: 'Nome', key: 'nome', width: 35 },
        { header: 'Sexo', key: 'sexo', width: 6 },
        { header: 'Idade', key: 'idade', width: 6 },
        { header: 'Equipe', key: 'equipe', width: 25 },
        { header: 'Tempo', key: 'tempo', width: 12 },
      ]
      ws.getRow(1).font = { bold: true }
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
      items.forEach((r) => {
        ws.addRow({
          pos: r.position_overall,
          bib: r.bib_number,
          nome: r.full_name,
          sexo: r.gender === 'M' ? 'M' : r.gender === 'F' ? 'F' : '-',
          idade: r.age ?? '-',
          equipe: r.team_name || '-',
          tempo: r.net_time,
        })
      })
      const buf = await wb.xlsx.writeBuffer()
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resultados-${selectedYear === 2025 ? '50a' : '51a'}-corrida-macuco-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Erro ao gerar Excel')
    } finally {
      setExportingExcel(false)
    }
  }

  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl">
            <Trophy className="mb-6" size={64} />
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Resultados
            </h1>
            <p className="text-xl text-indigo-100 leading-relaxed">
              Confira os resultados oficiais da Corrida Rústica de Macuco. Busque por nome ou número de peito.
            </p>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          {/* Edições Anteriores */}
          <div className="mb-12">
            <h2 className="section-title text-center mb-8">
              Selecione a <span className="text-gradient">Edição</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {(['2026 (51ª)', '2025 (50ª)'] as const).map((edicao) => {
                const year = edicao.includes('2025') ? 2025 : 2026
                const isCurrentEdition = year === new Date().getFullYear()
                return (
                  <button
                    key={edicao}
                    onClick={() => setSelectedYear(year)}
                    className={`relative px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedYear === year
                        ? isCurrentEdition
                          ? 'bg-primary-600 text-white shadow-lg ring-2 ring-primary-400 ring-offset-2'
                          : 'bg-primary-600 text-white shadow-lg'
                        : isCurrentEdition
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-primary-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {edicao}
                    {isCurrentEdition && (
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold bg-primary-500 text-white rounded-full shadow">
                        Atual
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Busca */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Buscar Atleta
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Nome ou número de peito..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="todos">Todas</option>
                    <option value="geral-10k">Geral 10K</option>
                    <option value="60-mais-10k">60+ 10K</option>
                  </select>
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sexo
                  </label>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleExportPdf}
                  disabled={exportingPdf || total === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {exportingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {exportingPdf ? 'Gerando PDF...' : 'Baixar Resultados (PDF)'}
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exportingExcel || total === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {exportingExcel ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {exportingExcel ? 'Gerando Excel...' : 'Exportar (Excel)'}
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Resultados */}
          <div className="max-w-6xl mx-auto">
            <div className="card overflow-x-auto shadow-md rounded-xl p-6">
              <h3 className="font-display font-bold text-2xl mb-6">
                Resultados - {selectedYear === 2025 ? '50ª' : '51ª'} Edição
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                </div>
              ) : (
                <>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-200">
                        <th className="text-center py-4 px-2 font-semibold text-gray-700">Pos</th>
                        <th className="text-center py-4 px-2 font-semibold text-gray-700">Nº</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 min-w-[200px]">Nome</th>
                        <th className="text-center py-4 px-2 font-semibold text-gray-700">Sexo</th>
                        <th className="text-center py-4 px-3 font-semibold text-gray-700">Idade</th>
                        <th className="text-left py-4 px-3 font-semibold text-gray-700">Equipe</th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-700">Tempo</th>
                        <th className="text-center py-4 px-3 font-semibold text-gray-700">Certificado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.length > 0 ? (
                        data.map((r, index) => (
                          <tr
                            key={r.id}
                            className={`border-b border-gray-100 hover:bg-indigo-50/30 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                            }`}
                          >
                            <td className="py-3 px-3 text-center font-semibold text-gray-700">
                              {r.position_overall}
                            </td>
                            <td className="py-3 px-3 text-center text-gray-600 font-mono font-medium">
                              {r.bib_number}
                            </td>
                            <td className="py-3 px-4 font-semibold text-gray-800 text-sm min-w-[200px]">
                              {r.full_name}
                            </td>
                            <td className="py-3 px-3 text-center text-gray-600">
                              {r.gender === 'M' ? 'M' : r.gender === 'F' ? 'F' : '-'}
                            </td>
                            <td className="py-3 px-3 text-center text-gray-600">
                              {r.age ?? '-'}
                            </td>
                            <td className="py-3 px-3 text-gray-600">
                              {r.team_name || '-'}
                            </td>
                            <td className="py-3 px-4 text-right text-primary-600 font-mono font-medium">
                              {r.net_time}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <a
                                href={r.certificate_url || `/api/resultados/certificado/${r.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                <FileDown size={16} />
                                Certificado
                              </a>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-gray-500">
                            <Search className="mx-auto mb-4 text-gray-400" size={48} />
                            <p className="font-semibold">Nenhum resultado encontrado</p>
                            <p className="text-sm">Tente ajustar seus filtros de busca</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Paginação */}
                  {(totalPages > 1 || total > 0) && (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600">
                          Mostrando {from}-{to} de {total} resultados
                        </p>
                        <select
                          value={limit}
                          onChange={(e) => {
                            setLimit(Number(e.target.value))
                            setPage(1)
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {LIMIT_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                              {n} por página
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Anterior
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let p: number
                          if (totalPages <= 5) {
                            p = i + 1
                          } else if (page <= 3) {
                            p = i + 1
                          } else if (page >= totalPages - 2) {
                            p = totalPages - 4 + i
                          } else {
                            p = page - 2 + i
                          }
                          return (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`w-9 h-9 rounded font-medium ${
                                page === p
                                  ? 'bg-primary-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        })}
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Próximo
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="card text-center">
              <p className="text-4xl font-bold text-primary-600 mb-2">{total}</p>
              <p className="text-gray-600">Atletas Total</p>
            </div>
            <div className="card text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">
                {bestTimeM ?? '-'}
              </p>
              <p className="text-gray-600">Melhor Tempo M</p>
            </div>
            <div className="card text-center">
              <p className="text-4xl font-bold text-pink-600 mb-2">
                {bestTimeF ?? '-'}
              </p>
              <p className="text-gray-600">Melhor Tempo F</p>
            </div>
            <div className="card text-center">
              <p className="text-4xl font-bold text-orange-600 mb-2">
                {completionRate != null ? `${completionRate}%` : '-'}
              </p>
              <p className="text-gray-600">Taxa Conclusão</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
