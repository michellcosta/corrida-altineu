'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { parseLocalDate } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/browserClient'
import { getCountryLabel } from '@/lib/countries'
import {
  Activity,
  AlertCircle,
  BarChart2,
  Calendar,
  CheckCircle,
  CreditCard,
  Database,
  Globe,
  Loader2,
  Mail,
  MapPin,
  PieChart,
  RefreshCw,
  Users,
  X,
} from 'lucide-react'

const AGE_RANGES = [
  { key: '5-11',  min: 5,  max: 11 },
  { key: '12-14', min: 12, max: 14 },
  { key: '15-19', min: 15, max: 19 },
  { key: '20-29', min: 20, max: 29 },
  { key: '30-39', min: 30, max: 39 },
  { key: '40-49', min: 40, max: 49 },
  { key: '50-59', min: 50, max: 59 },
  { key: '60-69', min: 60, max: 69 },
  { key: '70-79', min: 70, max: 79 },
  { key: '80-89', min: 80, max: 89 },
  { key: '90+',   min: 90, max: 999 },
]

const AGE_RANGES_MAIN = AGE_RANGES.slice(0, 7)
const AGE_RANGES_EXTRA = AGE_RANGES.slice(7)

const FEE_PER_TRANSACTION = 0.22

interface SiteStats {
  health: {
    database: boolean
    payment: boolean
    email: boolean
  }
  analytics: {
    views: number
    conversionRate: string
    topPages: Array<{ path: string; count: number }>
    period: string
  }
}

interface EventSummary {
  id: string
  edition: number
  year: number
  raceDate?: string
  ageCutoffDate?: string
  registrationsOpen: boolean
  city?: string
  state?: string
  withdrawalAmount?: number
  withdrawalNote?: string
}

interface RegistrationWithAthlete {
  id: string
  payment_status: string
  payment_amount: number
  athlete: { full_name: string; birth_date: string; gender: string | null; city: string | null; state: string | null; country: string | null }
}

type ToastState = { id: string; message: string; type: 'success' | 'error' }

function formatCity(athlete: { city?: string | null; state?: string | null; country?: string | null }): string | null {
  if (athlete?.country && athlete.country !== 'BRA') return null
  if (athlete?.city && athlete?.state) return `${athlete.city} - ${athlete.state}`
  if (athlete?.city) return athlete.city
  return null
}

function formatCountry(athlete: { country?: string | null }): string | null {
  if (!athlete?.country) return null
  return getCountryLabel(athlete.country)
}

function getAge(birthDate: string, cutoffDate: string): number {
  const birth = new Date(birthDate)
  const cutoff = new Date(cutoffDate)
  return cutoff.getFullYear() - birth.getFullYear()
}

function getAgeRange(age: number): string {
  return AGE_RANGES.find((r) => age >= r.min && age <= r.max)?.key ?? '90+'
}

async function fetchEventSummary(): Promise<EventSummary | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('year', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      edition: data.edition,
      year: data.year,
      raceDate: data.race_date ?? undefined,
      ageCutoffDate: data.age_cutoff_date ?? undefined,
      registrationsOpen: Boolean(data.registrations_open),
      city: data.city ?? undefined,
      state: data.state ?? undefined,
      withdrawalAmount: Number(data.withdrawal_amount ?? 0),
      withdrawalNote: data.withdrawal_note ?? '',
    }
  } catch {
    return null
  }
}

