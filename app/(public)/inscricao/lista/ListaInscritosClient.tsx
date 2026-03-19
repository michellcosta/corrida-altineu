'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  ChevronRight,
  MapPin,
  Globe,
  MessageCircle,
  Trophy,
  Info,
} from 'lucide-react'

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

interface RankingRow {
  label: string
  count: number
}

interface PublicRankings {
  totalConfirmados: number
  municipios: RankingRow[]
  paises: RankingRow[]
  genero: { masculino: number; feminino: number; outros: number }
}

const emptyRankings: PublicRankings = {
  totalConfirmados: 0,
  municipios: [],
  paises: [],
  genero: { masculino: 0, feminino: 0, outros: 0 },
}

/** Texto explicativo do bloco “Ranking de municípios” (exibido ao tocar no ícone ℹ️) */
const RANKINGS_INFO_TEXT = 'Sem prêmio oficial: é só pra animar e compartilhar.'

function buildShareText(edition: number, r: PublicRankings, pageUrl: string): string {
  const lines: string[] = []
  lines.push(`🏃 Ranking de municípios — Corrida Rústica de Macuco (${edition}ª edição)`)
  lines.push('')
  lines.push(`📊 Total de inscritos confirmados: *${r.totalConfirmados}*`)
  if (r.genero.masculino + r.genero.feminino + r.genero.outros > 0) {
    const outrosPart =
      r.genero.outros > 0 ? ` · *${r.genero.outros}* outros` : ''
    lines.push(`👥 Sexo: *${r.genero.masculino}* M · *${r.genero.feminino}* F${outrosPart}`)
  }
  lines.push('')
  if (r.municipios.length > 0) {
    lines.push(`📍 Municípios:  _(top 5)_`)
    r.municipios.slice(0, 5).forEach((x, i) => {
      lines.push(`· ${i + 1}º ${x.label} (${x.count})`)
    })
  }
  if (r.paises.length > 0) {
    lines.push('')
    const top = r.paises.slice(0, 5)
    if (top.length === 1) {
      lines.push(`🌍 Países: 1º ${top[0].label} (${top[0].count})`)
    } else {
      lines.push(`🌍 Países:  _(top 5)_`)
      top.forEach((x, i) => {
        lines.push(`· ${i + 1}º ${x.label} (${x.count})`)
      })
    }
  }
  lines.push('')
  if (pageUrl.trim()) {
    lines.push(`Veja o ranking atualizado em: ${pageUrl}`)
  } else {
    lines.push('Veja o ranking atualizado no site oficial da Corrida Rústica de Macuco.')
  }
  return lines.join('\n')
}

