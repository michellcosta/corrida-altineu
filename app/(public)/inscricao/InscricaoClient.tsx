'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEventConfigRealtime } from '@/hooks/useEventConfigRealtime'
import { Check, ChevronRight, CreditCard, User, FileText, CheckCircle, Upload, AlertCircle, Loader2, Copy } from 'lucide-react'
import Link from 'next/link'
import { COUNTRY_OPTIONS_FOREIGN } from '@/lib/countries'
import { BRAZILIAN_STATES } from '@/lib/brazilian-states'
import { toQrCodeDataUrl } from '@/lib/utils'
import { toast } from 'sonner'

// ============================================================
// TIPOS E INTERFACES
// ============================================================

type DocumentType = 'CPF' | 'RG'

const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const RG_REGEX = /^\d{2}\.\d{3}\.\d{3}-\d{1}$/

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 6)
  const part3 = digits.slice(6, 9)
  const part4 = digits.slice(9, 11)
  let formatted = part1
  if (part2) formatted += `.${part2}`
  if (part3) formatted += `.${part3}`
  if (part4) formatted += `-${part4}`
  return formatted
}

function formatRG(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  const part1 = digits.slice(0, 2)
  const part2 = digits.slice(2, 5)
  const part3 = digits.slice(5, 8)
  const part4 = digits.slice(8, 9)
  let formatted = part1
  if (part2) formatted += `.${part2}`
  if (part3) formatted += `.${part3}`
  if (part4) formatted += `-${part4}`
  return formatted
}

function formatDocumentNumber(value: string, type: DocumentType) {
  switch (type) {
    case 'CPF':
      return formatCPF(value)
    case 'RG':
      return formatRG(value)
    default:
      return value
  }
}

function validateDocumentNumber(value: string, type: DocumentType) {
  if (!value?.trim()) return false
  const formatOk = type === 'CPF' ? CPF_REGEX.test(value) : RG_REGEX.test(value)
  return formatOk
}

function getDocumentHelper(type: DocumentType) {
  if (type === 'CPF') return 'Formato: 000.000.000-00'
  if (type === 'RG') return 'Formato: 00.000.000-0'
  return ''
}

function limitPhoneDigits(value: string, maxDigits = 11): string {
  return value.replace(/\D/g, '').slice(0, maxDigits)
}

interface Category {
  id: string
  name: string
  price: number
  isFree: boolean
  description: string
  spots: number
  spotsTaken?: number
  spotsAvailable?: number
  ageMin: number
  ageMax?: number
  documents: string[]
  requiresGuardian?: boolean
  requiresResidenceProof?: boolean
}

