'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Users, ChevronDown, ChevronUp, Loader2, Search, ChevronRight } from 'lucide-react'

const INITIAL_SHOW = 50
const LOAD_MORE = 50

interface Inscrito {
  id: string
  registration_number: string | null
  full_name: string
  birth_date: string | null
}

interface CategoryGroup {
  slug: string
  name: string
  count: number
  inscritos: Inscrito[]
}

export default function ListaInscritosClient() {
  const [data, setData] = useState<CategoryGroup[]>([])
  const [edition, setEdition] = useState<number>(51)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchLista = useCallback(async (search = '') => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ t: String(Date.now()) })
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/inscricao/lista?${params}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar lista')
      setData(json.data || [])
      if (json.edition != null) setEdition(json.edition)
      if (json.data?.length) {
        setExpandedCategories(new Set(json.data.map((c: CategoryGroup) => c.slug)))
        setVisibleCount((prev) => {
          const next = { ...prev }
          json.data.forEach((c: CategoryGroup) => {
            next[c.slug] = INITIAL_SHOW
          })
          return next
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar lista (com busca se houver)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchTerm === '') {
      fetchLista('')
      return
    }
    debounceRef.current = setTimeout(() => {
      fetchLista(searchTerm)
      debounceRef.current = null
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchTerm, fetchLista])

  const toggleCategory = (slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const showMore = (slug: string) => {
    setVisibleCount((prev) => ({
      ...prev,
      [slug]: (prev[slug] ?? INITIAL_SHOW) + LOAD_MORE,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-24">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="mt-4 text-gray-600">Carregando lista de inscritos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-24">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <section className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
            Lista de <span className="text-primary-600">Inscritos</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Confira os participantes inscritos na {edition}ª Corrida Rústica de Macuco, organizados por categoria.
          </p>
          {searchTerm.trim() && (
            <p className="text-sm text-primary-600 mb-2">
              {data.reduce((acc, c) => acc + c.count, 0)} resultado(s) para &quot;{searchTerm.trim()}&quot;
            </p>
          )}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 w-full max-w-xl mx-auto">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome, CPF, RG ou código"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={50}
              />
            </div>
            <button
              type="button"
              onClick={() => fetchLista(searchTerm)}
              disabled={loading}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium disabled:opacity-50"
            >
              <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
              Atualizar lista
            </button>
          </div>
        </div>
      </section>

      <section className="pb-12 sm:pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {data.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm.trim()
                  ? `Nenhum resultado para "${searchTerm.trim()}". Tente outro termo.`
                  : 'Nenhum inscrito ainda.'}
              </p>
            </div>
          ) : (
            data.map((cat) => (
              <div
                key={cat.slug}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{cat.name}</h2>
                    <span className="flex-shrink-0 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                      {cat.count} {cat.count === 1 ? 'inscrito' : 'inscritos'}
                    </span>
                  </div>
                  {expandedCategories.has(cat.slug) ? (
                    <ChevronUp className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {expandedCategories.has(cat.slug) && (
                  <div className="border-t border-gray-200">
                    {(() => {
                      const limit = visibleCount[cat.slug] ?? INITIAL_SHOW
                      const visible = cat.inscritos.slice(0, limit)
                      const hasMore = cat.inscritos.length > limit
                      const remaining = cat.inscritos.length - limit

                      return (
                        <>
                          {/* Layout compacto: uma linha por atleta */}
                          <div className="divide-y divide-gray-100">
                            {visible.map((ins, index) => (
                              <div
                                key={ins.id}
                                className={`flex items-center gap-2 sm:gap-3 py-1.5 px-2 sm:px-3 text-xs sm:text-sm ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                                } hover:bg-blue-100`}
                              >
                                <span className="hidden sm:inline font-mono text-gray-500 shrink-0 w-28 sm:w-32 whitespace-nowrap overflow-hidden text-ellipsis">
                                  {ins.registration_number ?? '-'}
                                </span>
                                <span className="truncate flex-1 min-w-0 font-medium text-gray-900" title={ins.full_name}>
                                  {ins.full_name}
                                </span>
                                <span className="text-gray-500 shrink-0 w-20 sm:w-24 text-right">
                                  {ins.birth_date ?? '-'}
                                </span>
                              </div>
                            ))}
                          </div>

                          {hasMore && (
                            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                              <button
                                type="button"
                                onClick={() => showMore(cat.slug)}
                                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                                Mostrar mais {Math.min(LOAD_MORE, remaining)} de {remaining} restantes
                              </button>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
