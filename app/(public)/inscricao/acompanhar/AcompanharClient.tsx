'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEventConfigRealtime } from '@/hooks/useEventConfigRealtime'
import Link from 'next/link'
import { Search, CheckCircle, AlertCircle, Loader2, Users, Pencil, Save, X, Copy, CreditCard, Mail } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'
import { toQrCodeDataUrl } from '@/lib/utils'
import { BRAZILIAN_STATES } from '@/lib/brazilian-states'
import { COUNTRY_OPTIONS_FOREIGN } from '@/lib/countries'
import { formatDateOnly } from '@/lib/formatDate'
import { toast } from 'sonner'

interface AthleteData {
  full_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  document_type: string | null
  document_number: string | null
  birth_date: string | null
  gender: string | null
  team_name: string | null
  city: string | null
  state: string | null
  country: string | null
  address: string | null
  zip_code: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  tshirt_size: string | null
}

interface GuardianData {
  full_name: string
  document_type: string | null
  document_number: string | null
  phone: string | null
  email: string | null
  relationship: string | null
}

interface RegistrationResult {
  id: string
  registration_number: string | null
  confirmation_code: string | null
  status: string
  bib_number: number | null
  kit_picked_at: string | null
  payment_amount?: number | null
  payment_id?: string | null
  category_name: string
  category_slug: string | null
  athlete_id: string
  athlete: AthleteData | null
  guardian: GuardianData | null
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

function formatDocNumber(value: string | null | undefined): string {
  if (!value) return '-'
  const d = value.replace(/\D/g, '')
  if (d.length === 11) {
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (d.length === 9) {
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
  }
  return value
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  const formatted = formatDateOnly(value)
  return formatted || value
}

function formatDocForSearch(digits: string): string {
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (digits.length === 9) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
  }
  return digits
}

const MONTHS = [
  { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' }, { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
]
const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
const YEARS = Array.from({ length: 101 }, (_, i) => {
  const y = new Date().getFullYear() - i
  return { value: String(y), label: String(y) }
})

function getSearchType(value: string): 'codigo' | 'cpf' | 'rg' | 'email' {
  const trimmed = value?.trim() || ''
  if (trimmed.includes('@')) return 'email'
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 11) return 'cpf'
  if (digits.length === 9) return 'rg'
  return 'codigo'
}

export default function AcompanharClient() {
  const searchParams = useSearchParams()
  const [edition, setEdition] = useState<number>(51)
  const [search, setSearch] = useState('')
  const [step, setStep] = useState<'search' | 'birthDate'>('search')
  const [birthDay, setBirthDay] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [locked, setLocked] = useState(false)
  const [showResendModal, setShowResendModal] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [lastIdentifier, setLastIdentifier] = useState('')
  const [lastIdentifierType, setLastIdentifierType] = useState<'cpf' | 'rg' | 'email'>('cpf')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RegistrationResult[]>([])
  const [error, setError] = useState('')

  const loadEventConfig = useCallback(() => {
    fetch(`/api/event/config?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.event?.edition != null) setEdition(data.event.edition)
      })
      .catch(() => {})
  }, [])

  useEventConfigRealtime(loadEventConfig)

  useEffect(() => {
    loadEventConfig()
  }, [loadEventConfig])

  const hasInitializedFromUrl = useRef(false)
  useEffect(() => {
    const doc = searchParams.get('doc')
    const email = searchParams.get('email')
    if (hasInitializedFromUrl.current) return
    if (doc) {
      const digits = doc.replace(/\D/g, '')
      if (digits.length >= 9) {
        hasInitializedFromUrl.current = true
        const formatted = digits.length === 11 ? formatDocForSearch(digits) : digits.length === 9 ? formatDocForSearch(digits) : doc
        setSearch(formatted)
        const st = getSearchType(formatted)
        if (st === 'cpf' || st === 'rg') setStep('birthDate')
      }
    } else if (email?.trim() && email.includes('@')) {
      hasInitializedFromUrl.current = true
      setSearch(email.trim())
      setStep('birthDate')
    }
  }, [searchParams])

  async function doSearch(searchValue: string, birthDateStr?: string) {
    if (!searchValue.trim()) return
    setError('')
    setLocked(false)
    setLoading(true)
    setResults([])
    try {
      const trimmed = searchValue.trim()
      const st = getSearchType(trimmed)
      const body: Record<string, string> = {}

      if (st === 'codigo') {
        body.codigo = trimmed
      } else if (st === 'email') {
        body.email = trimmed
        if (!birthDateStr) {
          setError('Para buscar por e-mail, informe a data de nascimento.')
          setLoading(false)
          return
        }
        body.birthDate = birthDateStr
      } else {
        body[st] = trimmed
        if (!birthDateStr) {
          setError('Para buscar por CPF ou RG, informe a data de nascimento.')
          setLoading(false)
          return
        }
        body.birthDate = birthDateStr
      }

      const res = await fetch('/api/inscricao/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (res.status === 403 && json.locked) {
        setLocked(true)
        setLastIdentifier(trimmed)
        setLastIdentifierType(st as 'cpf' | 'rg' | 'email')
        setError(json.error || 'Muitas tentativas. Use o código de confirmação enviado no seu e-mail.')
        return
      }

      if (res.status === 429) {
        setError(json.error || 'Muitas requisições. Tente novamente em alguns minutos.')
        return
      }

      if (!res.ok) throw new Error(json.error || 'Erro ao buscar')
      const data = json.data || []
      setResults(data)
      if (!data.length) setError('Nenhuma inscrição encontrada.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar')
    } finally {
      setLoading(false)
    }
  }

  function getBirthDateStr() {
    if (birthYear && birthMonth && birthDay) {
      return `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
    }
    return undefined
  }

  async function handleResend() {
    if (!resendEmail.trim()) return
    setResendLoading(true)
    try {
      const res = await fetch('/api/inscricao/reenviar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: lastIdentifier,
          identifierType: lastIdentifierType,
          email: resendEmail.trim(),
        }),
      })
      const json = await res.json()
      if (res.ok) {
        toast.success('Código reenviado! Verifique seu e-mail.')
        setShowResendModal(false)
        setResendEmail('')
      } else {
        toast.error(json.error || 'Erro ao reenviar')
      }
    } catch {
      toast.error('Erro ao reenviar')
    } finally {
      setResendLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const st = getSearchType(search)
    if (st === 'codigo') {
      doSearch(search)
    } else if (step === 'search') {
      setStep('birthDate')
    } else {
      const bd = getBirthDateStr()
      if (!bd) {
        setError('Informe a data de nascimento completa.')
        return
      }
      doSearch(search, bd)
    }
  }