const steps = [
  { id: 1, name: 'Categoria', icon: User },
  { id: 2, name: 'Dados Pessoais', icon: FileText },
  { id: 3, name: 'Pagamento', icon: CreditCard },
  { id: 4, name: 'Confirmação', icon: CheckCircle },
]

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function InscricaoClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [eventConfig, setEventConfig] = useState<{
    year: number
    edition: number
    raceDateFormatted: string
    location: string
    registrationsOpen: boolean
  } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [configLoading, setConfigLoading] = useState(true)
  const [configError, setConfigError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  // Pré-filtro por data de nascimento (quando vem da home sem ?categoria=)
  const [preFilterBirth, setPreFilterBirth] = useState<{ day: string; month: string; year: string } | null>(null)
  const [skipPreFilter, setSkipPreFilter] = useState(false)
  const [documentType, setDocumentType] = useState<DocumentType>('CPF')
  const [documentNumber, setDocumentNumber] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitLoading, setSubmitLoading] = useState(false)
  const [isCheckingDoc, setIsCheckingDoc] = useState(false)
  const [docDuplicateFound, setDocDuplicateFound] = useState(false)

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }
  const [submitError, setSubmitError] = useState('')
  const [submitError409NoRedirect, setSubmitError409NoRedirect] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<{
    registration_number: string
    confirmation_code: string
  } | null>(null)
  const [pixData, setPixData] = useState<{
    id: string
    brCode: string
    brCodeBase64: string
    amount: number
    expiresAt?: string
  } | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [pendingRegistrationId, setPendingRegistrationId] = useState<string | null>(null)
  const [pixTimeLeft, setPixTimeLeft] = useState<string | null>(null)

  const loadEventConfig = useCallback(
    (applyUrlPreselect = false) => {
      fetch(`/api/event/config?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.event && data.categories) {
            setEventConfig({
              year: data.event.year,
              edition: data.event.edition,
              raceDateFormatted: data.event.raceDateFormatted,
              location: data.event.location || 'Praça de Macuco',
              registrationsOpen: data.event.registrationsOpen ?? true,
            })
            setCategories(data.categories)
            if (applyUrlPreselect) {
              const categoriaParam = searchParams.get('categoria')
              if (categoriaParam) {
                const cat = data.categories.find((c: Category) => c.id === categoriaParam)
                if (cat) {
                  setSelectedCategory(cat)
                  setCurrentStep(2)
                }
              }
            } else {
              setSelectedCategory((prev) => {
                if (!prev) return null
                const updated = data.categories.find((c: Category) => c.id === prev.id)
                return updated ?? prev
              })
            }
            setConfigError(null)
          } else {
            setConfigError('Não foi possível carregar as categorias.')
          }
        })
        .catch(() => setConfigError('Erro ao carregar configurações.'))
        .finally(() => setConfigLoading(false))
    },
    [searchParams]
  )

  const handleConfigUpdate = useCallback(() => loadEventConfig(false), [loadEventConfig])
  useEventConfigRealtime(handleConfigUpdate)

  useEffect(() => {
    loadEventConfig(true)
  }, [loadEventConfig])

  // Quando morador-10k é selecionado (incluindo via URL ?categoria=morador-10k), pré-marcar brasileiro
  useEffect(() => {
    if (selectedCategory?.id === 'morador-10k') {
      setFormData((prev) => ({ ...prev, state: 'RJ', city: 'Macuco', originType: 'brazilian' }))
    }
  }, [selectedCategory?.id])

  // Scroll para o topo ao entrar em Pagamento ou Confirmação
  useEffect(() => {
    if (currentStep === 3 || currentStep === 4) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const [formData, setFormData] = useState({
    // Dados pessoais básicos
    fullName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    email: '',
    phone: '',
    hasTeam: null as boolean | null,
    teamName: '',
    // Origem: brasileiro ou estrangeiro (obrigatório escolher)
    originType: 'brazilian' as 'brazilian' | 'foreign' | null,
    state: '',
    city: '',
    nationality: '', // código do país (apenas para estrangeiros)

    // Documento do responsável (para estrangeiros)
    guardianDocumentType: '' as DocumentType | '',
    guardianDocumentNumber: '',

    // Morador de Macuco
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: '',
    addressZipCode: '',
    residenceProofType: '',
    residenceProofFile: null as File | null,

    // Infantil
    childCpf: '',
    guardianName: '',
    guardianCpf: '',
    guardianPhone: '',
    guardianRelationship: '',
    isMacucoResident: null as boolean | null,
    authorizationFile: null as File | null,

    // Termos
    acceptedTerms: false,
  })

  const documentPlaceholder =
    documentType === 'CPF' ? '000.000.000-00' : '00.000.000-0'

  const documentHelper = getDocumentHelper(documentType)

  const documentMaxLength = 14 // Permite alternar entre RG e CPF

  const documentGridClass = 'md:grid-cols-[160px_1fr]'

  const getBirthDate = (): string => {
    if (preFilterBirth?.day && preFilterBirth?.month && preFilterBirth?.year) {
      const d = preFilterBirth.day.padStart(2, '0')
      const m = preFilterBirth.month.padStart(2, '0')
      return `${preFilterBirth.year}-${m}-${d}`
    }
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) return ''
    const d = formData.birthDay.padStart(2, '0')
    const m = formData.birthMonth.padStart(2, '0')
    return `${formData.birthYear}-${m}-${d}`
  }

  const eventYear = eventConfig?.year ?? 2026

  const getAgeByDec31 = (birthDateStr: string, year: number): number => {
    const birthYear = parseInt(birthDateStr.slice(0, 4), 10)
    return year - birthYear
  }

  const categoriaParam = searchParams.get('categoria')
  const showPreFilterStep = !categoriaParam && preFilterBirth === null && !skipPreFilter
  const preFilterAge = preFilterBirth?.year
    ? getAgeByDec31(`${preFilterBirth.year}-${preFilterBirth.month.padStart(2, '0')}-${preFilterBirth.day.padStart(2, '0')}`, eventYear)
    : null
  const filteredCategories = (() => {
    if (!preFilterBirth?.year || preFilterAge == null) return categories
    if (preFilterAge >= 5 && preFilterAge <= 14) return categories.filter((c) => c.id === 'infantil-2k')
    if (preFilterAge >= 15 && preFilterAge <= 59) return categories.filter((c) => c.id === 'geral-10k' || c.id === 'morador-10k')
    if (preFilterAge >= 60 && preFilterAge <= 100) return categories.filter((c) => c.id === 'sessenta-10k' || c.id === 'morador-10k')
    return []
  })()
  const categoriesToShow = skipPreFilter ? categories : (preFilterBirth ? filteredCategories : categories)
  const isBirthDateLocked = preFilterBirth !== null

  const MONTHS = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
  ]
  const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
  const currentYear = new Date().getFullYear()
  // Para Infantil 2.5K: anos que resultam em idade entre 5 e 14 no ano da prova
  // Anos de nascimento por categoria (idade em 31/12 do ano da prova)
  const birthYearsForInfantil = selectedCategory?.id === 'infantil-2k' && selectedCategory?.ageMax != null
    ? Array.from(
      { length: selectedCategory.ageMax - selectedCategory.ageMin + 1 },
      (_, i) => {
        const year = eventYear - selectedCategory.ageMin! - i
        return { value: String(year), label: String(year) }
      }
    )
    : null
  const birthYearsForGeral = selectedCategory?.id === 'geral-10k'
    ? Array.from({ length: 45 }, (_, i) => ({
      value: String(eventYear - 15 - i),
      label: String(eventYear - 15 - i),
    }))
    : null
  const birthYearsForSessenta = selectedCategory?.id === 'sessenta-10k'
    ? Array.from({ length: 41 }, (_, i) => ({
      value: String(eventYear - 60 - i),
      label: String(eventYear - 60 - i),
    }))
    : null
  const birthYearsForMorador = selectedCategory?.id === 'morador-10k'
    ? Array.from({ length: 86 }, (_, i) => ({
      value: String(eventYear - 15 - i),
      label: String(eventYear - 15 - i),
    }))
    : null
  const YEARS = birthYearsForInfantil ?? birthYearsForGeral ?? birthYearsForSessenta ?? birthYearsForMorador ?? Array.from(
    { length: 101 },
    (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) })
  )

  // Calcular steps dinâmicos (sem pagamento para categorias gratuitas)
  const activeSteps = selectedCategory?.isFree
    ? steps.filter(step => step.id !== 3)
    : steps

  // Municípios (carregados ao selecionar estado)
  const [municipios, setMunicipios] = useState<string[]>([])
  const [municipiosLoading, setMunicipiosLoading] = useState(false)

  // Verificar se deve mostrar campo de documento principal
  const CATEGORY_DOC_REQUIRED = new Set(['geral-10k', 'sessenta-10k', 'morador-10k'])
  const shouldShowMainDocument = selectedCategory && CATEGORY_DOC_REQUIRED.has(selectedCategory.id)

  // Flags derivadas da origem (brasileiro vs estrangeiro)
  const isBrazilian = formData.originType === 'brazilian'
  const isForeign = formData.originType === 'foreign'
  const shouldShowAthleteDocument = shouldShowMainDocument && isBrazilian
  const shouldShowGuardianDocument = shouldShowMainDocument && isForeign

  // Carregar municípios quando estado mudar (apenas para brasileiros)
  useEffect(() => {
    if (!formData.state || formData.originType !== 'brazilian') {
      setMunicipios([])
      setFormData((prev) => ({ ...prev, city: '' }))
      return
    }
    const isMorador = selectedCategory?.id === 'morador-10k'
    setMunicipiosLoading(true)
    fetch(`/api/ibge/municipios?uf=${formData.state}`)
      .then((res) => res.json())
      .then((json) => {
        setMunicipios(json.data || [])
        setFormData((prev) => ({ ...prev, city: isMorador ? 'Macuco' : '' }))
      })
      .catch(() => setMunicipios([]))
      .finally(() => setMunicipiosLoading(false))
  }, [formData.state, formData.originType, selectedCategory?.id])

  async function handleCheckPaymentStatus() {
    if (!pixData?.id) return
    setCheckingStatus(true)
    setSubmitError('')
    try {
      const res = await fetch(`/api/payments/status?payment_id=${encodeURIComponent(pixData.id)}`)
      const json = await res.json()
      const status = (json.status || '').toUpperCase()
      if (status === 'PAID') {
        setCurrentStep(4)
        setPixData(null)
      } else if (json.status === 'EXPIRED' || json.status === 'CANCELLED') {
        setPixData(null)
        setSubmitError('O PIX expirou. Volte e gere um novo.')
      } else if (json.status === 'REFUNDED') {
        setPixData(null)
        setSubmitError('O pagamento foi estornado. Entre em contato para mais informações.')
      } else {
        setSubmitError('Pagamento ainda não identificado. Aguarde alguns segundos e tente novamente.')
      }
    } catch {
      setSubmitError('Erro ao verificar. Tente novamente.')
    } finally {
      setCheckingStatus(false)
    }
  }

  // Polling do status do PIX quando pixData existe
  useEffect(() => {
    if (!pixData?.id) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status?payment_id=${encodeURIComponent(pixData.id)}`)
        const json = await res.json()
        const s = (json.status || '').toUpperCase()
        if (s === 'PAID') {
          setCurrentStep(4)
          setPixData(null)
        } else if (s === 'EXPIRED' || s === 'CANCELLED') {
          setPixData(null)
          setSubmitError('O PIX expirou. Volte e gere um novo.')
        } else if (s === 'REFUNDED') {
          setPixData(null)
          setSubmitError('O pagamento foi estornado. Entre em contato para mais informações.')
        }
      } catch {
        // Ignora erros de polling
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [pixData?.id])

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

  // Verifica se todos os campos obrigatórios estão preenchidos (para desabilitar botão Continuar)
  const isPersonalDataComplete = (): boolean => {
    const base = formData.fullName?.trim() &&
      formData.birthDay && formData.birthMonth && formData.birthYear &&
      formData.gender &&
      formData.email?.trim() &&
      formData.phone?.trim() &&
      formData.originType &&
      formData.acceptedTerms

    if (!base) return false

    if (formData.originType === 'brazilian' && (!formData.state || !formData.city)) return false
    if (formData.originType === 'foreign' && !formData.nationality) return false

    if (shouldShowAthleteDocument && !validateDocumentNumber(documentNumber, documentType)) return false
    if (shouldShowGuardianDocument) {
      if (!formData.guardianName?.trim() || !formData.guardianDocumentType) return false
      if (!formData.guardianDocumentNumber || !validateDocumentNumber(formData.guardianDocumentNumber, formData.guardianDocumentType as DocumentType)) return false
    }

    if (selectedCategory?.id === 'infantil-2k') {
      if (!formData.guardianName?.trim() || !formData.guardianCpf || !validateDocumentNumber(formData.guardianCpf, 'CPF') || formData.isMacucoResident === null) return false
      if (!formData.guardianPhone?.trim() || !formData.guardianRelationship) return false
    }

    if (selectedCategory?.id === 'sessenta-10k') {
      const bd = getBirthDate()
      if (bd && getAgeByDec31(bd, eventYear) < 60) return false
    }

    return true
  }

  const ageValidationError = (() => {
    if (selectedCategory?.id !== 'sessenta-10k') return ''
    const bd = getBirthDate()
    if (!bd) return ''
    const age = getAgeByDec31(bd, eventYear)
    return age < 60 ? `A categoria 60+ 10K exige 60 anos ou mais até 31/12/${eventYear}. Sua idade seria ${age} anos.` : ''
  })()

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleDocumentTypeChange = (value: DocumentType) => {
    setDocumentType(value)
    clearFieldError('documentNumber')
    setDocumentNumber('')
  }

  const handleDocumentNumberInput = (value: string) => {
    const digits = value.replace(/\D/g, '')
    const newType: DocumentType = digits.length <= 9 ? 'RG' : 'CPF'
    if (newType !== documentType) {
      setDocumentType(newType)
    }
    setDocumentNumber(formatDocumentNumber(value, newType))
    clearFieldError('documentNumber')
    setDocDuplicateFound(false)
  }

  const handleCheckExistingRegistration = async (doc: string, type: DocumentType) => {
    const digits = doc.replace(/\D/g, '')
    if (digits.length < 9) return

    setIsCheckingDoc(true)
    setDocDuplicateFound(false)
    try {
      const payload = type === 'CPF' ? { cpf: digits } : { rg: digits }
      const res = await fetch('/api/inscricao/buscar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.data && json.data.length > 0) {
        setDocDuplicateFound(true)
        setFieldErrors((prev) => ({
          ...prev,
          documentNumber: 'Este documento já possui uma inscrição para este evento.'
        }))
      }
    } catch (err) {
      console.error('Erro ao verificar documento:', err)
    } finally {
      setIsCheckingDoc(false)
    }
  }

  const handleCategorySelect = (category: Category) => {
    const isSwitching = selectedCategory != null && selectedCategory.id !== category.id
    setSelectedCategory(category)
    setFieldErrors({})
    // Resetar data de nascimento ao trocar de categoria (evita bypass Infantil)
    if (isSwitching) {
      setFormData((prev) => ({ ...prev, birthDay: '', birthMonth: '', birthYear: '' }))
    }
    if (category.id === 'morador-10k') {
      setFormData((prev) => ({ ...prev, state: 'RJ', city: 'Macuco', originType: 'brazilian' }))
    } else if (selectedCategory?.id === 'morador-10k') {
      setFormData((prev) => ({ ...prev, state: '', city: '' }))
    }
  }

  const handleContinueFromCategory = () => {
    if (selectedCategory) {
      setCurrentStep(2)
    }
  }

  const [preFilterForm, setPreFilterForm] = useState({ day: '', month: '', year: '' })
  const [preFilterError, setPreFilterError] = useState<string | null>(null)
  const handlePreFilterSubmit = () => {
    const { day, month, year } = preFilterForm
    if (!day || !month || !year) {
      setPreFilterError('Informe a data de nascimento completa.')
      return
    }
    const birthStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    const age = getAgeByDec31(birthStr, eventYear)
    if (age < 0 || age > 100) {
      setPreFilterError('Data de nascimento inválida.')
      return
    }
    if (age >= 0 && age <= 4) {
      setPreFilterBirth({ day, month, year })
      setPreFilterError(null)
      return
    }
    setPreFilterBirth({ day, month, year })
    setPreFilterError(null)
    setFormData((prev) => ({ ...prev, birthDay: day, birthMonth: month, birthYear: year }))
    setCurrentStep(1)
  }

  const submitRegistration = async () => {
    if (!selectedCategory) return
    setSubmitError('')
    setSubmitLoading(true)
    try {
      const payload = {
        categoryId: selectedCategory.id,
        fullName: formData.fullName.trim(),
        birthDate: getBirthDate(),
        gender: formData.gender || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        teamName: formData.hasTeam === true ? (formData.teamName.trim() || undefined) : undefined,
        originType: formData.originType,
        city: isBrazilian ? formData.city : undefined,
        state: isBrazilian ? formData.state : undefined,
        country: isBrazilian ? 'BRA' : (formData.nationality || undefined),
        documentType: shouldShowAthleteDocument ? documentType : undefined,
        documentNumber: shouldShowAthleteDocument ? documentNumber : undefined,
        addressStreet: formData.addressStreet.trim() || undefined,
        addressNumber: formData.addressNumber.trim() || undefined,
        addressComplement: formData.addressComplement.trim() || undefined,
        addressNeighborhood: formData.addressNeighborhood.trim() || undefined,
        addressZipCode: formData.addressZipCode.trim() || undefined,
        childCpf: undefined,
        guardianName: formData.guardianName.trim() || undefined,
        guardianCpf: formData.guardianCpf || undefined,
        guardianPhone: formData.guardianPhone.trim() || undefined,
        guardianRelationship: formData.guardianRelationship || undefined,
        isMacucoResident: selectedCategory.id === 'infantil-2k' ? formData.isMacucoResident ?? undefined : undefined,
        guardianDocumentType: shouldShowGuardianDocument ? formData.guardianDocumentType : undefined,
        guardianDocumentNumber: shouldShowGuardianDocument ? formData.guardianDocumentNumber : undefined,
      }
      const res = await fetch('/api/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          const docValue = shouldShowAthleteDocument ? documentNumber.replace(/\D/g, '') : selectedCategory?.id === 'infantil-2k' ? (formData.guardianCpf || '').replace(/\D/g, '') : (formData.guardianDocumentNumber || '').replace(/\D/g, '')
          if (docValue && docValue.length >= 9) {
            router.push(`/inscricao/acompanhar?doc=${encodeURIComponent(docValue)}`)
            return
          }
          if (formData.email?.trim()) {
            router.push(`/inscricao/acompanhar?email=${encodeURIComponent(formData.email.trim())}`)
            return
          }
          throw new Error((json?.error || 'Você já possui inscrição.') + ' Acesse Acompanhar Inscrição com CPF, RG ou e-mail.')
        }
        throw new Error(json?.error || 'Erro ao finalizar inscrição')
      }
      setRegistrationResult({
        registration_number: json.registration.registration_number,
        confirmation_code: json.registration.confirmation_code,
      })
      setCurrentStep(4)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao finalizar inscrição')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleContinueFromPersonalData = () => {
    // Coletar todos os erros
    const errors: Record<string, string> = {}

    if (!formData.fullName?.trim()) errors.fullName = 'Preencha o nome completo.'
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      errors.birthDate = 'Informe a data de nascimento completa.'
    }
    if (!formData.gender) errors.gender = 'Selecione o sexo.'
    if (!formData.email?.trim()) errors.email = 'Preencha o email.'
    if (!formData.phone?.trim()) errors.phone = 'Preencha o WhatsApp.'
    if (formData.hasTeam === null) {
      errors.hasTeam = 'Informe se você participa de alguma equipe.'
    }
    if (formData.hasTeam === true && !formData.teamName?.trim()) {
      errors.teamName = 'Informe o nome da equipe.'
    }
    if (!formData.originType) {
      errors.originType = 'Selecione se você é brasileiro(a) ou estrangeiro(a).'
    }
    if (isBrazilian && (!formData.state || !formData.city)) {
      errors.originLocation = 'Selecione o estado e o município.'
    }
    if (isForeign && !formData.nationality) {
      errors.nationality = 'Selecione sua nacionalidade.'
    }

    if (shouldShowAthleteDocument && !validateDocumentNumber(documentNumber, documentType)) {
      errors.documentNumber = `Informe um ${documentType} válido.`
    }

    if (shouldShowGuardianDocument) {
      if (!formData.guardianName?.trim()) errors.guardianName = 'Informe o nome completo do responsável.'
      if (!formData.guardianDocumentType) errors.guardianDocumentType = 'Selecione o tipo de documento do responsável.'
      if (!formData.guardianDocumentNumber || !validateDocumentNumber(formData.guardianDocumentNumber, formData.guardianDocumentType as DocumentType)) {
        errors.guardianDocumentNumber = `Informe um ${formData.guardianDocumentType} válido para o responsável.`
      }
    }

    if (selectedCategory?.id === 'infantil-2k') {
      const bd = getBirthDate()
      if (bd) {
        const age = getAgeByDec31(bd, eventYear)
        if (age < 5 || age > 14) {
          errors.birthDate = `A categoria Infantil 2.5K exige idade entre 5 e 14 anos até 31/12/${eventYear}.`
        }
      }
      if (!formData.guardianName?.trim()) errors.guardianName = 'Preencha o nome do responsável.'
      if (!formData.guardianCpf || !validateDocumentNumber(formData.guardianCpf, 'CPF')) {
        errors.guardianCpf = 'Informe um CPF válido do responsável.'
      }
      if (!formData.guardianPhone?.trim()) errors.guardianPhone = 'Preencha o telefone do responsável.'
      if (!formData.guardianRelationship) errors.guardianRelationship = 'Selecione o grau de parentesco.'
      if (formData.isMacucoResident === null) {
        errors.isMacucoResident = 'Informe se o atleta é morador(a) de Macuco.'
      }
    }

    if (!formData.acceptedTerms) {
      errors.acceptedTerms = 'Aceite o regulamento, os termos de uso e as políticas para continuar.'
    }

    if (selectedCategory?.id === 'sessenta-10k') {
      const bd = getBirthDate()
      if (bd && getAgeByDec31(bd, eventYear) < 60) {
        errors.birthDate = `A categoria 60+ 10K exige 60 anos ou mais até 31/12/${eventYear}.`
      }
    }

    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      const firstErrorId = Object.keys(errors)[0]
      setTimeout(() => {
        document.getElementById(`field-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      return
    }

    if (selectedCategory?.isFree) {
      submitRegistration()
    } else {
      setCurrentStep(3) // Vai para pagamento
    }
  }

  const getTaxIdForPayment = (): string | undefined => {
    if (selectedCategory?.id === 'infantil-2k') return formData.guardianCpf?.replace(/\D/g, '')
    if (shouldShowGuardianDocument && formData.guardianDocumentType === 'CPF') return formData.guardianDocumentNumber?.replace(/\D/g, '')
    if (shouldShowAthleteDocument && documentType === 'CPF') return documentNumber.replace(/\D/g, '')
    return undefined
  }

  const handleFinalizePayment = async () => {
    if (!formData.acceptedTerms) {
      setSubmitError('Aceite o regulamento, os termos de uso e as políticas para continuar.')
      return
    }
    setSubmitError409NoRedirect(false)
    if (!selectedCategory || selectedCategory.isFree) {
      submitRegistration()
      return
    }

    setSubmitError('')
    setSubmitLoading(true)
    try {
      let registrationId = pendingRegistrationId
      let registrationNumber: string
      let confirmationCode: string

      if (!registrationId) {
        const payload = {
          categoryId: selectedCategory.id,
          fullName: formData.fullName.trim(),
          birthDate: getBirthDate(),
          gender: formData.gender || undefined,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          teamName: formData.hasTeam === true ? (formData.teamName.trim() || undefined) : undefined,
          originType: formData.originType,
          city: isBrazilian ? formData.city : undefined,
          state: isBrazilian ? formData.state : undefined,
          country: isBrazilian ? 'BRA' : (formData.nationality || undefined),
          documentType: shouldShowAthleteDocument ? documentType : undefined,
          documentNumber: shouldShowAthleteDocument ? documentNumber : undefined,
          addressStreet: formData.addressStreet.trim() || undefined,
          addressNumber: formData.addressNumber.trim() || undefined,
          addressComplement: formData.addressComplement.trim() || undefined,
          addressNeighborhood: formData.addressNeighborhood.trim() || undefined,
          addressZipCode: formData.addressZipCode.trim() || undefined,
          childCpf: undefined,
          guardianName: formData.guardianName.trim() || undefined,
          guardianCpf: formData.guardianCpf || undefined,
          guardianPhone: formData.guardianPhone.trim() || undefined,
          guardianRelationship: formData.guardianRelationship || undefined,
          isMacucoResident: selectedCategory.id === 'infantil-2k' ? formData.isMacucoResident ?? undefined : undefined,
          guardianDocumentType: shouldShowGuardianDocument ? formData.guardianDocumentType : undefined,
          guardianDocumentNumber: shouldShowGuardianDocument ? formData.guardianDocumentNumber : undefined,
        }
        const resInsc = await fetch('/api/inscricao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const jsonInsc = await resInsc.json()
        if (!resInsc.ok) {
          if (resInsc.status === 409) {
            const docValue = shouldShowAthleteDocument ? (documentNumber || '').replace(/\D/g, '') : selectedCategory?.id === 'infantil-2k' ? (formData.guardianCpf || '').replace(/\D/g, '') : (formData.guardianDocumentNumber || '').replace(/\D/g, '')
            const emailVal = formData.email?.trim()
            if (docValue && docValue.length >= 9) {
              setSubmitError('Você já possui inscrição. Redirecionando...')
              const params = new URLSearchParams({ doc: docValue })
              if (emailVal && emailVal.includes('@')) params.set('email', emailVal)
              router.push(`/inscricao/acompanhar?${params.toString()}`)
              return
            }
            if (emailVal && emailVal.includes('@')) {
              setSubmitError('Você já possui inscrição. Redirecionando...')
              router.push(`/inscricao/acompanhar?email=${encodeURIComponent(emailVal)}`)
              return
            }
            setSubmitError(jsonInsc?.error || 'Você já possui inscrição neste evento.')
            setSubmitError409NoRedirect(true)
            return
          }
          throw new Error(jsonInsc?.error || 'Erro ao finalizar inscrição')
        }
        registrationId = jsonInsc.registration.id
        registrationNumber = jsonInsc.registration.registration_number
        confirmationCode = jsonInsc.registration.confirmation_code
        setPendingRegistrationId(registrationId)
      } else {
        if (!registrationResult) throw new Error('Dados da inscrição não encontrados. Volte e preencha novamente.')
        registrationNumber = registrationResult.registration_number
        confirmationCode = registrationResult.confirmation_code
      }

      const checkoutPayload = {
        registrationId: registrationId!,
        amount: selectedCategory.price,
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        taxId: getTaxIdForPayment(),
      }
      const resCheckout = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload),
      })
      const jsonCheckout = await resCheckout.json()
      if (!resCheckout.ok) throw new Error(jsonCheckout.error || 'Erro ao criar pagamento')

      if (jsonCheckout.id && jsonCheckout.brCode && jsonCheckout.brCodeBase64) {
        setRegistrationResult({
          registration_number: registrationNumber!,
          confirmation_code: confirmationCode!,
        })
        setPixData({
          id: jsonCheckout.id,
          brCode: jsonCheckout.brCode,
          brCodeBase64: jsonCheckout.brCodeBase64,
          amount: jsonCheckout.amount || selectedCategory.price * 100,
          expiresAt: jsonCheckout.expiresAt,
        })
        return
      }
      throw new Error('Resposta inválida do pagamento')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao processar pagamento')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleFileUpload = (field: 'residenceProofFile' | 'authorizationFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  // ============================================================
  // CAMPOS CONDICIONAIS POR CATEGORIA
  // ============================================================

  const renderCategorySpecificFields = () => {
    if (!selectedCategory) return null

    switch (selectedCategory.id) {
      case 'morador-10k':
        return <MoradorFields />

      case 'sessenta-10k':
        return <SeniorFields year={eventConfig?.year ?? 2026} />

      case 'infantil-2k':
        return <InfantilFields
          formData={formData}
          setFormData={setFormData}
          onFileUpload={handleFileUpload}
          fieldErrors={fieldErrors}
          clearFieldError={clearFieldError}
          onGuardianDocCheck={() => { }}
        />

      default:
        return null
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  if (configLoading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    )
  }

  if (configError) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-4">{configError}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!eventConfig?.registrationsOpen) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Inscrições encerradas</h2>
          <p className="text-gray-600">
            As inscrições para a {eventConfig?.edition ?? 51}ª Corrida Rústica de Macuco estão temporariamente fechadas.
          </p>
        </div>
      </div>
    )
  }

  // Pré-filtro: data de nascimento (quando vem da home sem ?categoria=)
  if (showPreFilterStep) {
    return (
      <div className="pt-20 sm:pt-24 min-h-screen bg-gray-50 pb-8">
        <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-8 sm:py-12">
          <div className="container-custom px-4 sm:px-6">
            <h1 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl mb-2 sm:mb-4">Inscrição Online</h1>
            <p className="text-base sm:text-xl text-primary-100">Complete sua inscrição em poucos minutos</p>
          </div>
        </section>
        <section className="py-6 sm:py-12 px-4 sm:px-0">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <div className="card p-4 sm:p-6">
                <h2 className="font-display font-bold text-xl sm:text-2xl mb-2">Informe sua data de nascimento</h2>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Com base na sua idade, vamos mostrar as categorias disponíveis para você.
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Dia</label>
                    <select
                      value={preFilterForm.day}
                      onChange={(e) => setPreFilterForm((p) => ({ ...p, day: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base"
                    >
                      <option value="">Dia</option>
                      {DAYS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Mês</label>
                    <select
                      value={preFilterForm.month}
                      onChange={(e) => setPreFilterForm((p) => ({ ...p, month: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base"
                    >
                      <option value="">Mês</option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Ano</label>
                    <select
                      value={preFilterForm.year}
                      onChange={(e) => setPreFilterForm((p) => ({ ...p, year: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base"
                    >
                      <option value="">Ano</option>
                      {Array.from({ length: 101 }, (_, i) => currentYear - i).map((y) => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {preFilterError && (
                  <p className="text-sm text-red-600 mb-4">{preFilterError}</p>
                )}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <button onClick={handlePreFilterSubmit} className="btn-primary flex items-center justify-center min-h-[44px] py-3 px-6">
                    Continuar
                    <ChevronRight size={20} className="ml-2" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSkipPreFilter(true)
                      setCurrentStep(1)
                    }}
                    className="text-gray-600 hover:text-primary-600 text-sm font-medium underline underline-offset-2 py-2 min-h-[44px] flex items-center"
                  >
                    Ver todas as categorias
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Idade 0-4: sem categoria disponível
  if (preFilterBirth && preFilterAge != null && preFilterAge <= 4) {
    return (
      <div className="pt-20 sm:pt-24 min-h-screen bg-gray-50 pb-8">
        <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-8 sm:py-12">
          <div className="container-custom px-4 sm:px-6">
            <h1 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl mb-4">Inscrição Online</h1>
          </div>
        </section>
        <section className="py-6 sm:py-12 px-4 sm:px-0">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <div className="card text-center">
                <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h2 className="font-display font-bold text-2xl mb-2">Não há categoria para sua idade</h2>
                <p className="text-gray-600 mb-6">
                  Com {preFilterAge} anos em 31/12/{eventYear}, não há categoria disponível nesta prova.
                  As categorias começam a partir de 5 anos (Infantil).
                </p>
                <button
                  onClick={() => {
                    setPreFilterBirth(null)
                    setPreFilterForm({ day: '', month: '', year: '' })
                  }}
                  className="btn-primary"
                >
                  Informar outra data
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="pt-20 sm:pt-24 min-h-screen bg-gray-50 pb-8">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-8 sm:py-12">
        <div className="container-custom px-4 sm:px-6">
          <h1 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl mb-2 sm:mb-4">
            Inscrição Online
          </h1>
          <p className="text-base sm:text-xl text-primary-100">
            Complete sua inscrição em poucos minutos
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-4 sm:py-8 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="container-custom px-4 sm:px-6">
          <div className="max-w-4xl mx-auto min-w-0">
            <div className="flex items-center justify-between gap-1">
              {activeSteps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted
                          ? 'bg-green-600'
                          : isActive
                            ? 'bg-primary-600'
                            : 'bg-gray-300'
                          } text-white transition-all duration-300`}
                      >
                        {isCompleted ? (
                          <Check size={20} />
                        ) : (
                          <Icon size={20} />
                        )}
                      </div>
                      <p
                        className={`mt-1 sm:mt-2 text-xs sm:text-sm font-semibold truncate max-w-full ${isActive ? 'text-primary-600' : 'text-gray-600'
                          }`}
                      >
                        {step.name}
                      </p>
                    </div>
                    {index < activeSteps.length - 1 && (
                      <div
                        className={`flex-1 h-1 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'
                          } transition-all duration-300`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-6 sm:py-12 px-4 sm:px-0">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">

            {/* ================================================ */}
            {/* STEP 1: CATEGORIA */}
            {/* ================================================ */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <div className="card p-4 sm:p-6">
                  <h2 className="font-display font-bold text-xl sm:text-3xl mb-4 sm:mb-6">
                    Escolha sua Categoria
                  </h2>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Selecione a categoria que deseja participar
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {categoriesToShow.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category)}
                        className={`text-left p-4 sm:p-6 rounded-xl border-2 transition-all min-h-[44px] active:scale-[0.99] ${selectedCategory?.id === category.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-display font-bold text-xl">
                            {category.name}
                          </h3>
                          {selectedCategory?.id === category.id && (
                            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                              <Check size={16} className="text-white" />
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4">{category.description}</p>

                        <div className="flex justify-between items-center mb-3">
                          <span className="text-3xl font-bold text-primary-600">
                            {category.isFree ? 'GRATUITO' : `R$ ${category.price.toFixed(2)}`}
                          </span>
                          <span className="text-sm text-accent-600 font-semibold">
                            {category.spotsAvailable != null
                              ? `${category.spotsAvailable} de ${category.spots} vagas`
                              : `${category.spots} vagas`}
                          </span>
                        </div>

                        {/* Documentos necessários */}
                        <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
                          <p className="font-semibold mb-1">Documentos necessários:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {category.documents.map((doc, idx) => (
                              <li
                                key={idx}
                                className={
                                  category.id === 'morador-10k' && doc.toLowerCase().includes('comprovante de residência')
                                    ? 'text-red-600 font-medium'
                                    : ''
                                }
                              >
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Faixa etária */}
                        <div className="mt-2 text-xs text-gray-500">
                          <p>
                            <span className="font-semibold">Idade:</span>{' '}
                            {category.ageMax
                              ? `${category.ageMin} a ${category.ageMax} anos`
                              : `A partir de ${category.ageMin} anos`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0">
                    {!categoriaParam ? (
                      <button
                        onClick={() => {
                          setPreFilterBirth(null)
                          setSkipPreFilter(false)
                          setSelectedCategory(null)
                        }}
                        className="btn-secondary min-h-[44px] order-2 sm:order-1"
                      >
                        Voltar
                      </button>
                    ) : (
                      <div />
                    )}
                    <button
                      onClick={handleContinueFromCategory}
                      disabled={!selectedCategory}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[44px] order-1 sm:order-2"
                    >
                      Continuar
                      <ChevronRight size={20} className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================ */}
            {/* STEP 2: DADOS PESSOAIS */}
            {/* ================================================ */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <div className="card p-4 sm:p-6">
                  <h2 className="font-display font-bold text-xl sm:text-3xl mb-4 sm:mb-6">
                    Dados Pessoais
                  </h2>
                  <p className="text-gray-600 mb-2 text-sm sm:text-base">
                    Preencha suas informações pessoais
                  </p>

                  {/* Alerta com categoria selecionada */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 flex items-start gap-3">
                    <AlertCircle className="text-primary-600 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-primary-900">
                        Categoria: {selectedCategory?.name}
                      </p>
                      <p className="text-sm text-primary-700 mt-1">
                        {selectedCategory?.description}
                      </p>
                    </div>
                  </div>

                  <form className="space-y-6">
                    {/* Dados básicos */}
                    <div id="field-fullName">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome Completo <span className="text-gray-500 font-normal">(Obrigatório)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value.toUpperCase() })
                          clearFieldError('fullName')
                        }}
                        className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Seu nome completo"
                      />
                      {fieldErrors.fullName && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
                      )}
                    </div>

                    {/* Origem: Brasileiro ou Estrangeiro */}
                    <div id="field-originType">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Você é brasileiro(a) ou estrangeiro(a)? <span className="text-gray-500 font-normal">(Obrigatório)</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="originType"
                            checked={formData.originType === 'brazilian'}
                            onChange={() => {
                              const isMorador = selectedCategory?.id === 'morador-10k'
                              setFormData({
                                ...formData,
                                originType: 'brazilian',
                                nationality: '',
                                state: isMorador ? 'RJ' : '',
                                city: isMorador ? 'Macuco' : '',
                                guardianName: '',
                                guardianDocumentType: '',
                                guardianDocumentNumber: '',
                              })
                              setDocumentType('CPF')
                              setDocumentNumber('')
                              clearFieldError('originType')
                              clearFieldError('originLocation')
                              clearFieldError('nationality')
                            }}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span>Sou brasileiro(a)</span>
                        </label>
                        <label className={`flex items-center gap-2 ${selectedCategory?.id === 'morador-10k' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                          <input
                            type="radio"
                            name="originType"
                            checked={formData.originType === 'foreign'}
                            disabled={selectedCategory?.id === 'morador-10k'}
                            onChange={() => {
                              if (selectedCategory?.id === 'morador-10k') return
                              setFormData({
                                ...formData,
                                originType: 'foreign',
                                state: '',
                                city: '',
                                guardianName: '',
                                guardianDocumentType: '',
                                guardianDocumentNumber: '',
                              })
                              setDocumentNumber('')
                              clearFieldError('originType')
                              clearFieldError('originLocation')
                              clearFieldError('nationality')
                            }}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span>Sou estrangeiro(a)</span>
                        </label>
                      </div>
                      {fieldErrors.originType && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.originType}</p>
                      )}

                      {/* Estado + Município (apenas brasileiros) */}
                      {isBrazilian && (
                        <div id="field-originLocation" className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado <span className="text-gray-500 font-normal">(Obrigatório)</span></label>
                            <select
                              required
                              value={formData.state}
                              onChange={(e) => {
                                setFormData({ ...formData, state: e.target.value })
                                clearFieldError('originLocation')
                              }}
                              disabled={selectedCategory?.id === 'morador-10k'}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed ${fieldErrors.originLocation ? 'border-red-500' : 'border-gray-300'}`}
                            >
                              <option value="">Selecione o estado</option>
                              {BRAZILIAN_STATES.map((s) => (
                                <option key={s.code} value={s.code}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Município <span className="text-gray-500 font-normal">(Obrigatório)</span></label>
                            <select
                              required
                              value={formData.city}
                              onChange={(e) => {
                                setFormData({ ...formData, city: e.target.value })
                                clearFieldError('originLocation')
                              }}
                              disabled={selectedCategory?.id === 'morador-10k' || !formData.state || municipiosLoading}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed ${fieldErrors.originLocation ? 'border-red-500' : 'border-gray-300'}`}
                            >
                              <option value="">
                                {municipiosLoading ? 'Carregando...' : !formData.state ? 'Selecione o estado primeiro' : 'Selecione o município'}
                              </option>
                              {municipios.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>
                          {fieldErrors.originLocation && (
                            <p className="text-xs text-red-600">{fieldErrors.originLocation}</p>
                          )}
                        </div>
                      )}

                      {/* Nacionalidade (apenas estrangeiros) */}
                      {isForeign && (
                        <div id="field-nationality" className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nacionalidade <span className="text-gray-500 font-normal">(Obrigatório)</span></label>
                          <select
                            required
                            value={formData.nationality}
                            onChange={(e) => {
                              setFormData({ ...formData, nationality: e.target.value })
                              clearFieldError('nationality')
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.nationality ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Selecione seu país</option>
                            {COUNTRY_OPTIONS_FOREIGN.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          {fieldErrors.nationality && (
                            <p className="text-xs text-red-600 mt-1">{fieldErrors.nationality}</p>
                          )}
                          <p className="text-xs text-blue-600 mt-2">
                            ℹ️ Participantes estrangeiros devem fornecer documento de um responsável brasileiro
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Documento de Identificação do Atleta - Apenas para Brasileiros */}
                    {shouldShowAthleteDocument && (
                      <div id="field-documentNumber">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Documento de Identificação (RG/CPF) <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </label>
                        <div className={`grid grid-cols-1 ${documentGridClass} gap-4`}>
                          <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center font-bold min-w-[100px]">
                            {documentType}
                          </div>
                          <input
                            type="text"
                            value={documentNumber}
                            onChange={(e) => handleDocumentNumberInput(e.target.value)}
                            onBlur={() => handleCheckExistingRegistration(documentNumber, documentType)}
                            required
                            maxLength={documentMaxLength}
                            inputMode="numeric"
                            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.documentNumber ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder={documentPlaceholder}
                          />
                        </div>
                        {isCheckingDoc && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                            <Loader2 size={14} className="animate-spin" />
                            Verificando disponibilidade...
                          </div>
                        )}
                        {docDuplicateFound && (
                          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="text-orange-600 mt-0.5" size={20} />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-orange-900">
                                  Inscrição já realizada!
                                </p>
                                <p className="text-sm text-orange-800 mt-1">
                                  Este documento já possui uma inscrição neste evento. Se você deseja alterar algum dado ou realizar o pagamento, acompanhe sua inscrição.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const raw = documentNumber.replace(/\D/g, '')
                                    router.push(`/inscricao/acompanhar?doc=${encodeURIComponent(raw)}`)
                                  }}
                                  className="mt-3 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                                >
                                  Ir para Acompanhar Inscrição
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {!docDuplicateFound && (
                          <>
                            <p className="text-xs text-gray-500 mt-2">{documentHelper}</p>
                            <p className="text-xs text-blue-600 mt-1">
                              Documento válido necessário para consultar sua inscrição em Acompanhar Inscrição.
                            </p>
                          </>
                        )}
                        {fieldErrors.documentNumber && !docDuplicateFound && (
                          <p className="text-xs text-red-600 mt-1">{fieldErrors.documentNumber}</p>
                        )}
                      </div>
                    )}

                    {/* Documento do Responsável - Apenas para Estrangeiros */}
                    {shouldShowGuardianDocument && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Documento do Responsável no Brasil (RG/CPF) <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </p>
                        <p className="text-xs text-gray-600 mb-4">
                          Como você é estrangeiro, precisamos do documento de um cidadão brasileiro que se responsabiliza pela sua inscrição.
                        </p>

                        <div className="space-y-4">
                          {/* Nome do Responsável */}
                          <div id="field-guardianName">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome do Responsável <span className="text-gray-500 font-normal">(Obrigatório)</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.guardianName}
                              onChange={(e) => {
                                setFormData({ ...formData, guardianName: e.target.value.toUpperCase() })
                                clearFieldError('guardianName')
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${fieldErrors.guardianName ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Nome completo do responsável"
                            />
                            {fieldErrors.guardianName && (
                              <p className="text-xs text-red-600 mt-1">{fieldErrors.guardianName}</p>
                            )}
                          </div>

                          {/* Documento do Responsável */}
                          <div id="field-guardianDocumentNumber">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Documento do Responsável <span className="text-gray-500 font-normal">(Obrigatório)</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
                              <div className={`px-4 py-3 border rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center font-bold min-w-[100px] ${fieldErrors.guardianDocumentType ? 'border-red-500' : 'border-gray-300'}`}>
                                {formData.guardianDocumentType || 'DOC'}
                              </div>
                              <input
                                type="text"
                                value={formData.guardianDocumentNumber}
                                onChange={(e) => {
                                  const val = e.target.value
                                  const digits = val.replace(/\D/g, '')
                                  const newType: DocumentType = digits.length <= 9 ? 'RG' : 'CPF'
                                  setFormData({
                                    ...formData,
                                    guardianDocumentType: newType,
                                    guardianDocumentNumber: formatDocumentNumber(val, newType),
                                  })
                                  clearFieldError('guardianDocumentNumber')
                                }}
                                required
                                maxLength={14}
                                inputMode="numeric"
                                className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${fieldErrors.guardianDocumentNumber ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder={formData.guardianDocumentType === 'CPF' ? '000.000.000-00' : '00.000.000-0'}
                              />
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              Documento válido necessário para consultar sua inscrição em Acompanhar Inscrição.
                            </p>
                            {(fieldErrors.guardianDocumentType || fieldErrors.guardianDocumentNumber) && (
                              <p className="text-xs text-red-600 mt-1">{fieldErrors.guardianDocumentType || fieldErrors.guardianDocumentNumber}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_160px] gap-4 sm:gap-6">
                      <div id="field-birthDate">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                          Data de Nascimento <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2 sm:gap-2">
                          <select
                            required
                            value={isBirthDateLocked ? (preFilterBirth?.day ?? formData.birthDay) : formData.birthDay}
                            onChange={(e) => {
                              setFormData({ ...formData, birthDay: e.target.value })
                              clearFieldError('birthDate')
                            }}
                            disabled={isBirthDateLocked}
                            className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base min-h-[44px] disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed ${fieldErrors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Dia</option>
                            {DAYS.map((d) => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                          <select
                            required
                            value={isBirthDateLocked ? (preFilterBirth?.month ?? formData.birthMonth) : formData.birthMonth}
                            onChange={(e) => {
                              setFormData({ ...formData, birthMonth: e.target.value })
                              clearFieldError('birthDate')
                            }}
                            disabled={isBirthDateLocked}
                            className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base min-h-[44px] disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed ${fieldErrors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Mês</option>
                            {MONTHS.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                          <select
                            required
                            value={isBirthDateLocked ? (preFilterBirth?.year ?? formData.birthYear) : formData.birthYear}
                            onChange={(e) => {
                              setFormData({ ...formData, birthYear: e.target.value })
                              clearFieldError('birthDate')
                            }}
                            disabled={isBirthDateLocked}
                            className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base min-h-[44px] disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed ${fieldErrors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Ano</option>
                            {YEARS.map((y) => (
                              <option key={y.value} value={y.value}>{y.label}</option>
                            ))}
                          </select>
                        </div>
                        {selectedCategory && (
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedCategory.ageMax
                              ? `Idade permitida: ${selectedCategory.ageMin} a ${selectedCategory.ageMax} anos`
                              : `Idade mínima: ${selectedCategory.ageMin} anos`}
                          </p>
                        )}
                        {(fieldErrors.birthDate || ageValidationError) && (
                          <p className="text-xs text-red-600 mt-2 font-medium">{fieldErrors.birthDate || ageValidationError}</p>
                        )}
                      </div>
                      <div id="field-age" className="md:w-24 md:min-w-0">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Idade
                        </label>
                        <div className="px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[48px] flex items-center justify-center text-sm">
                          {(() => {
                            const bd = getBirthDate()
                            if (!bd) return '—'
                            const age = getAgeByDec31(bd, eventYear)
                            return `${age} anos`
                          })()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Idade em {eventYear}</p>
                      </div>
                      <div id="field-gender">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Sexo <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </label>
                        <select
                          required
                          value={formData.gender}
                          onChange={(e) => {
                            setFormData({ ...formData, gender: e.target.value })
                            clearFieldError('gender')
                          }}
                          className={`w-full px-4 py-3 min-h-[44px] border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base ${fieldErrors.gender ? 'border-red-500' : 'border-gray-300'}`}
                        >
                          <option value="">Selecione</option>
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                        </select>
                        {fieldErrors.gender && (
                          <p className="text-xs text-red-600 mt-1">{fieldErrors.gender}</p>
                        )}
                      </div>
                    </div>

                    <div id="field-email">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-gray-500 font-normal">(Obrigatório)</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value.toLowerCase() })
                          clearFieldError('email')
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="seu@email.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Informe um e-mail válido com @ (ex: seu@email.com)
                      </p>
                      {fieldErrors.email && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div id="field-phone">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          WhatsApp (Brasil) <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: limitPhoneDigits(e.target.value) })
                            clearFieldError('phone')
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="(00) 00000-0000"
                        />
                        {fieldErrors.phone && (
                          <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
                        )}
                      </div>
                      <div id="field-hasTeam">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Você participa de alguma equipe? <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </label>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="hasTeam"
                              checked={formData.hasTeam === true}
                              onChange={() => {
                                setFormData((prev) => ({ ...prev, hasTeam: true }))
                                clearFieldError('hasTeam')
                                clearFieldError('teamName')
                              }}
                              className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span>Sim, participo de uma equipe</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="hasTeam"
                              checked={formData.hasTeam === false}
                              onChange={() => {
                                setFormData((prev) => ({ ...prev, hasTeam: false, teamName: '' }))
                                clearFieldError('hasTeam')
                                clearFieldError('teamName')
                              }}
                              className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500"
                            />
                            <span>Não, corro individualmente</span>
                          </label>
                        </div>
                        {fieldErrors.hasTeam && (
                          <p className="text-xs text-red-600 mt-1">{fieldErrors.hasTeam}</p>
                        )}
                        {formData.hasTeam === true && (
                          <div id="field-teamName" className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nome da equipe <span className="text-gray-500 font-normal">(Obrigatório)</span>
                            </label>
                            <input
                              type="text"
                              value={formData.teamName}
                              onChange={(e) => {
                                setFormData((prev) => ({ ...prev, teamName: e.target.value.toUpperCase() }))
                                clearFieldError('teamName')
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.teamName ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Informe o nome da equipe"
                            />
                            {fieldErrors.teamName && (
                              <p className="text-xs text-red-600 mt-1">{fieldErrors.teamName}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Campos condicionais por categoria */}
                    {renderCategorySpecificFields()}

                    <div id="field-acceptedTerms" className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        checked={formData.acceptedTerms}
                        onChange={(e) => {
                          setFormData({ ...formData, acceptedTerms: e.target.checked })
                          clearFieldError('acceptedTerms')
                        }}
                        className={`w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 ${fieldErrors.acceptedTerms ? 'ring-2 ring-red-500' : ''}`}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        Li e aceito o{' '}
                        <Link href="/regulamento" className="text-primary-600 hover:text-primary-700 font-semibold">
                          regulamento
                        </Link>
                        , os{' '}
                        <Link href="/termos" className="text-primary-600 hover:text-primary-700 font-semibold">
                          termos de uso
                        </Link>{' '}
                        e as{' '}
                        <Link href="/politicas" className="text-primary-600 hover:text-primary-700 font-semibold">
                          políticas de privacidade
                        </Link>{' '}
                        <span className="text-gray-500 font-normal">(Obrigatório)</span>
                      </label>
                    </div>
                    {fieldErrors.acceptedTerms && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.acceptedTerms}</p>
                    )}
                  </form>

                  {submitError && (
                    <p className="mt-4 text-sm text-red-600">{submitError}</p>
                  )}
                  {Object.keys(fieldErrors).length > 0 && (
                    <p className="mt-4 text-sm text-red-600 font-medium">
                      {Object.keys(fieldErrors).length === 1
                        ? 'Há 1 campo que precisa ser corrigido antes de continuar.'
                        : `Há ${Object.keys(fieldErrors).length} campos que precisam ser corrigidos antes de continuar.`}
                    </p>
                  )}
                  <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-0">
                    <button
                      onClick={() => setCurrentStep(1)}
                      disabled={submitLoading}
                      className="btn-secondary disabled:opacity-50 min-h-[44px] order-2 sm:order-1"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleContinueFromPersonalData}
                      disabled={submitLoading}
                      title={!isPersonalDataComplete() ? 'Clique para ver quais campos faltam' : undefined}
                      className={`btn-primary flex items-center justify-center min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 ${!submitLoading && !isPersonalDataComplete()
                        ? 'opacity-70 hover:opacity-90 transition-opacity cursor-pointer'
                        : ''
                        }`}
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 size={20} className="mr-2 animate-spin" />
                          {selectedCategory?.isFree ? 'Finalizando...' : 'Continuar'}
                        </>
                      ) : (
                        <>
                          {selectedCategory?.isFree ? 'Confirmar Inscrição' : 'Continuar'}
                          <ChevronRight size={20} className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================ */}
            {/* STEP 3: PAGAMENTO (apenas para categoria paga) */}
            {/* ================================================ */}
            {currentStep === 3 && !selectedCategory?.isFree && (
              <div className="animate-fade-in">
                <div className="card p-4 sm:p-6">
                  <h2 className="font-display font-bold text-xl sm:text-3xl mb-4 sm:mb-6">
                    Pagamento
                  </h2>

                  <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 mb-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 mb-1">Total a pagar</p>
                        <p className="text-4xl font-bold text-primary-600">
                          R$ {selectedCategory?.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{selectedCategory?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Categoria</p>
                        <p className="font-bold text-xl">{selectedCategory?.name.split(' ')[0]}</p>
                      </div>
                    </div>
                  </div>

                  {!pixData ? (
                    <>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                        <h3 className="font-bold text-lg mb-4">Confira seus dados antes de gerar o PIX</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div><span className="text-gray-600">Nome:</span> <span className="font-medium">{formData.fullName || '-'}</span></div>
                          <div>
                            <span className="text-gray-600">CPF/RG:</span>{' '}
                            <span className="font-medium">
                              {selectedCategory?.id === 'infantil-2k'
                                ? (formData.guardianCpf ? formatCPF(formData.guardianCpf) : '-')
                                : shouldShowGuardianDocument && formData.guardianDocumentType
                                  ? formatDocumentNumber(formData.guardianDocumentNumber, formData.guardianDocumentType as DocumentType)
                                  : shouldShowAthleteDocument && documentNumber
                                    ? formatDocumentNumber(documentNumber, documentType)
                                    : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Data de nascimento:</span>{' '}
                            <span className="font-medium">
                              {formData.birthDay && formData.birthMonth && formData.birthYear
                                ? `${formData.birthDay.padStart(2, '0')}/${formData.birthMonth.padStart(2, '0')}/${formData.birthYear}`
                                : '-'}
                            </span>
                          </div>
                          <div><span className="text-gray-600">E-mail:</span> <span className="font-medium">{formData.email || '-'}</span></div>
                          {formData.hasTeam && formData.teamName ? (
                            <div className="sm:col-span-2"><span className="text-gray-600">Clube/Equipe:</span> <span className="font-medium">{formData.teamName}</span></div>
                          ) : null}
                          <div><span className="text-gray-600">Categoria:</span> <span className="font-medium">{selectedCategory?.name || '-'}</span></div>
                        </div>
                      </div>

                      <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 mb-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-lg mb-1">PIX</p>
                            <p className="text-sm text-gray-600">Pagamento instantâneo via QR Code ou copia e cola</p>
                          </div>
                          <div className="text-4xl">💰</div>
                        </div>
                      </div>

                      {submitError && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-red-600">{submitError}</p>
                          {submitError409NoRedirect && (
                            <Link
                              href="/inscricao/acompanhar"
                              className="inline-block text-sm font-semibold text-primary-600 hover:text-primary-700 underline"
                            >
                              Ir para Acompanhar Inscrição →
                            </Link>
                          )}
                        </div>
                      )}
                      <div className="mt-8 flex justify-between">
                        <button
                          onClick={() => setCurrentStep(2)}
                          disabled={submitLoading}
                          className="btn-secondary disabled:opacity-50"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={handleFinalizePayment}
                          disabled={submitLoading}
                          className="btn-primary flex items-center disabled:opacity-50"
                        >
                          {submitLoading ? (
                            <>
                              <Loader2 size={20} className="mr-2 animate-spin" />
                              Gerando PIX...
                            </>
                          ) : (
                            <>
                              Gerar PIX
                              <ChevronRight size={20} className="ml-2" />
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white border-2 border-primary-200 rounded-xl p-6 mb-4 text-center">
                        <p className="font-bold text-lg mb-4">Escaneie o QR Code ou copie o código PIX</p>
                        {pixTimeLeft && (
                          <p className={`text-sm font-medium mb-2 ${pixTimeLeft === 'Expirado' ? 'text-amber-600' : 'text-gray-600'}`}>
                            {pixTimeLeft === 'Expirado' ? 'PIX expirado' : `Expira em ${pixTimeLeft}`}
                          </p>
                        )}
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
                        <p className="mt-4 text-sm text-gray-600 flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin" />
                          Aguardando pagamento...
                        </p>
                      </div>
                      <div className="mb-6 flex justify-center">
                        <button
                          onClick={handleCheckPaymentStatus}
                          disabled={checkingStatus}
                          className="btn-primary w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 py-3 px-6 disabled:opacity-50"
                        >
                          {checkingStatus ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={18} />
                              Já fiz o pagamento
                            </>
                          )}
                        </button>
                      </div>
                      {submitError && (
                        <p className="mt-4 text-sm text-red-600 text-center">{submitError}</p>
                      )}
                      <div className="mt-4 flex justify-start">
                        <button
                          onClick={() => {
                            setPixData(null)
                            setCurrentStep(2)
                            setSubmitError('')
                          }}
                          className="btn-secondary"
                        >
                          Voltar e gerar novo PIX
                        </button>
                      </div>
                      <p className="mt-4 text-sm text-gray-500">
                        PIX expirou ou saiu da página? Gere um novo QR Code aqui mesmo ou acesse{' '}
                        <Link href="/inscricao/acompanhar" className="text-primary-600 underline hover:text-primary-700">
                          Acompanhar inscrição
                        </Link>
                        , informe o documento cadastrado e clique em Gerar QR Code.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ================================================ */}
            {/* STEP 4: CONFIRMAÇÃO */}
            {/* ================================================ */}
            {currentStep === 4 && (
              <div className="animate-fade-in">
                <div className="card text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={48} />
                  </div>
                  <h2 className="font-display font-bold text-3xl mb-4">
                    Inscrição Confirmada! 🎉
                  </h2>
                  <p className="text-xl text-gray-600 mb-2">
                    Parabéns! Sua inscrição na {eventConfig?.edition ?? 51}ª Corrida de Macuco foi realizada com sucesso.
                  </p>
                  <p className="text-lg text-primary-600 font-semibold mb-6">
                    Categoria: {selectedCategory?.name}
                    {selectedCategory?.isFree && ' (Gratuita)'}
                  </p>

                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6 max-w-2xl mx-auto text-left">
                    <h3 className="font-bold text-lg mb-3">Dados da sua inscrição</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Número da inscrição</p>
                        <p className="text-lg text-primary-700">{registrationResult?.registration_number ?? '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Código de confirmação</p>
                        <p className="font-mono text-lg text-primary-700">{registrationResult?.confirmation_code ?? '-'}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Guarde o código acima. Use CPF, RG ou código para consultar em{' '}
                      <Link href="/inscricao/acompanhar" className="font-semibold text-primary-600 hover:underline">
                        Acompanhar Inscrição
                      </Link>.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
                    <h3 className="font-bold text-lg mb-4">Próximos Passos:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 mt-1" size={20} />
                        <span>Consulte o status em{' '}
                          <Link href="/inscricao/acompanhar" className="text-primary-600 hover:underline font-semibold">
                            Acompanhar Inscrição
                          </Link>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 mt-1" size={20} />
                        <span>Retirada do kit: {eventConfig?.raceDateFormatted ?? '24/06'} das 06h às 11h em {eventConfig?.location ?? 'Praça de Macuco'}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 mt-1" size={20} />
                        <span>Lembre-se de levar documento original e o código de confirmação na retirada do kit</span>
                      </li>
                      {selectedCategory?.requiresResidenceProof && (
                        <li className="flex items-start gap-3">
                          <AlertCircle className="text-orange-600 mt-1" size={20} />
                          <span className="font-semibold">Importante: O comprovante de residência em Macuco deve ser apresentado no dia da entrega do kit</span>
                        </li>
                      )}
                      {selectedCategory?.requiresGuardian && (
                        <li className="flex items-start gap-3">
                          <AlertCircle className="text-orange-600 mt-1" size={20} />
                          <span className="font-semibold">Importante: O responsável deve estar presente na retirada do kit</span>
                        </li>
                      )}
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-green-600 mt-1" size={20} />
                        <span>Confira seu nome na{' '}
                          <Link href="/inscricao/lista" className="text-primary-600 hover:underline font-semibold">
                            Lista Oficial de Inscritos
                          </Link>
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/inscricao/acompanhar" className="btn-primary">
                      Acompanhar Inscrição
                    </Link>
                    <Link href="/inscricao/lista" className="btn-secondary flex items-center gap-2">
                       Ver Lista de Inscritos
                    </Link>
                    <Link href="/guia-atleta" className="btn-secondary">
                      Ver Guia do Atleta
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// ============================================================
// COMPONENTES AUXILIARES - CAMPOS CONDICIONAIS
// ============================================================

interface FieldsProps {
  formData?: any
  setFormData?: any
  onFileUpload?: (field: any, file: File | null) => void
  fieldErrors?: Record<string, string>
  clearFieldError?: (field: string) => void
  onGuardianDocCheck?: () => void
}

// Campos específicos para Morador de Macuco
function MoradorFields() {
  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-bold text-lg mb-2 text-amber-900">
          🏘️ Morador de Macuco 10K - Categoria gratuita
        </h3>
        <p className="text-sm text-amber-900 mb-2">
          <strong>Importante:</strong> O comprovante de residência em Macuco
          (conta de luz, água, telefone, internet ou declaração de residência
          emitido nos últimos 90 dias) <strong>deverá ser apresentado no dia da entrega do kit</strong>.
        </p>
        <p className="text-sm font-semibold text-amber-800">
          Não é necessário enviar documentos agora — apresente na retirada do kit.
        </p>
      </div>
    </div>
  )
}

// Campos específicos para 60+
function SeniorFields({ year = 2026 }: { year?: number }) {
  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-lg mb-2 text-blue-900">
          👴 Categoria 60+ 10K - Gratuita
        </h3>
        <p className="text-sm text-blue-800">
          <strong>Requisito:</strong> Você deve completar 60 anos até 31/12/{year}.
        </p>
        <p className="text-sm text-blue-800 mt-2">
          Apresente documento com foto na retirada do kit para comprovar sua idade.
        </p>
      </div>
    </div>
  )
}

// Campos específicos para Infantil
function InfantilFields({ formData, setFormData, onFileUpload, fieldErrors = {}, clearFieldError }: FieldsProps) {
  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <div id="field-isMacucoResident" className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          O atleta é morador(a) de Macuco? <span className="text-gray-500 font-normal">(Obrigatório)</span>
        </label>
        <div className="flex flex-wrap gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="isMacucoResident"
              checked={formData?.isMacucoResident === true}
              onChange={() => {
                setFormData?.({ ...formData, isMacucoResident: true })
                clearFieldError?.('isMacucoResident')
              }}
              className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500"
            />
            <span>Sim</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="isMacucoResident"
              checked={formData?.isMacucoResident === false}
              onChange={() => {
                setFormData?.({ ...formData, isMacucoResident: false })
                clearFieldError?.('isMacucoResident')
              }}
              className="w-5 h-5 text-primary-600 focus:ring-2 focus:ring-primary-500"
            />
            <span>Não</span>
          </label>
        </div>
        {fieldErrors.isMacucoResident && (
          <p className="text-xs text-red-600 mt-1">{fieldErrors.isMacucoResident}</p>
        )}
      </div>

      <h3 className="font-bold text-lg mb-4 text-primary-700">
        Dados do Responsável
      </h3>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-900">
          <strong>Atenção:</strong> Obrigatório o responsável legal assinar o termo de autorização
          e estar presente na retirada do kit.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dados do Responsável */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Dados do Responsável Legal</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="field-guardianName">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Responsável <span className="text-gray-500 font-normal">(Obrigatório)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData?.guardianName || ''}
                  onChange={(e) => {
                    setFormData?.({ ...formData, guardianName: e.target.value.toUpperCase() })
                    clearFieldError?.('guardianName')
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.guardianName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nome completo do responsável"
                />
                {fieldErrors.guardianName && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.guardianName}</p>
                )}
              </div>
              <div id="field-guardianCpf">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CPF do Responsável <span className="text-gray-500 font-normal">(Obrigatório)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData?.guardianCpf || ''}
                  onChange={(e) => {
                    setFormData?.({ ...formData, guardianCpf: formatDocumentNumber(e.target.value, 'CPF') })
                    clearFieldError?.('guardianCpf')
                  }}
                  onBlur={() => {
                    // Verificação de responsável removida para permitir múltiplas inscrições por um mesmo responsável
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.guardianCpf ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="000.000.000-00"
                />
                {fieldErrors.guardianCpf && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.guardianCpf}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div id="field-guardianPhone">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone do Responsável <span className="text-gray-500 font-normal">(Obrigatório)</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={formData?.guardianPhone || ''}
                  onChange={(e) => {
                    setFormData?.({ ...formData, guardianPhone: limitPhoneDigits(e.target.value) })
                    clearFieldError?.('guardianPhone')
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.guardianPhone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="(00) 00000-0000"
                />
                {fieldErrors.guardianPhone && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.guardianPhone}</p>
                )}
              </div>
              <div id="field-guardianRelationship">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grau de Parentesco <span className="text-gray-500 font-normal">(Obrigatório)</span>
                </label>
                <select
                  required
                  value={formData?.guardianRelationship || ''}
                  onChange={(e) => {
                    setFormData?.({ ...formData, guardianRelationship: e.target.value })
                    clearFieldError?.('guardianRelationship')
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.guardianRelationship ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Selecione</option>
                  <option value="pai">Pai</option>
                  <option value="mae">Mãe</option>
                  <option value="avo">Avô/Avó</option>
                  <option value="tio">Tio/Tia</option>
                  <option value="outro">Outro Responsável Legal</option>
                </select>
                {fieldErrors.guardianRelationship && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.guardianRelationship}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
