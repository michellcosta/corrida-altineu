'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react'

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

  useEffect(() => {
    async function fetchLista() {
      try {
        const res = await fetch('/api/inscricao/lista', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Erro ao carregar lista')
        setData(json.data || [])
        if (json.edition != null) setEdition(json.edition)
        if (json.data?.length) {
          setExpandedCategories(new Set(json.data.map((c: CategoryGroup) => c.slug)))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar')
      } finally {
        setLoading(false)
      }
    }
    fetchLista()
  }, [])

  const toggleCategory = (slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
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
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Lista de <span className="text-primary-600">Inscritos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Confira os participantes inscritos na {edition}ª Corrida Rústica de Macuco, organizados por categoria.
          </p>
          <Link
            href="/inscricao/acompanhar"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
          >
            <Search size={20} />
            Consultar minha inscrição (CPF, RG ou código)
          </Link>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {data.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum inscrito ainda.</p>
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
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                      {cat.count} {cat.count === 1 ? 'inscrito' : 'inscritos'}
                    </span>
                  </div>
                  {expandedCategories.has(cat.slug) ? (
                    <ChevronUp className="w-6 h-6 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-500" />
                  )}
                </button>

                {expandedCategories.has(cat.slug) && (
                  <div className="border-t border-gray-200 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-6 py-3 text-sm font-semibold text-gray-700">Nº</th>
                          <th className="px-6 py-3 text-sm font-semibold text-gray-700">Nome</th>
                          <th className="px-6 py-3 text-sm font-semibold text-gray-700">Data de Nascimento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.inscritos.map((ins) => (
                          <tr key={ins.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                              {ins.registration_number ?? '-'}
                            </td>
                            <td className="px-6 py-3 font-medium text-gray-900">{ins.full_name}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">
                              {ins.birth_date ?? '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
