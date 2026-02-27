'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, FileText, CheckCircle, AlertCircle, XCircle, Loader2, Users, Pencil, Save, X, Copy, CreditCard } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'
import { BRAZILIAN_STATES } from '@/lib/brazilian-states'

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

const TSHIRT_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'] as const

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
  try {
    return new Date(value).toLocaleDateString('pt-BR')
  } catch {
    return value
  }
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

export default function AcompanharClient() {
  const searchParams = useSearchParams()
  const [edition, setEdition] = useState<number>(51)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RegistrationResult[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/event/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.event?.edition != null) setEdition(data.event.edition)
      })
      .catch(() => {})
  }, [])

  const hasSearchedDoc = useRef(false)
  useEffect(() => {
    const doc = searchParams.get('doc')
    if (!doc || hasSearchedDoc.current) return
    const digits = doc.replace(/\D/g, '')
    if (digits.length < 9) return
    hasSearchedDoc.current = true
    setSearch(formatDocForSearch(digits))
    doSearch(formatDocForSearch(digits))
  }, [searchParams])

  async function doSearch(searchValue: string) {
    if (!searchValue.trim()) return
    setError('')
    setLoading(true)
    setResults([])
    try {
      const digits = searchValue.replace(/\D/g, '')
      const body: Record<string, string> = {}
      if (digits.length === 11) body.cpf = searchValue.trim()
      else if (digits.length === 9) body.rg = searchValue.trim()
      else body.codigo = searchValue.trim()

      const res = await fetch('/api/inscricao/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao buscar')
      setResults(json.data || [])
      if (!json.data?.length) setError('Nenhuma inscrição encontrada.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doSearch(search)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-6">
            Acompanhar <span className="text-primary-600">Inscrição</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Digite seu CPF, RG ou código de confirmação para consultar o status da sua inscrição na {edition}ª Corrida Rústica de Macuco.
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
              <ComprovanteCard key={reg.id} reg={reg} searchToken={search.trim()} />
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

function ComprovanteCard({ reg, searchToken }: { reg: RegistrationResult; searchToken: string }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [editData, setEditData] = useState<Partial<AthleteData>>({})
  const [localReg, setLocalReg] = useState(reg)
  const [pixData, setPixData] = useState<{ id: string; brCode: string; brCodeBase64: string } | null>(null)
  const [pixLoading, setPixLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [pixError, setPixError] = useState('')

  const isConfirmed = localReg.status === 'confirmed'
  const isPendingPayment = localReg.status === 'pending_payment'
  const athlete = localReg.athlete

  function getTaxId(): string {
    const doc = athlete?.document_number
    if (!doc) return ''
    const d = String(doc).replace(/\D/g, '')
    if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    if (d.length === 9) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
    return d
  }

  async function handleGeneratePix() {
    if (!athlete?.email) return
    setPixLoading(true)
    setPixError('')
    try {
      const amount = Number(localReg.payment_amount) || 20
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: localReg.id,
          amount,
          email: athlete.email,
          fullName: athlete.full_name,
          phone: athlete.phone || athlete.whatsapp || '',
          taxId: getTaxId(),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao gerar PIX')
      if (json.id && json.brCode && json.brCodeBase64) {
        setPixData({ id: json.id, brCode: json.brCode, brCodeBase64: json.brCodeBase64 })
      } else throw new Error('Resposta inválida')
    } catch (err: unknown) {
      setPixError(err instanceof Error ? err.message : 'Erro ao gerar PIX')
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

  const getAuthBody = () => {
    const digits = searchToken.replace(/\D/g, '')
    if (digits.length === 11) return { cpf: searchToken }
    if (digits.length === 9) return { rg: searchToken }
    return { codigo: searchToken }
  }

  function startEdit() {
    setEditData({
      email: athlete?.email ?? '',
      phone: athlete?.phone ?? '',
      whatsapp: athlete?.whatsapp ?? '',
      team_name: athlete?.team_name ?? '',
      emergency_contact_name: athlete?.emergency_contact_name ?? '',
      emergency_contact_phone: athlete?.emergency_contact_phone ?? '',
      tshirt_size: athlete?.tshirt_size ?? '',
      address: athlete?.address ?? '',
      zip_code: athlete?.zip_code ?? '',
    })
    setEditing(true)
    setSaveError('')
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/inscricao/atualizar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...getAuthBody(),
          registration_id: localReg.id,
          ...editData,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar')
      setLocalReg((prev) => ({
        ...prev,
        athlete: prev.athlete ? { ...prev.athlete, ...editData } : null,
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
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-bold text-lg">Escaneie o QR Code ou copie o código PIX</p>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={pixData.brCodeBase64}
                  alt="QR Code PIX"
                  className="w-48 h-48 rounded-lg border border-gray-200"
                />
                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Código copia e cola</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixData.brCode}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(pixData.brCode)}
                      className="btn-secondary px-4 flex items-center gap-2 shrink-0"
                    >
                      <Copy size={18} />
                      Copiar
                    </button>
                  </div>
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
            </div>
          )}
          {pixError && <p className="mt-3 text-sm text-red-600">{pixError}</p>}
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

        {/* Dados pessoais (somente leitura) */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">Dados Pessoais</h4>
          <Field label="Nome completo" value={athlete?.full_name || '-'} />
          <Field label="Data de nascimento" value={formatDate(athlete?.birth_date)} />
          <Field label="Sexo" value={athlete?.gender === 'M' ? 'Masculino' : athlete?.gender === 'F' ? 'Feminino' : athlete?.gender || '-'} />
          <Field label="Documento" value={athlete?.document_type ? `${athlete.document_type} ${formatDocNumber(athlete.document_number)}` : '-'} />
          <Field label="Cidade" value={athlete?.city || '-'} />
          <Field label="Estado" value={athlete?.state ? BRAZILIAN_STATES.find((s) => s.code === athlete.state)?.name || athlete.state : '-'} />
          <Field label="País" value={athlete?.country || '-'} />
        </div>

        {/* Contato (editável) */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">Contato</h4>
          {editing ? (
            <>
              <EditField label="E-mail" value={editData.email ?? ''} onChange={(v) => setEditData((d) => ({ ...d, email: v }))} type="email" />
              <EditField label="Telefone" value={editData.phone ?? ''} onChange={(v) => setEditData((d) => ({ ...d, phone: v, whatsapp: v }))} />
              <EditField label="Contato de emergência" value={editData.emergency_contact_name ?? ''} onChange={(v) => setEditData((d) => ({ ...d, emergency_contact_name: v }))} />
              <EditField label="Telefone emergência" value={editData.emergency_contact_phone ?? ''} onChange={(v) => setEditData((d) => ({ ...d, emergency_contact_phone: v }))} />
            </>
          ) : (
            <>
              <Field label="E-mail" value={athlete?.email || '-'} />
              <Field label="Telefone" value={athlete?.phone || athlete?.whatsapp || '-'} />
              <Field label="Contato de emergência" value={athlete?.emergency_contact_name || '-'} />
              <Field label="Telefone emergência" value={athlete?.emergency_contact_phone || '-'} />
            </>
          )}
        </div>

        {/* Outros (editável) */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">Outros</h4>
          {editing ? (
            <>
              <EditField label="Equipe/Clube" value={editData.team_name ?? ''} onChange={(v) => setEditData((d) => ({ ...d, team_name: v }))} />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Camiseta</label>
                <select
                  value={editData.tshirt_size ?? ''}
                  onChange={(e) => setEditData((d) => ({ ...d, tshirt_size: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Selecione</option>
                  {TSHIRT_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <EditField label="Endereço" value={editData.address ?? ''} onChange={(v) => setEditData((d) => ({ ...d, address: v }))} />
              <EditField label="CEP" value={editData.zip_code ?? ''} onChange={(v) => setEditData((d) => ({ ...d, zip_code: v }))} />
            </>
          ) : (
            <>
              <Field label="Equipe/Clube" value={athlete?.team_name || '-'} />
              <Field label="Camiseta" value={athlete?.tshirt_size || '-'} />
              <Field label="Endereço" value={athlete?.address || '-'} />
              <Field label="CEP" value={athlete?.zip_code ? athlete.zip_code.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2') : '-'} />
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