export default function ListaInscritosClient() {
  const [data, setData] = useState<CategoryGroup[]>([])
  const [rankings, setRankings] = useState<PublicRankings>(emptyRankings)
  const [edition, setEdition] = useState<number>(51)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>({})
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [rankingsExpanded, setRankingsExpanded] = useState(true)
  const [rankingsInfoOpen, setRankingsInfoOpen] = useState(false)
  /** Após a 1ª resposta da API, buscas não ocupam a tela inteira com spinner */
  const hasFetchedOnce = useRef(false)
  const searchFieldRef = useRef<HTMLInputElement>(null)

  const [publicListUrl, setPublicListUrl] = useState('')
  useEffect(() => {
    setPublicListUrl(`${window.location.origin}/inscricao/lista`)
  }, [])

  const shareText = useMemo(
    () => buildShareText(edition, rankings, publicListUrl),
    [edition, rankings, publicListUrl]
  )

  const whatsappHref = useMemo(() => `https://wa.me/?text=${encodeURIComponent(shareText)}`, [shareText])

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
      if (json.rankings) {
        setRankings({
          totalConfirmados: json.rankings.totalConfirmados ?? 0,
          municipios: json.rankings.municipios ?? [],
          paises: json.rankings.paises ?? [],
          genero: {
            masculino: json.rankings.genero?.masculino ?? 0,
            feminino: json.rankings.genero?.feminino ?? 0,
            outros: json.rankings.genero?.outros ?? 0,
          },
        })
      } else {
        setRankings(emptyRankings)
      }
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
      hasFetchedOnce.current = true
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchLista('')
  }, [fetchLista])

  const submitSearch = useCallback(() => {
    searchFieldRef.current?.blur()
    const q = searchInput.trim()
    setAppliedSearch(q)
    setRankingsExpanded(false)
    void fetchLista(q)
  }, [searchInput, fetchLista])

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

  if (loading && !hasFetchedOnce.current) {
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

  const showRankings = rankings.totalConfirmados > 0

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
          {appliedSearch.trim() && (
            <p className="text-sm text-primary-600 mb-2">
              {data.reduce((acc, c) => acc + c.count, 0)} resultado(s) para &quot;{appliedSearch.trim()}&quot;
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xl mx-auto">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                ref={searchFieldRef}
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    submitSearch()
                  }
                }}
                placeholder="Pesquisar por nome, CPF, RG ou código"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={50}
                enterKeyHint="search"
                aria-label="Termo de busca"
              />
            </div>
            <button
              type="button"
              onClick={submitSearch}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Search className="h-4 w-4" aria-hidden />
              )}
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Competição amistosa — rankings (recolhível; inicia expandido; ℹ️ à direita do título) */}
      {showRankings && (
        <section className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="flex items-stretch bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
                <button
                  type="button"
                  onClick={() => setRankingsExpanded((v) => !v)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:gap-4 px-3 py-2.5 text-left transition-colors hover:bg-white/10 sm:px-4 sm:py-3"
                  aria-expanded={rankingsExpanded}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Trophy className="h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold sm:text-base">Ranking de municípios</p>
                      <p className="truncate text-xs text-blue-100">
                        {rankings.totalConfirmados} insc. · M {rankings.genero.masculino} · F{' '}
                        {rankings.genero.feminino}
                        {rankings.genero.outros > 0 ? ` · Outros ${rankings.genero.outros}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="hidden shrink-0 text-xs text-blue-100 sm:inline">
                    {rankingsExpanded ? 'Recolher' : 'Expandir'}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-300 ease-out ${
                      rankingsExpanded ? 'rotate-180' : 'rotate-0'
                    }`}
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setRankingsInfoOpen((v) => !v)}
                  className="flex shrink-0 items-center justify-center border-l border-white/25 px-3 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  aria-expanded={rankingsInfoOpen}
                  aria-label={rankingsInfoOpen ? 'Ocultar informações sobre este panorama' : 'Informações sobre este panorama'}
                  title="Informações"
                >
                  <Info className="h-5 w-5 text-white" strokeWidth={2.5} />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {rankingsInfoOpen && (
                  <motion.div
                    key="rankings-info"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden border-b border-gray-200 bg-slate-50"
                  >
                    <div className="px-3 py-2.5 sm:px-4">
                      <p className="text-xs leading-relaxed text-gray-700">{RANKINGS_INFO_TEXT}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {rankingsExpanded && (
                  <motion.div
                    key="rankings-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <div className="space-y-4 p-3 sm:p-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>Municípios</span>
                        <span className="font-normal normal-case text-gray-400">(top 5)</span>
                      </h3>
                      {rankings.municipios.length === 0 ? (
                        <p className="text-xs text-gray-500">
                          Cidade/UF no cadastro. Estrangeiros só em Países.
                        </p>
                      ) : (
                        <ol className="space-y-1">
                          {rankings.municipios.slice(0, 5).map((row, idx) => (
                            <li
                              key={row.label}
                              className="flex items-center justify-between gap-2 text-xs bg-gray-50 rounded-md px-2 py-1.5"
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                {idx < 3 ? (
                                  <span
                                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-base leading-none"
                                    title={idx === 0 ? '1º' : idx === 1 ? '2º' : '3º'}
                                    aria-hidden
                                  >
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                  </span>
                                ) : (
                                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                )}
                                <span className="truncate text-gray-800">{row.label}</span>
                              </span>
                              <span className="font-semibold text-gray-900 shrink-0">{row.count}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>

                    <div>
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        Países
                      </h3>
                      {rankings.paises.length === 0 ? (
                        <p className="text-xs text-gray-500">Sem dados de país.</p>
                      ) : (
                        <ol className="space-y-1">
                          {rankings.paises.slice(0, 5).map((row, idx) => (
                            <li
                              key={row.label}
                              className="flex items-center justify-between gap-2 text-xs bg-gray-50 rounded-md px-2 py-1.5"
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="truncate text-gray-800">{row.label}</span>
                              </span>
                              <span className="font-semibold text-gray-900 shrink-0">{row.count}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 w-full">
                    <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Sexo
                    </h3>
                    <div className="flex w-full min-w-0 rounded-lg border border-gray-200 overflow-hidden text-xs">
                      <div className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 py-1.5 px-2">
                        <span className="text-gray-500 font-medium">M</span>
                        <span className="text-base font-bold text-blue-700 tabular-nums">
                          {rankings.genero.masculino}
                        </span>
                      </div>
                      <div className="w-px bg-gray-200 shrink-0" aria-hidden />
                      <div className="flex-1 flex items-center justify-center gap-1.5 bg-pink-50 py-1.5 px-2">
                        <span className="text-gray-500 font-medium">F</span>
                        <span className="text-base font-bold text-pink-700 tabular-nums">
                          {rankings.genero.feminino}
                        </span>
                      </div>
                      {rankings.genero.outros > 0 && (
                        <>
                          <div className="w-px bg-gray-200 shrink-0" aria-hidden />
                          <div className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 py-1.5 px-2">
                            <span className="text-gray-500 font-medium">Out.</span>
                            <span className="text-base font-bold text-gray-700 tabular-nums">
                              {rankings.genero.outros}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold py-2 px-3 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Compartilhar no WhatsApp
                    </a>
                  </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      <section className="pb-12 sm:pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {data.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {appliedSearch.trim()
                  ? `Nenhum resultado para "${appliedSearch.trim()}". Tente outro termo.`
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
