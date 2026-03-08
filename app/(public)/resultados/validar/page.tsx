'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { CheckCircle2, XCircle, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'

type ValidationData = {
  nome: string
  bib: number
  tempo: string
  posicao: number
  categoria: string
  ano?: number
  edicao?: number
  data?: string
  cidade: string
  estado: string
}

function formatDateBR(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr.slice(0, 10))
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function ValidarCertificadoContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [loading, setLoading] = useState(true)
  const [valid, setValid] = useState<boolean | null>(null)
  const [data, setData] = useState<ValidationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setValid(false)
      setError('ID do certificado não informado')
      setLoading(false)
      return
    }

    fetch(`/api/resultados/validar?id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((json) => {
        setValid(json.valid ?? false)
        setData(json.data ?? null)
        setError(json.error ?? null)
      })
      .catch(() => {
        setValid(false)
        setError('Erro ao validar certificado')
      })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="container-custom py-16">
        <div className="max-w-xl mx-auto">
          <div className="card p-8 text-center">
            <div className="flex justify-center mb-6">
              <Shield className="w-16 h-16 text-primary-600" />
            </div>
            <h1 className="font-display font-bold text-2xl mb-2">
              Validação de Certificado
            </h1>
            <p className="text-gray-600 mb-8">
              Verifique a autenticidade do certificado da Corrida Rústica de Macuco
            </p>

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
                <p className="text-gray-600">Validando certificado...</p>
              </div>
            ) : valid && data ? (
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-10 h-10 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Certificado válido</p>
                    <p className="text-sm text-green-700">
                      Este certificado foi emitido pela organização da Corrida Rústica de Macuco.
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-600 bg-gray-50 w-1/3">Atleta</td>
                        <td className="py-3 px-4 font-semibold">{data.nome}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-600 bg-gray-50">Nº Peito</td>
                        <td className="py-3 px-4">{data.bib}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-600 bg-gray-50">Tempo</td>
                        <td className="py-3 px-4 font-mono">{data.tempo}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-600 bg-gray-50">Colocação</td>
                        <td className="py-3 px-4">{data.posicao}º lugar</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-600 bg-gray-50">Categoria</td>
                        <td className="py-3 px-4">{data.categoria}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-600 bg-gray-50">Edição</td>
                        <td className="py-3 px-4">
                          {data.edicao != null ? `${data.edicao}ª` : ''} {data.ano != null ? `(${data.ano})` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-600 bg-gray-50">Data</td>
                        <td className="py-3 px-4">{formatDateBR(data.data)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-600 bg-gray-50">Local</td>
                        <td className="py-3 px-4">{data.cidade} - {data.estado}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <XCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800">Certificado inválido</p>
                    <p className="text-sm text-red-700">
                      {error || 'Não foi possível validar este certificado.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                href="/resultados"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Voltar aos resultados
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ValidarCertificadoPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    }>
      <ValidarCertificadoContent />
    </Suspense>
  )
}
