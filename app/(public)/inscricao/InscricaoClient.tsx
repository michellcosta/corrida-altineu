'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronRight, CreditCard, User, FileText, CheckCircle, Upload, AlertCircle, Loader2, Copy } from 'lucide-react'
import Link from 'next/link'
import { COUNTRY_OPTIONS_FOREIGN } from '@/lib/countries'
import { BRAZILIAN_STATES } from '@/lib/brazilian-states'

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
  switch (type) {
    case 'CPF':
      return CPF_REGEX.test(value)
    case 'RG':
      return RG_REGEX.test(value)
    default:
      return false
  }
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
  const [documentType, setDocumentType] = useState<DocumentType>('CPF')
  const [documentNumber, setDocumentNumber] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitLoading, setSubmitLoading] = useState(false)

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }
  const [submitError, setSubmitError] = useState('')
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

  useEffect(() => {
    fetch('/api/event/config')
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
          // Pré-selecionar categoria da URL (?categoria=geral-10k) e ir direto para Dados Pessoais
          const categoriaParam = searchParams.get('categoria')
          if (categoriaParam) {
            const cat = data.categories.find((c: Category) => c.id === categoriaParam)
            if (cat) {
              setSelectedCategory(cat)
              setCurrentStep(2)
            }
          }
        } else {
          setConfigError('Não foi possível carregar as categorias.')
        }
      })
      .catch(() => setConfigError('Erro ao carregar configurações.'))
      .finally(() => setConfigLoading(false))
  }, [searchParams])

  const [formData, setFormData] = useState({
    // Dados pessoais básicos
    fullName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    email: '',
    phone: '',
    teamName: '',
    // Origem: brasileiro ou estrangeiro (obrigatório escolher)
    originType: null as 'brazilian' | 'foreign' | null,
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
    authorizationFile: null as File | null,
    
    // Termos
    acceptedTerms: false,
  })

  const documentPlaceholder =
    documentType === 'CPF' ? '000.000.000-00' : '00.000.000-0'

  const documentHelper = getDocumentHelper(documentType)

  const documentMaxLength = documentType === 'CPF' ? 14 : 12

  const documentGridClass = 'md:grid-cols-[160px_1fr]'

  const getBirthDate = (): string => {
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

  const MONTHS = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' }, { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
  ]
  const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
  const currentYear = new Date().getFullYear()
  const YEARS = Array.from({ length: 101 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) }))

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
      if (!formData.childCpf || !validateDocumentNumber(formData.childCpf, 'CPF')) return false
      if (!formData.guardianName?.trim() || !formData.guardianCpf || !validateDocumentNumber(formData.guardianCpf, 'CPF')) return false
      if (!formData.guardianPhone?.trim() || !formData.guardianRelationship || !formData.authorizationFile) return false
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
    setDocumentNumber(formatDocumentNumber(value, documentType))
    clearFieldError('documentNumber')
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setFieldErrors({})
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
        teamName: formData.teamName.trim() || undefined,
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
        childCpf: selectedCategory.id === 'infantil-2k' ? formData.childCpf : undefined,
        guardianName: formData.guardianName.trim() || undefined,
        guardianCpf: formData.guardianCpf || undefined,
        guardianPhone: formData.guardianPhone.trim() || undefined,
        guardianRelationship: formData.guardianRelationship || undefined,
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
        if (res.status === 409 && json.already_registered) {
          const docValue = shouldShowAthleteDocument ? documentNumber.replace(/\D/g, '') : selectedCategory?.id === 'infantil-2k' ? (formData.childCpf || '').replace(/\D/g, '') : (formData.guardianDocumentNumber || '').replace(/\D/g, '')
          if (docValue) router.push(`/inscricao/acompanhar?doc=${encodeURIComponent(docValue)}`)
          else throw new Error(json.error || 'Erro ao finalizar inscrição')
          return
        }
        throw new Error(json.error || 'Erro ao finalizar inscrição')
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
    if (!formData.phone?.trim()) errors.phone = 'Preencha o telefone/WhatsApp.'
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
      if (!formData.childCpf || !validateDocumentNumber(formData.childCpf, 'CPF')) {
        errors.childCpf = 'Informe um CPF válido da criança.'
      }
      if (!formData.guardianName?.trim()) errors.guardianName = 'Preencha o nome do responsável.'
      if (!formData.guardianCpf || !validateDocumentNumber(formData.guardianCpf, 'CPF')) {
        errors.guardianCpf = 'Informe um CPF válido do responsável.'
      }
      if (!formData.guardianPhone?.trim()) errors.guardianPhone = 'Preencha o telefone do responsável.'
      if (!formData.guardianRelationship) errors.guardianRelationship = 'Selecione o grau de parentesco.'
      if (!formData.authorizationFile) errors.authorizationFile = 'Envie o termo de autorização assinado.'
    }

    if (!formData.acceptedTerms) {
      errors.acceptedTerms = 'Aceite o regulamento e as políticas para continuar.'
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
      setSubmitError('Aceite o regulamento e as políticas para continuar.')
      return
    }
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
        teamName: formData.teamName.trim() || undefined,
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
        childCpf: selectedCategory.id === 'infantil-2k' ? formData.childCpf : undefined,
        guardianName: formData.guardianName.trim() || undefined,
        guardianCpf: formData.guardianCpf || undefined,
        guardianPhone: formData.guardianPhone.trim() || undefined,
        guardianRelationship: formData.guardianRelationship || undefined,
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
          if (resInsc.status === 409 && jsonInsc.already_registered) {
            const docValue = shouldShowAthleteDocument ? documentNumber.replace(/\D/g, '') : selectedCategory?.id === 'infantil-2k' ? (formData.childCpf || '').replace(/\D/g, '') : (formData.guardianDocumentNumber || '').replace(/\D/g, '')
            if (docValue) router.push(`/inscricao/acompanhar?doc=${encodeURIComponent(docValue)}`)
            else setSubmitError(jsonInsc.error || 'Erro ao finalizar inscrição')
            return
          }
          throw new Error(jsonInsc.error || 'Erro ao finalizar inscrição')
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

      const resCheckout = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registrationId!,
          amount: selectedCategory.price,
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          taxId: getTaxIdForPayment(),
        }),
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
    setFormData(prev => ({...prev, [field]: file}))
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
        return <InfantilFields formData={formData} setFormData={setFormData} onFileUpload={handleFileUpload} fieldErrors={fieldErrors} clearFieldError={clearFieldError} />
      
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

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-12">
        <div className="container-custom">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Inscrição Online
          </h1>
          <p className="text-xl text-primary-100">
            Complete sua inscrição em poucos minutos
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {activeSteps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-green-600'
                            : isActive
                            ? 'bg-primary-600'
                            : 'bg-gray-300'
                        } text-white transition-all duration-300`}
                      >
                        {isCompleted ? (
                          <Check size={24} />
                        ) : (
                          <Icon size={24} />
                        )}
                      </div>
                      <p
                        className={`mt-2 text-sm font-semibold ${
                          isActive ? 'text-primary-600' : 'text-gray-600'
                        }`}
                      >
                        {step.name}
                      </p>
                    </div>
                    {index < activeSteps.length - 1 && (
                      <div
                        className={`flex-1 h-1 ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-300'
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
      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            
            {/* ================================================ */}
            {/* STEP 1: CATEGORIA */}
            {/* ================================================ */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <div className="card">
                  <h2 className="font-display font-bold text-3xl mb-6">
                    Escolha sua Categoria
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Selecione a categoria que deseja participar
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category)}
                        className={`text-left p-6 rounded-xl border-2 transition-all ${
                          selectedCategory?.id === category.id
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
                            {category.spots} vagas
                          </span>
                        </div>

                        {/* Documentos necessários */}
                        <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
                          <p className="font-semibold mb-1">Documentos necessários:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {category.documents.map((doc, idx) => (
                              <li key={idx}>{doc}</li>
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

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleContinueFromCategory}
                      disabled={!selectedCategory}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                <div className="card">
                  <h2 className="font-display font-bold text-3xl mb-6">
                    Dados Pessoais
                  </h2>
                  <p className="text-gray-600 mb-2">
                    Preencha suas informações pessoais
                  </p>
                  
                  {/* Alerta com categoria selecionada */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-8 flex items-start gap-3">
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
                          setFormData({...formData, fullName: e.target.value.toUpperCase()})
                          clearFieldError('fullName')
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
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
                          Documento de Identificação <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </label>
                        <div className={`grid grid-cols-1 ${documentGridClass} gap-4`}>
                          <select
                            value={documentType}
                            onChange={(e) => handleDocumentTypeChange(e.target.value as DocumentType)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="CPF">CPF</option>
                            <option value="RG">RG</option>
                          </select>
                          <input
                            type="text"
                            value={documentNumber}
                            onChange={(e) => handleDocumentNumberInput(e.target.value)}
                            required
                            maxLength={documentMaxLength}
                            inputMode="numeric"
                            className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.documentNumber ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder={documentPlaceholder}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{documentHelper}</p>
                        {fieldErrors.documentNumber && (
                          <p className="text-xs text-red-600 mt-1">{fieldErrors.documentNumber}</p>
                        )}
                      </div>
                    )}

                    {/* Documento do Responsável - Apenas para Estrangeiros */}
                    {shouldShowGuardianDocument && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          Documento do Responsável no Brasil <span className="text-gray-500 font-normal">(Obrigatório)</span>
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
                              <select
                                value={formData.guardianDocumentType}
                                onChange={(e) => {
                                  setFormData({...formData, guardianDocumentType: e.target.value as DocumentType})
                                  clearFieldError('guardianDocumentType')
                                  clearFieldError('guardianDocumentNumber')
                                }}
                                required
                                className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${fieldErrors.guardianDocumentType ? 'border-red-500' : 'border-gray-300'}`}
                              >
                                <option value="">Tipo</option>
                                <option value="CPF">CPF</option>
                                <option value="RG">RG</option>
                              </select>
                              <input
                                type="text"
                                value={formData.guardianDocumentNumber}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    guardianDocumentNumber: formatDocumentNumber(e.target.value, formData.guardianDocumentType as DocumentType || 'CPF'),
                                  })
                                  clearFieldError('guardianDocumentNumber')
                                }}
                                required
                                maxLength={formData.guardianDocumentType === 'CPF' ? 14 : 12}
                                inputMode="numeric"
                                className={`px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${fieldErrors.guardianDocumentNumber ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder={formData.guardianDocumentType === 'CPF' ? '000.000.000-00' : '00.000.000-0'}
                              />
                            </div>
                            {(fieldErrors.guardianDocumentType || fieldErrors.guardianDocumentNumber) && (
                              <p className="text-xs text-red-600 mt-1">{fieldErrors.guardianDocumentType || fieldErrors.guardianDocumentNumber}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div id="field-birthDate">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Data de Nascimento <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            required
                            value={formData.birthDay}
                            onChange={(e) => {
                              setFormData({ ...formData, birthDay: e.target.value })
                              clearFieldError('birthDate')
                            }}
                            className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base ${fieldErrors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Dia</option>
                            {DAYS.map((d) => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                          <select
                            required
                            value={formData.birthMonth}
                            onChange={(e) => {
                              setFormData({ ...formData, birthMonth: e.target.value })
                              clearFieldError('birthDate')
                            }}
                            className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base ${fieldErrors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <option value="">Mês</option>
                            {MONTHS.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                          <select
                            required
                            value={formData.birthYear}
                            onChange={(e) => {
                              setFormData({ ...formData, birthYear: e.target.value })
                              clearFieldError('birthDate')
                            }}
                            className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base ${fieldErrors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
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
                      <div id="field-gender">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Sexo <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </label>
                        <select
                          required
                          value={formData.gender}
                          onChange={(e) => {
                            setFormData({...formData, gender: e.target.value})
                            clearFieldError('gender')
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.gender ? 'border-red-500' : 'border-gray-300'}`}
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
                          setFormData({...formData, email: e.target.value.toLowerCase()})
                          clearFieldError('email')
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="seu@email.com"
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div id="field-phone">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Telefone/WhatsApp (Brasil) <span className="text-gray-500 font-normal">(Obrigatório)</span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({...formData, phone: limitPhoneDigits(e.target.value)})
                            clearFieldError('phone')
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="(00) 00000-0000"
                        />
                        {fieldErrors.phone && (
                          <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Equipe (opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.teamName}
                          onChange={(e) => setFormData({...formData, teamName: e.target.value.toUpperCase()})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Informe o nome da equipe, se houver"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Deixe em branco caso não participe de uma equipe.
                        </p>
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
                          setFormData({...formData, acceptedTerms: e.target.checked})
                          clearFieldError('acceptedTerms')
                        }}
                        className={`w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 ${fieldErrors.acceptedTerms ? 'ring-2 ring-red-500' : ''}`}
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        Li e aceito o{' '}
                        <Link href="/regulamento" className="text-primary-600 hover:text-primary-700 font-semibold">
                          regulamento
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
                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      disabled={submitLoading}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleContinueFromPersonalData}
                      disabled={submitLoading}
                      title={!isPersonalDataComplete() ? 'Clique para ver quais campos faltam' : undefined}
                      className={`btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        !submitLoading && !isPersonalDataComplete()
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
                <div className="card">
                  <h2 className="font-display font-bold text-3xl mb-6">
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
                        <p className="mt-4 text-sm text-red-600">{submitError}</p>
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
                        <div className="flex flex-col items-center gap-4">
                          <img
                            src={pixData.brCodeBase64}
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
      <h3 className="font-bold text-lg mb-4 text-primary-700">
        👶 Dados da Criança e Responsável
      </h3>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-900">
          <strong>Atenção:</strong> Obrigatório o responsável legal assinar o termo de autorização 
          e estar presente na retirada do kit.
        </p>
      </div>

      <div className="space-y-6">
        {/* CPF da Criança */}
        <div id="field-childCpf">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            CPF da Criança <span className="text-gray-500 font-normal">(Obrigatório)</span>
          </label>
          <input
            type="text"
            required
            value={formData?.childCpf || ''}
            onChange={(e) => {
              setFormData?.({...formData, childCpf: formatDocumentNumber(e.target.value, 'CPF')})
              clearFieldError?.('childCpf')
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.childCpf ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="000.000.000-00"
          />
          <p className="text-xs text-gray-500 mt-1">CPF da criança participante</p>
          {fieldErrors.childCpf && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.childCpf}</p>
          )}
        </div>

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
                    setFormData?.({...formData, guardianName: e.target.value.toUpperCase()})
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
                    setFormData?.({...formData, guardianCpf: formatDocumentNumber(e.target.value, 'CPF')})
                    clearFieldError?.('guardianCpf')
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
                    setFormData?.({...formData, guardianPhone: limitPhoneDigits(e.target.value)})
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
                    setFormData?.({...formData, guardianRelationship: e.target.value})
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

        {/* Termo de Autorização */}
        <div id="field-authorizationFile">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Termo de Autorização Assinado <span className="text-gray-500 font-normal">(Obrigatório)</span>
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              onFileUpload?.('authorizationFile', e.target.files?.[0] || null)
              clearFieldError?.('authorizationFile')
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${fieldErrors.authorizationFile ? 'border-red-500' : 'border-gray-300'}`}
          />
          <p className="text-xs text-gray-500 mt-1">
            PDF, JPG ou PNG - Máx. 5MB | 
            <a href="#" className="text-primary-600 hover:text-primary-700 ml-1">
              Baixar modelo do termo
            </a>
          </p>
          {fieldErrors.authorizationFile && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.authorizationFile}</p>
          )}
        </div>
      </div>
    </div>
  )
}