  function handleBack() {
    setStep('search')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-6">
            Acompanhar <span className="text-primary-600">Inscrição</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Digite seu CPF, RG, e-mail ou código de confirmação para consultar o status da sua inscrição na {edition}ª Corrida Rústica de Macuco.
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {getSearchType(search) === 'codigo' ? 'Código de confirmação' : 'CPF, RG ou e-mail'}
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    maxLength={50}
                    placeholder={
                      getSearchType(search) === 'codigo'
                        ? 'Digite o código recebido por e-mail'
                        : '000.000.000-00, 00.000.000-0 ou e-mail'
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {getSearchType(search) !== 'codigo' && step === 'birthDate' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data de nascimento</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={birthDay}
                        onChange={(e) => setBirthDay(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                      >
                        <option value="">Dia</option>
                        {DAYS.map((d) => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                      <select
                        value={birthMonth}
                        onChange={(e) => setBirthMonth(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                      >
                        <option value="">Mês</option>
                        {MONTHS.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <select
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                      >
                        <option value="">Ano</option>
                        {YEARS.map((y) => (
                          <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {step === 'birthDate' && getSearchType(search) !== 'codigo' && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Voltar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {loading ? 'Buscando...' : getSearchType(search) === 'codigo' || step === 'birthDate' ? 'Consultar Status' : 'Continuar'}
                  </button>
                </div>
              </form>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              {locked && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-3">
                    Muitas tentativas. Use o código de confirmação enviado no seu e-mail.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowResendModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                  >
                    <Mail size={18} />
                    Reenviar e-mail
                  </button>
                </div>
              )}
            </div>
          </div>

          {showResendModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reenviar código por e-mail</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Informe o e-mail cadastrado na inscrição para receber o código de confirmação.
                </p>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowResendModal(false); setResendEmail('') }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading || !resendEmail.trim()}
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resendLoading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                    {resendLoading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {results.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {results.map((reg) => (
              <ComprovanteCard
                key={reg.id}
                reg={reg}
                searchToken={search.trim()}
                searchType={getSearchType(search)}
              />
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
                  <p className="text-yellow-600 text-sm">Aguardando pagamento</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-4 mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Confirmada</h3>
                  <p className="text-green-600 text-sm">Tudo aprovado – Você está inscrito!</p>
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

function ComprovanteCard({ reg, searchToken, searchType }: { reg: RegistrationResult; searchToken: string; searchType: 'codigo' | 'cpf' | 'rg' | 'email' }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [editData, setEditData] = useState<Partial<AthleteData & { birthDay: string; birthMonth: string; birthYear: string }>>({})
  const [localReg, setLocalReg] = useState(reg)
  const [pixData, setPixData] = useState<{ id: string; brCode: string; brCodeBase64: string; expiresAt?: string } | null>(null)
  const [pixLoading, setPixLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [pixTimeLeft, setPixTimeLeft] = useState<string | null>(null)
  const [pixError, setPixError] = useState('')
  const [municipios, setMunicipios] = useState<string[]>([])
  const [municipiosLoading, setMunicipiosLoading] = useState(false)

  const isConfirmed = localReg.status === 'confirmed'
  const isPendingPayment = localReg.status === 'pending_payment'
  const athlete = localReg.athlete
  const guardian = localReg.guardian
  const pixEmail = athlete?.email?.trim() || guardian?.email?.trim() || ''
  const pixPhone = athlete?.phone || athlete?.whatsapp || guardian?.phone || ''
  const pixName = athlete?.full_name || guardian?.full_name || ''
  const isForeign = athlete?.country && athlete.country !== 'BRA'

  function getTaxId(): string {
    const doc = athlete?.document_number || guardian?.document_number
    if (!doc) return ''
    const d = String(doc).replace(/\D/g, '')
    if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    if (d.length === 9) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
    return d
  }

  async function handleGeneratePix() {
    if (!pixEmail) {
      setPixError('E-mail não encontrado. Edite os dados da inscrição e adicione um e-mail para gerar o PIX.')
      return
    }
    if (!localReg?.id) {
      setPixError('Dados da inscrição incompletos. Recarregue a página e tente novamente.')
      return
    }
    let amount = Math.max(0.5, Number(localReg.payment_amount) || 22)
    try {
      const configRes = await fetch(`/api/event/config?t=${Date.now()}`, { cache: 'no-store' })
      const config = await configRes.json()
      const slug = localReg.category_slug
      const slugToId: Record<string, string> = { 'geral-10k': 'geral-10k', '60-mais-10k': 'sessenta-10k', 'morador-10k': 'morador-10k', 'infantil-2k': 'infantil-2k' }
      const catId = slug ? (slugToId[slug] || slug) : null
      const cat = (config.categories || []).find((c: { id: string }) => c.id === catId)
      if (cat && typeof cat.price === 'number' && cat.price > 0) {
        amount = cat.price
      }
    } catch {
      // mantém amount do localReg
    }
    setPixLoading(true)
    setPixError('')
    try {
      const payload = {
        registrationId: localReg.id,
        amount,
        email: pixEmail,
        fullName: pixName || '',
        phone: pixPhone || '',
        taxId: getTaxId() || '',
      }
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = json?.error || json?.message || `Erro ao gerar PIX (${res.status})`
        console.error('[AcompanharClient] create-checkout erro:', msg, '\nPayload:', JSON.stringify(payload), '\nResposta:', JSON.stringify(json))
        throw new Error(msg)
      }
      if (json.id && json.brCode && json.brCodeBase64) {
        setPixData({ id: json.id, brCode: json.brCode, brCodeBase64: json.brCodeBase64, expiresAt: json.expiresAt })
      } else {
        console.error('[AcompanharClient] Resposta inválida - faltando id/brCode/brCodeBase64', json)
        throw new Error('Resposta inválida')
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : ''
      let msg = 'Erro ao gerar PIX. Tente novamente ou entre em contato com a organização.'
      if (raw.toLowerCase().includes('payer.email'))
        msg = 'O e-mail cadastrado é inválido. Edite os dados da inscrição e corrija o e-mail antes de gerar o PIX.'
      else if (raw.toLowerCase().includes('identification'))
        msg = 'O CPF cadastrado é inválido. Edite os dados da inscrição e corrija antes de gerar o PIX.'
      else if (raw === 'Resposta inválida')
        msg = 'Não foi possível gerar o QR Code. Tente novamente em alguns instantes.'
      else if (raw === 'Failed to fetch')
        msg = 'Sem conexão com a internet. Verifique sua rede e tente novamente.'
      setPixError(msg)
    } finally {
      setPixLoading(false)
    }
  }

  async function handleCheckPaymentStatus() {
    if (!pixData?.id) return
    setCheckingStatus(true)
    setPixError('')
    try {
      const res = await fetch(`/api/payments/status?payment_id=${encodeURIComponent(pixData.id)}`)
      const json = await res.json()
      const status = (json.status || '').toUpperCase()
      if (status === 'PAID') {
        setLocalReg((prev) => ({ ...prev, status: 'confirmed' }))
        setPixData(null)
      } else if (json.status === 'EXPIRED' || json.status === 'CANCELLED') {
        setPixData(null)
        setPixError('O PIX expirou. Gere um novo.')
      } else {
        setPixError('Pagamento ainda não identificado. Aguarde e tente novamente.')
      }
    } catch {
      setPixError('Erro ao verificar. Tente novamente.')
    } finally {
      setCheckingStatus(false)
    }
  }

  // Timer de expiração do PIX
  useEffect(() => {
    if (!pixData?.expiresAt) {
      setPixTimeLeft(null)
      return
    }
    const update = () => {
      const now = Date.now()
      const end = new Date(pixData.expiresAt!).getTime()
      const diff = end - now
      if (diff <= 0) {
        setPixTimeLeft('Expirado')
        return
      }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setPixTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [pixData?.expiresAt])

  const getAuthBody = () => {
    if (searchType === 'email') return { codigo: reg.confirmation_code || '' }
    const digits = searchToken.replace(/\D/g, '')
    if (digits.length === 11) return { cpf: searchToken }
    if (digits.length === 9) return { rg: searchToken }
    return { codigo: searchToken }
  }

  function startEdit() {
    const bd = athlete?.birth_date
    let d = '', m = '', y = ''
    if (bd) {
      const parts = bd.split('-') // YYYY-MM-DD
      if (parts.length === 3) {
        y = parts[0]
        m = String(parseInt(parts[1], 10))
        d = String(parseInt(parts[2], 10))
      }
    }
    setEditData({
      full_name: (athlete?.full_name ?? '').toUpperCase(),
      birthDay: d,
      birthMonth: m,
      birthYear: y,
      gender: athlete?.gender ?? '',
      city: athlete?.city ?? '',
      state: athlete?.state ?? '',
      country: athlete?.country ?? '',
      email: athlete?.email ?? '',
      phone: athlete?.phone ?? '',
      whatsapp: athlete?.whatsapp ?? '',
      team_name: (athlete?.team_name ?? '').toUpperCase(),
      emergency_contact_name: athlete?.emergency_contact_name ?? '',
      emergency_contact_phone: athlete?.emergency_contact_phone ?? '',
      tshirt_size: athlete?.tshirt_size ?? '',
      address: athlete?.address ?? '',
      zip_code: athlete?.zip_code ?? '',
    })
    setEditing(true)
    setSaveError('')
  }

  useEffect(() => {
    if (!editing || !editData.state) {
      setMunicipios([])
      return
    }
    const isMorador = localReg.category_slug === 'morador-10k'
    setMunicipiosLoading(true)
    fetch(`/api/ibge/municipios?uf=${editData.state}`)
      .then((res) => res.json())
      .then((json) => {
        const list = json.data || []
        setMunicipios(list)
        // Se for morador e a cidade não for Macuco, corrige
        if (isMorador && editData.city !== 'Macuco') {
          setEditData(prev => ({ ...prev, city: 'Macuco' }))
        }
      })
      .catch(() => setMunicipios([]))
      .finally(() => setMunicipiosLoading(false))
  }, [editData.state, editing, localReg.category_slug])

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const birthDate = editData.birthYear && editData.birthMonth && editData.birthDay
        ? `${editData.birthYear}-${String(editData.birthMonth).padStart(2, '0')}-${String(editData.birthDay).padStart(2, '0')}`
        : null

      const res = await fetch('/api/inscricao/atualizar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...getAuthBody(),
          registration_id: localReg.id,
          ...editData,
          birth_date: birthDate,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      setLocalReg((prev) => ({
        ...prev,
        athlete: prev.athlete ? { ...prev.athlete, ...editData, birth_date: birthDate } : null,
      }))
      setEditing(false)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setEditing(false)
    setSaveError('')
  }

  return (
    <div className={`rounded-xl p-8 border-2 ${isConfirmed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConfirmed ? 'bg-green-600' : isPendingPayment ? 'bg-amber-500' : 'bg-yellow-500'}`}>
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{athlete?.full_name || '-'}</h3>
            <p className="text-primary-600 font-semibold">{STATUS_LABELS[localReg.status] || localReg.status}</p>
            <p className="text-gray-600 text-sm">Categoria: {localReg.category_name}</p>
          </div>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Pencil size={18} />
            Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
              Cancelar
            </button>
          </div>
        )}
      </div>

      {saveError && <p className="text-sm text-red-600 mb-4">{saveError}</p>}

      {/* PIX para pagamento pendente */}
      {isPendingPayment && (
        <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <h4 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            Pagamento pendente
          </h4>
          {!pixData ? (
            <div className="space-y-3">
              {pixEmail ? (
                <>
                  <p className="text-sm text-amber-800">Gere o QR Code PIX para concluir sua inscrição.</p>
                  <button
                    type="button"
                    onClick={handleGeneratePix}
                    disabled={pixLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {pixLoading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                    {pixLoading ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
                  </button>
                </>
              ) : (
                <p className="text-sm text-amber-800">
                  Adicione um e-mail nos dados da inscrição (edite abaixo) para gerar o PIX.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-bold text-lg">Escaneie o QR Code ou copie o código PIX</p>
              {pixTimeLeft && (() => {
                const isExpired = pixTimeLeft === 'Expirado'
                const isUrgent = !isExpired && parseInt(pixTimeLeft) < 5
                return (
                  <p className={`text-sm font-medium ${isExpired ? 'text-amber-600' : isUrgent ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                    {isExpired
                      ? 'PIX expirado'
                      : isUrgent
                        ? `⚠️ Atenção: expira em ${pixTimeLeft}! Realize o pagamento agora.`
                        : `Expira em ${pixTimeLeft}`}
                  </p>
                )
              })()}
              <div className="flex flex-col items-center gap-4">
                <img
                  src={toQrCodeDataUrl(pixData.brCodeBase64)}
                  alt="QR Code PIX"
                  className="w-48 h-48 rounded-lg border border-gray-200"
                />
                <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1 w-full text-center">Código copia e cola</label>
                  <input
                    type="text"
                    readOnly
                    value={pixData.brCode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(pixData.brCode)
                      toast.success('Código copiado!')
                    }}
                    className="btn-secondary px-4 flex items-center gap-2"
                  >
                    <Copy size={18} />
                    Copiar
                  </button>
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={checkingStatus}
                  className="btn-primary flex items-center justify-center gap-2 py-3 px-6 disabled:opacity-50"
                >
                  {checkingStatus ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  {checkingStatus ? 'Verificando...' : 'Já fiz o pagamento'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPixData(null)}
                className="btn-secondary text-sm"
              >
                Gerar novo QR Code
              </button>
              <p className="text-sm text-gray-500">
                PIX expirou? Clique em Gerar novo QR Code acima. Saiu da página? Volte em{' '}
                <Link href="/inscricao/acompanhar" className="text-primary-600 underline hover:text-primary-700">
                  Acompanhar inscrição
                </Link>
                , informe o documento cadastrado e clique em Gerar QR Code.
              </p>
            </div>
          )}
          {pixError && <p className="mt-3 text-sm text-red-600 font-medium text-center">{pixError}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inscrição */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">Dados da Inscrição</h4>
          <Field label="Nº Inscrição" value={localReg.registration_number || '-'} />
          <Field label="Código de confirmação" value={localReg.confirmation_code || '-'} />
          {localReg.bib_number && <Field label="Nº Peito" value={String(localReg.bib_number)} />}
          {localReg.kit_picked_at && (
            <p className="text-sm text-green-600 font-medium">✓ Kit retirado em {new Date(localReg.kit_picked_at).toLocaleString('pt-BR')}</p>
          )}
        </div>

        {/* Dados pessoais (editável exceto Documento) */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">Dados Pessoais</h4>
          {editing ? (
            <>
              <EditField label="Nome completo" value={editData.full_name ?? ''} onChange={(v) => setEditData((d) => ({ ...d, full_name: v.toUpperCase() }))} />
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Data de Nascimento</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={editData.birthDay ?? ''}
                    onChange={(e) => setEditData((d) => ({ ...d, birthDay: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Dia</option>
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <select
                    value={editData.birthMonth ?? ''}
                    onChange={(e) => setEditData((d) => ({ ...d, birthMonth: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Mês</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <select
                    value={editData.birthYear ?? ''}
                    onChange={(e) => setEditData((d) => ({ ...d, birthYear: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Ano</option>
                    {YEARS.map((y) => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sexo</label>
                <select
                  value={editData.gender ?? ''}
                  onChange={(e) => setEditData((d) => ({ ...d, gender: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <Field label="Documento" value={athlete?.document_type ? `${athlete.document_type} ${formatDocNumber(athlete.document_number)}` : '-'} />
              
              {!isForeign ? (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Município</label>
                    <select
                      value={editData.city ?? ''}
                      onChange={(e) => setEditData((d) => ({ ...d, city: e.target.value }))}
                      disabled={municipiosLoading || (localReg.category_slug === 'morador-10k' && editData.state === 'RJ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:opacity-70"
                    >
                      <option value="">
                        {municipiosLoading ? 'Carregando...' : !editData.state ? 'Selecione o estado primeiro' : 'Selecione o município'}
                      </option>
                      {municipios.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Estado</label>
                    <select
                      value={editData.state ?? ''}
                      onChange={(e) => setEditData((d) => ({ ...d, state: e.target.value || null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Selecione</option>
                      {BRAZILIAN_STATES.map((s) => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <Field label="País" value={athlete?.country || '-'} />
                </>
              ) : (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">País</label>
                  <select
                    value={editData.country ?? ''}
                    onChange={(e) => setEditData((d) => ({ ...d, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione o país</option>
                    {COUNTRY_OPTIONS_FOREIGN.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <>
              <Field label="Nome completo" value={athlete?.full_name || '-'} />
              <Field label="Data de nascimento" value={formatDate(athlete?.birth_date)} />
              <Field label="Sexo" value={athlete?.gender === 'M' ? 'Masculino' : athlete?.gender === 'F' ? 'Feminino' : athlete?.gender || '-'} />
               <Field label="Documento" value={athlete?.document_type ? `${athlete.document_type} ${formatDocNumber(athlete.document_number)}` : '-'} />
              {!isForeign ? (
                <>
                  <Field label="Cidade" value={athlete?.city || '-'} />
                  <Field label="Estado" value={athlete?.state ? BRAZILIAN_STATES.find((s) => s.code === athlete.state)?.name || athlete.state : '-'} />
                </>
              ) : null}
              <Field label="País" value={isForeign ? COUNTRY_OPTIONS_FOREIGN.find(c => c.code === athlete?.country)?.label || athlete?.country || '-' : 'Brasil (BRA)'} />
            </>
          )}
        </div>

        {/* Contato (editável) */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">Contato</h4>
          {editing ? (
            <>
              <EditField label="E-mail" value={editData.email ?? ''} onChange={(v) => setEditData((d) => ({ ...d, email: v }))} type="email" />
              <EditField label="Telefone" value={editData.phone ?? ''} onChange={(v) => setEditData((d) => ({ ...d, phone: v, whatsapp: v }))} />
            </>
          ) : (
            <>
              <Field label="E-mail" value={athlete?.email || '-'} />
              <Field label="Telefone" value={athlete?.phone || athlete?.whatsapp || '-'} />
            </>
          )}
        </div>

        {/* Outros (editável) */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">Outros</h4>
          {editing ? (
            <>
              <EditField label="Equipe/Clube" value={editData.team_name ?? ''} onChange={(v) => setEditData((d) => ({ ...d, team_name: v.toUpperCase() }))} />
            </>
          ) : (
            <>
              <Field label="Equipe/Clube" value={athlete?.team_name || '-'} />
            </>
          )}
        </div>

        {/* Responsável (infantil) */}
        {localReg.guardian && (
          <div className="md:col-span-2 space-y-4">
            <h4 className="font-semibold text-gray-800 border-b pb-2">Responsável (categoria infantil)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome" value={localReg.guardian.full_name} />
              <Field label="Parentesco" value={localReg.guardian.relationship || '-'} />
              <Field label="Documento" value={formatDocNumber(localReg.guardian.document_number)} />
              <Field label="Telefone" value={localReg.guardian.phone || '-'} />
              <Field label="E-mail" value={localReg.guardian.email || '-'} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || '-'}</p>
    </div>
  )
}

function EditField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
      />
    </div>
  )
}
