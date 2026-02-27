'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function InscricaoSucessoClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') || searchParams.get('payment_id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    registration_number: string
    confirmation_code: string
    category_name: string
  } | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Sessão de pagamento não encontrada.')
      setLoading(false)
      return
    }

    fetch(`/api/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Erro ao verificar pagamento')
        setData(json)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary-600" size={48} />
        <p className="mt-4 text-gray-600">Verificando seu pagamento...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container-custom py-16">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-600" size={48} />
          </div>
          <h1 className="font-display font-bold text-2xl mb-4">Não foi possível confirmar</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/inscricao/acompanhar" className="btn-primary">
            Consultar inscrição
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-custom py-16">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h1 className="font-display font-bold text-3xl mb-4">
            Pagamento Confirmado! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Sua inscrição na 51ª Corrida Rústica de Macuco foi confirmada com sucesso.
          </p>
          <p className="text-lg text-primary-600 font-semibold mb-6">
            Categoria: {data.category_name}
          </p>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6 text-left">
            <h3 className="font-bold text-lg mb-3">Dados da sua inscrição</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Número da inscrição</p>
                <p className="font-bold text-lg text-primary-700">{data.registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Código de confirmação</p>
                <p className="font-mono font-bold text-lg text-primary-700">{data.confirmation_code}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Guarde o código acima. Use CPF, RG ou código para consultar em{' '}
              <Link href="/inscricao/acompanhar" className="font-semibold text-primary-600 hover:underline">
                Acompanhar Inscrição
              </Link>
              .
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-lg mb-4">Próximos Passos:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1 shrink-0" size={20} />
                <span>
                  Consulte o status em{' '}
                  <Link href="/inscricao/acompanhar" className="text-primary-600 hover:underline font-semibold">
                    Acompanhar Inscrição
                  </Link>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1 shrink-0" size={20} />
                <span>Retirada do kit: 23/06 das 14h às 20h no Ginásio Municipal</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-1 shrink-0" size={20} />
                <span>Lembre-se de levar documento original e o QR Code da inscrição</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscricao/acompanhar" className="btn-primary">
              Acompanhar Inscrição
            </Link>
            <Link href="/guia-atleta" className="btn-secondary">
              Ver Guia do Atleta
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