export default function SiteAdminDashboard() {
  const router = useRouter()
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null)
  const [eventSummary, setEventSummary] = useState<EventSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastState[]>([])
  const [togglingRegistrations, setTogglingRegistrations] = useState(false)

  // Org-style metrics
  const [total, setTotal] = useState(0)
  const [citiesCount, setCitiesCount] = useState(0)
  const [countriesCount, setCountriesCount] = useState(0)
  const [daysToEvent, setDaysToEvent] = useState<number | null>(null)
  const [ageDistribution, setAgeDistribution] = useState<
    { range: string; male: number; female: number }[]
  >([])
  const [topCities, setTopCities] = useState<{ city: string; count: number }[]>([])
  const [topCountries, setTopCountries] = useState<{ country: string; count: number }[]>([])
  const [allCities, setAllCities] = useState<{ city: string; count: number }[]>([])
  const [allCountries, setAllCountries] = useState<{ country: string; count: number }[]>([])
  const [citiesModalOpen, setCitiesModalOpen] = useState(false)
  const [countriesModalOpen, setCountriesModalOpen] = useState(false)
  const [showAllAges, setShowAllAges] = useState(false)
  const [ageModalRange, setAgeModalRange] = useState<string | null>(null)
  const [ageAthleteMap, setAgeAthleteMap] = useState<Record<string, { name: string; gender: string; age: number; city: string }[]>>({})
  const [paymentStats, setPaymentStats] = useState({
    paid: 0,
    pending: 0,
    free: 0,
    totalAmount: 0,
    netAmount: 0,
    withdrawalAmount: 0,
    withdrawalNote: '',
  })
  const [withdrawalInput, setWithdrawalInput] = useState('0,00')
  const [withdrawalNoteInput, setWithdrawalNoteInput] = useState('')
  const [savingWithdrawal, setSavingWithdrawal] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    const amount = Number(eventSummary?.withdrawalAmount ?? 0)
    setWithdrawalInput(
      amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }, [eventSummary?.withdrawalAmount])

  useEffect(() => {
    setWithdrawalNoteInput(eventSummary?.withdrawalNote ?? '')
  }, [eventSummary?.withdrawalNote])

  const parseCurrencyInput = (value: string): number => {
    const normalized = value
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.-]/g, '')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
  }

  const saveWithdrawalAmount = async () => {
    if (!eventSummary?.id) return
    setSavingWithdrawal(true)
    try {
      const amount = parseCurrencyInput(withdrawalInput)
      const supabase = createClient()
      const { error } = await supabase
        .from('events')
        .update({
          withdrawal_amount: amount,
          withdrawal_note: withdrawalNoteInput.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventSummary.id)

      if (error) throw error
      notify('Valor de retirada atualizado.', 'success')
      await loadDashboard()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao salvar retirada.', 'error')
    } finally {
      setSavingWithdrawal(false)
    }
  }

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)

      const [event, siteStatsData] = await Promise.all([
        fetchEventSummary().catch((err) => {
          console.error('Erro ao buscar evento:', err)
          return null
        }),
        fetch('/api/admin/stats')
          .then(res => res.ok ? res.json() : null)
          .catch((err) => {
            console.error('Erro ao buscar site stats:', err)
            return null
          })
      ])

      setEventSummary(event)
      setSiteStats(siteStatsData)

      // Org-style metrics (from latest event)
      if (!event) {
        setTotal(0)
        setCitiesCount(0)
        setCountriesCount(0)
        setDaysToEvent(null)
        setAgeDistribution([])
        setTopCities([])
        setTopCountries([])
        setAllCities([])
        setAllCountries([])
        setPaymentStats({ paid: 0, pending: 0, free: 0, totalAmount: 0, netAmount: 0, withdrawalAmount: 0, withdrawalNote: '' })
      } else {
        const cutoffDate = event.ageCutoffDate ?? event.raceDate ?? new Date().toISOString().slice(0, 10)
        if (event.raceDate) {
          const today = new Date()
          const race = new Date(event.raceDate)
          setDaysToEvent(Math.max(0, Math.ceil((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))))
        } else {
          setDaysToEvent(null)
        }

        const supabase = createClient()
        const { data: regs } = await supabase
          .from('registrations')
          .select(`
            id,
            payment_status,
            payment_amount,
            athlete:athletes(full_name, birth_date, gender, city, state, country)
          `)
          .eq('event_id', event.id)
          .in('payment_status', ['paid', 'free'])

        const list = (regs || []) as unknown as RegistrationWithAthlete[]
        setTotal(list.length)

        const citySet = new Set(list.map((r) => formatCity(r.athlete)).filter((c): c is string => c != null))
        setCitiesCount(citySet.size)

        const countrySet = new Set(list.map((r) => formatCountry(r.athlete)).filter((c): c is string => c != null))
        setCountriesCount(countrySet.size)

        const byCity = list.reduce<Record<string, number>>((acc, r) => {
          const city = formatCity(r.athlete)
          if (city) acc[city] = (acc[city] || 0) + 1
          return acc
        }, {})
        const allC = Object.entries(byCity)
          .sort(([, a], [, b]) => b - a)
          .map(([city, count]) => ({ city, count }))
        setAllCities(allC)
        setTopCities(allC.slice(0, 5))

        const byCountry = list.reduce<Record<string, number>>((acc, r) => {
          const country = formatCountry(r.athlete)
          if (country) acc[country] = (acc[country] || 0) + 1
          return acc
        }, {})
        const allP = Object.entries(byCountry)
          .sort(([, a], [, b]) => b - a)
          .map(([country, count]) => ({ country, count }))
        setAllCountries(allP)
        setTopCountries(allP.slice(0, 5))

        const ageByRange: Record<string, { male: number; female: number }> = {}
        const ageMap: Record<string, { name: string; gender: string; age: number; city: string }[]> = {}
        AGE_RANGES.forEach((r) => {
          ageByRange[r.key] = { male: 0, female: 0 }
          ageMap[r.key] = []
        })
        list.forEach((r) => {
          if (!r.athlete?.birth_date) return
          const age = getAge(r.athlete.birth_date, cutoffDate)
          const range = getAgeRange(age)
          const gender = (r.athlete.gender ?? 'M').toUpperCase()
          if (gender === 'M') {
            ageByRange[range].male++
          } else {
            ageByRange[range].female++
          }
          ageMap[range].push({
            name: r.athlete.full_name ?? '-',
            gender,
            age,
            city: formatCity(r.athlete) ?? '-',
          })
        })
        AGE_RANGES.forEach((r) => {
          ageMap[r.key].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        })
        setAgeDistribution(
          AGE_RANGES.map((r) => ({
            range: r.key,
            male: ageByRange[r.key].male,
            female: ageByRange[r.key].female,
          }))
        )
        setAgeAthleteMap(ageMap)

        const paid = list.filter((r) => r.payment_status === 'paid').length
        const pending = list.filter((r) => ['pending', 'processing'].includes(r.payment_status ?? '')).length
        const free = list.filter((r) => r.payment_status === 'free' || !r.payment_status).length
        const totalAmount = list
          .filter((r) => r.payment_status === 'paid')
          .reduce((sum, r) => {
            const v = r.payment_amount
            const n = typeof v === 'string' ? parseFloat(String(v).replace(',', '.')) : Number(v)
            return sum + (Number.isFinite(n) ? n : 0)
          }, 0)
        const withdrawalAmount = Number(event.withdrawalAmount ?? 0)
        const netAmount = Number.isFinite(totalAmount)
          ? Math.max(0, totalAmount - paid * FEE_PER_TRANSACTION - withdrawalAmount)
          : 0
        setPaymentStats({
          paid,
          pending,
          free,
          totalAmount,
          netAmount,
          withdrawalAmount,
          withdrawalNote: event.withdrawalNote ?? '',
        })
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar painel:', err)
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados do painel.')
      setEventSummary(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboard()
    notify('Painel atualizado.', 'success')
  }

  const notify = (message: string, type: ToastState['type']) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  const handleToggleRegistrations = async () => {
    if (!eventSummary || togglingRegistrations) return
    const newState = !eventSummary.registrationsOpen
    setTogglingRegistrations(true)
    try {
      const res = await fetch('/api/admin/event/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ open: newState }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `Erro ${res.status}`)
      }
      setEventSummary({ ...eventSummary, registrationsOpen: newState })
      notify(
        newState ? 'Inscrições reabertas com sucesso!' : 'Inscrições encerradas com sucesso!',
        'success'
      )
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Erro ao alternar inscrições', 'error')
    } finally {
      setTogglingRegistrations(false)
    }
  }

  const totalMale = useMemo(() => ageDistribution.reduce((acc, item) => acc + item.male, 0), [ageDistribution])
  const totalFemale = useMemo(() => ageDistribution.reduce((acc, item) => acc + item.female, 0), [ageDistribution])

  const formattedRaceDate = useMemo(() => {
    if (!eventSummary?.raceDate) return null
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(parseLocalDate(eventSummary.raceDate))
    } catch {
      return eventSummary.raceDate
    }
  }, [eventSummary])

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Gradient header - estilo org */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 md:p-8 text-white flex-1">
            <h2 className="text-xl md:text-3xl font-display font-bold mb-1 md:mb-2">Painel do site</h2>
            <p className="text-blue-100 text-sm md:text-lg">
              Centralize a gestão de páginas, seções, posts e métricas do portal oficial.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            <button
              onClick={handleRefresh}
              className="admin-button-secondary flex items-center justify-center gap-2 flex-1 md:flex-none"
              disabled={refreshing}
            >
              {refreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Atualizar
            </button>
            <button
              onClick={() => router.push('/')}
              className="admin-button-secondary flex-1 md:flex-none"
            >
              Ver site
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Stats Grid - estilo org */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="admin-card">
                <div className="flex items-center justify-center h-16 md:h-24">
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="admin-card">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-lg md:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1">{total.toLocaleString('pt-BR')}</p>
                <p className="text-xs md:text-sm text-gray-600">Inscritos</p>
              </div>
              <div className="admin-card">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-lg md:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1">{citiesCount}</p>
                <p className="text-xs md:text-sm text-gray-600">Cidades Representadas</p>
              </div>
              <div className="admin-card">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-lg md:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1">{countriesCount}</p>
                <p className="text-xs md:text-sm text-gray-600">Países Representados</p>
              </div>
              <div className="admin-card">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                </div>
                <p className="text-lg md:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1">
                  {daysToEvent != null ? daysToEvent : '—'}
                </p>
                <p className="text-xs md:text-sm text-gray-600">Dias para o Evento</p>
              </div>
            </>
          )}
        </div>

        {/* Event card + Age/Cities/Countries */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Event summary card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Evento</p>
                <h2 className="text-lg font-semibold text-gray-900">Resumo da próxima edição</h2>
              </div>
              <Calendar className="text-primary-600" size={24} />
            </div>
            {eventSummary ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span>
                    {eventSummary.edition}ª edição • {eventSummary.year}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <Globe size={16} className="mt-0.5 text-primary-500" />
                  <span>
                    {eventSummary.city ?? 'Macuco'}
                    {eventSummary.state ? ` - ${eventSummary.state}` : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Data prevista:{' '}
                  <strong className="text-gray-900">{formattedRaceDate ?? 'Defina em Configurações'}</strong>
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Inscrições {eventSummary.registrationsOpen ? 'abertas' : 'fechadas'}
                </p>
                <button
                  onClick={handleToggleRegistrations}
                  disabled={togglingRegistrations}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    eventSummary.registrationsOpen
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {togglingRegistrations
                    ? 'Aguarde...'
                    : eventSummary.registrationsOpen
                      ? 'Encerrar inscrições'
                      : 'Reabrir inscrições'}
                </button>
                <button
                  onClick={() => router.push('/admin/site/settings/event')}
                  className="admin-button-secondary w-full"
                >
                  Ajustar configurações
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                Nenhuma configuração de evento encontrada. Cadastre no módulo de configurações.
              </div>
            )}
          </div>

          {/* Age Distribution */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900">Distribuição por Idade e Sexo</h3>
              <PieChart size={18} className="text-gray-400" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32 md:h-48">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {ageDistribution
                  .filter((item) => AGE_RANGES_MAIN.some((r) => r.key === item.range))
                  .map((item) => {
                    const itemTotal = item.male + item.female
                    return (
                      <div key={item.range} onClick={() => itemTotal > 0 && setAgeModalRange(item.range)} className={itemTotal > 0 ? 'cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1' : ''}>
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <span className="text-xs md:text-sm font-medium text-gray-700">{item.range} anos</span>
                          <span className="text-xs md:text-sm text-gray-600">M: {item.male} / F: {item.female}</span>
                        </div>
                        <div className="flex gap-1 h-3 md:h-2">
                          {itemTotal > 0 ? (
                            <>
                              <div className="bg-blue-500 rounded-l" style={{ width: `${(item.male / itemTotal) * 100}%` }} />
                              <div className="bg-pink-500 rounded-r" style={{ width: `${(item.female / itemTotal) * 100}%` }} />
                            </>
                          ) : (
                            <div className="w-full bg-gray-200 rounded h-3 md:h-2" />
                          )}
                        </div>
                      </div>
                    )
                  })}

                {showAllAges &&
                  ageDistribution
                    .filter((item) => AGE_RANGES_EXTRA.some((r) => r.key === item.range))
                    .map((item) => {
                      const itemTotal = item.male + item.female
                      return (
                        <div key={item.range} onClick={() => itemTotal > 0 && setAgeModalRange(item.range)} className={itemTotal > 0 ? 'cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1' : ''}>
                          <div className="flex items-center justify-between mb-0.5 md:mb-1">
                            <span className="text-xs md:text-sm font-medium text-gray-700">{item.range} anos</span>
                            <span className="text-xs md:text-sm text-gray-600">M: {item.male} / F: {item.female}</span>
                          </div>
                          <div className="flex gap-1 h-3 md:h-2">
                            {itemTotal > 0 ? (
                              <>
                                <div className="bg-blue-500 rounded-l" style={{ width: `${(item.male / itemTotal) * 100}%` }} />
                                <div className="bg-pink-500 rounded-r" style={{ width: `${(item.female / itemTotal) * 100}%` }} />
                              </>
                            ) : (
                              <div className="w-full bg-gray-200 rounded h-3 md:h-2" />
                            )}
                          </div>
                        </div>
                      )
                    })}

                <button
                  type="button"
                  onClick={() => setShowAllAges((v) => !v)}
                  className="w-full text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline mt-1"
                >
                  {showAllAges ? 'Recolher' : 'Ver todas (60+)'}
                </button>

                <div className="flex items-center justify-center gap-4 md:gap-6 mt-2 pt-3 md:pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-600">Masculino ({totalMale})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-500 rounded"></div>
                    <span className="text-xs text-gray-600">Feminino ({totalFemale})</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Cities */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900">Principais Cidades</h3>
              <MapPin size={18} className="text-gray-400" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32 md:h-48">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : topCities.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma inscrição ainda.</p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {topCities.map((item, index) => (
                  <div key={item.city}>
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-xs md:text-sm font-medium text-gray-700 truncate">{item.city}</span>
                      </div>
                      <span className="text-xs md:text-sm font-bold text-gray-900 flex-shrink-0 ml-1">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                      <div
                        className="bg-blue-600 h-1.5 md:h-2 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                {allCities.length > 5 && (
                  <button
                    onClick={() => setCitiesModalOpen(true)}
                    className="w-full mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Ver todas ({allCities.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top Countries + Payment Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Countries */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900">Principais Países</h3>
              <Globe size={18} className="text-gray-400" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32 md:h-48">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : topCountries.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma inscrição ainda.</p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {topCountries.map((item, index) => (
                  <div key={item.country}>
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <span className="w-5 h-5 md:w-6 md:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-xs md:text-sm font-medium text-gray-700 truncate">{item.country}</span>
                      </div>
                      <span className="text-xs md:text-sm font-bold text-gray-900 flex-shrink-0 ml-1">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                      <div
                        className="bg-blue-600 h-1.5 md:h-2 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                {allCountries.length > 5 && (
                  <button
                    onClick={() => setCountriesModalOpen(true)}
                    className="w-full mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Ver todos ({allCountries.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Status */}
          <div className="admin-card">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">Status de Pagamento</h3>
            {loading ? (
              <div className="flex items-center justify-center h-24 md:h-32">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : (
              <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="text-center p-4 md:p-6 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl md:text-3xl font-bold text-green-600 mb-1 md:mb-2">{paymentStats.paid}</p>
                  <p className="text-xs md:text-sm text-gray-600">Pagantes</p>
                  <p className="text-xs text-green-600 font-semibold mt-0.5 md:mt-1">
                    {total > 0 ? `${((paymentStats.paid / total) * 100).toFixed(0)}%` : '0%'}
                  </p>
                </div>
                <div className="text-center p-4 md:p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-1 md:mb-2">{paymentStats.free}</p>
                  <p className="text-xs md:text-sm text-gray-600">Gratuitos</p>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5 md:mt-1">
                    {total > 0 ? `${((paymentStats.free / total) * 100).toFixed(0)}%` : '0%'}
                  </p>
                </div>
                <div className="text-center p-4 md:p-6 bg-purple-50 rounded-lg border border-purple-200 col-span-2 md:col-span-1">
                  <p className="text-xl md:text-3xl font-bold text-purple-600 mb-1 md:mb-2">
                    R$ {(Number.isFinite(paymentStats.netAmount) ? paymentStats.netAmount : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">Líquido (após taxa)</p>
                  <p className="text-[10px] md:text-xs text-purple-600 font-semibold mt-0.5 md:mt-1">
                    Bruto R$ {(Number.isFinite(paymentStats.totalAmount) ? paymentStats.totalAmount : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} − R$ {(paymentStats.paid * FEE_PER_TRANSACTION).toFixed(2)} taxa − R$ {paymentStats.withdrawalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} retirada
                  </p>
                  {paymentStats.withdrawalNote ? (
                    <p className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">
                      {paymentStats.withdrawalNote}
                    </p>
                  ) : null}
                  <details className="mt-2 text-left">
                    <summary className="text-[10px] md:text-xs text-purple-700 font-semibold cursor-pointer select-none">
                      ℹ️ Como calculamos este valor
                    </summary>
                    <div className="mt-1 text-[10px] md:text-xs text-gray-700 leading-relaxed">
                      <p><strong>Bruto:</strong> soma de todos os pagamentos aprovados (paid).</p>
                      <p><strong>Taxa:</strong> taxa fixa do Mercado Pago de R$ {FEE_PER_TRANSACTION.toFixed(2)} por pagamento aprovado.</p>
                      <p><strong>Retirada:</strong> valor manual informado no painel do Site Admin.</p>
                      <p><strong>Líquido:</strong> Bruto - Taxa - Retirada.</p>
                    </div>
                  </details>
                </div>
              </div>
              <div className="mt-4 p-3 md:p-4 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Retirada (deduz do líquido)</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={withdrawalInput}
                    onChange={(e) => setWithdrawalInput(e.target.value)}
                    placeholder="0,00"
                    className="w-full sm:max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={saveWithdrawalAmount}
                    disabled={savingWithdrawal}
                    className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold disabled:opacity-60"
                  >
                    {savingWithdrawal ? 'Salvando...' : 'Salvar retirada'}
                  </button>
                </div>
                <textarea
                  value={withdrawalNoteInput}
                  onChange={(e) => setWithdrawalNoteInput(e.target.value)}
                  placeholder="Descreva a retirada (ex.: pagamento de estrutura, premiação, equipe de apoio)"
                  rows={3}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              </>
            )}
          </div>
        </div>

        {/* Analytics + System Health */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Analytics Básico */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart2 size={20} className="text-blue-600" />
                  Analytics Básico
                </h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Últimos 7 dias</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Visitas Totais</p>
                  <div className="flex items-end justify-between">
                    {loading ? (
                      <Loader2 size={24} className="animate-spin text-primary-600" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {(siteStats?.analytics?.views ?? 0).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Conversões</p>
                  <div className="flex items-end justify-between">
                    {loading ? (
                      <Loader2 size={24} className="animate-spin text-primary-600" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {siteStats?.analytics?.conversionRate ?? '0'}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Páginas mais acessadas</h3>

                {loading ? (
                  <div className="flex min-h-[80px] items-center justify-center text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  </div>
                ) : !siteStats?.analytics?.topPages?.length ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    Nenhuma visualização registrada nos últimos 7 dias.
                  </div>
                ) : (
                  siteStats.analytics.topPages.map((page) => {
                    const maxCount = Math.max(...siteStats.analytics.topPages.map((p) => p.count), 1)
                    const widthPct = Math.round((page.count / maxCount) * 100)
                    return (
                      <div key={page.path}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600 truncate max-w-[70%]">{page.path || '/'}</span>
                          <span className="font-medium text-gray-900 text-xs">
                            {page.count.toLocaleString('pt-BR')} visualizações
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Saúde do Sistema */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={20} className="text-indigo-600" />
                Saúde do Sistema
              </h2>
              {loading ? (
                <Loader2 size={16} className="animate-spin text-gray-400" />
              ) : (
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${(siteStats?.health?.database && siteStats?.health?.payment) ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                  }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${(siteStats?.health?.database && siteStats?.health?.payment) ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                  {(siteStats?.health?.database && siteStats?.health?.payment) ? 'Operacional' : 'Com Alertas'}
                </span>
              )}
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                    <Database size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Banco de Dados</h3>
                    <p className="text-xs text-gray-500">Conexão Supabase</p>
                  </div>
                </div>
                {loading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : (
                  siteStats?.health?.database
                    ? <div className="text-xs font-bold text-emerald-600">Online</div>
                    : <div className="text-xs font-bold text-red-600">Offline</div>
                )}
              </div>

              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <CreditCard size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Integração AbacatePay</h3>
                    <p className="text-xs text-gray-500">API de Pagamentos</p>
                  </div>
                </div>
                {loading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : (
                  siteStats?.health?.payment
                    ? <div className="text-xs font-bold text-emerald-600">Configurado</div>
                    : <div className="text-xs font-bold text-amber-600">Falta Chave API</div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                    <Mail size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Serviço de E-mail</h3>
                    <p className="text-xs text-gray-500">Resend / SMTP</p>
                  </div>
                </div>
                {loading ? <Loader2 size={16} className="animate-spin text-gray-400" /> : (
                  siteStats?.health?.email
                    ? <div className="text-xs font-bold text-emerald-600">Configurado</div>
                    : <div className="text-xs font-bold text-amber-600">Não Conectado</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/admin/site/inscritos')}
            className="admin-button-secondary text-sm flex-1 md:flex-none py-3"
          >
            Inscritos
          </button>
          <button
            onClick={() => router.push('/admin/site/content/pages')}
            className="admin-button-secondary text-sm flex-1 md:flex-none py-3"
          >
            Conteúdo
          </button>
          <button
            onClick={() => router.push('/admin/site/settings/event')}
            className="admin-button-secondary text-sm flex-1 md:flex-none py-3"
          >
            Configurações
          </button>
        </div>
      </div>

      {/* Modal: Atletas por faixa etária */}
      {ageModalRange && (() => {
        const athletes = ageAthleteMap[ageModalRange] ?? []
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAgeModalRange(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{ageModalRange} anos</h3>
                  <p className="text-sm text-gray-500">{athletes.length} atleta{athletes.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setAgeModalRange(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={24} />
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-1">
                {athletes.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${a.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                        {a.gender === 'M' ? 'M' : 'F'}
                      </span>
                      <span className="text-sm font-medium text-gray-800 truncate">{a.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-500">
                      <span>{a.age} anos</span>
                      <span className="hidden sm:inline truncate max-w-[120px]">{a.city}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Modal: Todas as cidades */}
      {citiesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCitiesModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Todas as cidades</h3>
              <button onClick={() => setCitiesModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {allCities.map((item, index) => (
                <div key={item.city} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 truncate">{item.city}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0 ml-2">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Todos os países */}
      {countriesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCountriesModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Todos os países</h3>
              <button onClick={() => setCountriesModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {allCountries.map((item, index) => (
                <div key={item.country} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 truncate">{item.country}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0 ml-2">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 space-y-2 pb-[env(safe-area-inset-bottom)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
              }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
