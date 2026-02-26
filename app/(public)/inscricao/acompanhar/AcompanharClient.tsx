'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, FileText, CheckCircle, AlertCircle, XCircle, Loader2, Users } from 'lucide-react'
import { RACE_CONFIG, CONTACT_EMAIL } from '@/lib/constants'
import { QRCodeSVG } from 'qrcode.react'

interface RegistrationResult {
  id: string
  registration_number: string | null
  confirmation_code: string | null
  status: string
  bib_number: number | null
  kit_picked_at: string | null
  athlete_name: string
  category_name: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  pending_payment: 'Aguardando Pagamento',
  pending_documents: 'Documentos Pendentes',
  under_review: 'Em Análise',
  confirmed: 'Confirmada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada',
}

export default function AcompanharClient() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RegistrationResult[]>([])
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!search.trim()) return
    setError('')
    setLoading(true)
    setResults([])
    try {
      const digits = search.replace(/\D/g, '')
      const body: Record<string, string> = {}
      if (digits.length === 11) body.cpf = search.trim()
      else if (digits.length === 9) body.rg = search.trim()
      else body.codigo = search.trim()

      const res = await fetch('/api/inscricao/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao buscar')
      setResults(json.data || [])
      if (!json.data?.length) setError('Nenhuma inscrição encontrada.')
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-6">
            Acompanhar <span className="text-primary-600">Inscrição</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Digite seu CPF, RG ou código de confirmação para consultar o status da sua inscrição na {RACE_CONFIG.edition}ª Corrida Rústica de Macuco.
          </p>
          <Link
            href="/inscricao/lista"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-8"
          >
            <Users size={20} />
            Ver lista de inscritos por categoria
          </Link>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-6 h-6 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900">Consultar Inscrição</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CPF, RG ou Código</label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="000.000.000-00, 00.000.000-0 ou código"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? 'Buscando...' : 'Consultar Status'}
                </button>
              </form>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </section>

      {results.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {results.map((reg) => (
              <ComprovanteCard key={reg.id} reg={reg} />
            ))}
          </div>
        </section>
      )}

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Status Possíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-yellow-200">
              <div className="flex items-center gap-4 mb-4">
                <AlertCircle className="w-10 h-10 text-yellow-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Pendente</h3>
                  <p className="text-yellow-600 text-sm">Aguardando pagamento ou documentos</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-4 mb-4">
                <FileText className="w-10 h-10 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Em Análise</h3>
                  <p className="text-blue-600 text-sm">Validando documentos</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Confirmada</h3>
                  <p className="text-green-600 text-sm">Tudo aprovado – retire seu kit</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-center gap-4 mb-4">
                <XCircle className="w-10 h-10 text-red-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Rejeitada</h3>
                  <p className="text-red-600 text-sm">Documentos inválidos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Precisa de Ajuda?</h2>
          <p className="text-xl text-primary-100 mb-8">Entre em contato: {CONTACT_EMAIL}</p>
        </div>
      </section>
    </div>
  )
}

function ComprovanteCard({ reg }: { reg: RegistrationResult }) {
  const isConfirmed = reg.status === 'confirmed'
  const qrValue = reg.registration_number || reg.confirmation_code || reg.id

  return (
    <div className={`rounded-xl p-8 border-2 ${isConfirmed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConfirmed ? 'bg-green-600' : 'bg-yellow-500'}`}>
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{reg.athlete_name}</h3>
              <p className="text-primary-600 font-semibold">{STATUS_LABELS[reg.status] || reg.status}</p>
              <p className="text-gray-600 text-sm">Categoria: {reg.category_name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-500">Nº Inscrição</p>
              <p className="font-bold">{reg.registration_number || '-'}</p>
            </div>
            {reg.bib_number && (
              <div>
                <p className="text-sm text-gray-500">Nº Peito</p>
                <p className="font-bold text-primary-600">{reg.bib_number}</p>
              </div>
            )}
            {reg.kit_picked_at && (
              <div className="sm:col-span-2">
                <p className="text-sm text-green-600 font-medium">✓ Kit retirado em {new Date(reg.kit_picked_at).toLocaleString('pt-BR')}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center border-l-0 md:border-l md:border-gray-200 md:pl-6">
          <p className="text-xs text-gray-500 mb-2">QR Code para check-in</p>
          <QRCodeSVG value={qrValue} size={140} level="M" includeMargin />
        </div>
      </div>
    </div>
  )
}
