'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  Users,
  MapPin,
  Calendar,
  PieChart,
  Loader2,
  FileText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'

const AGE_RANGES = [
  { key: '15-19', min: 15, max: 19 },
  { key: '20-29', min: 20, max: 29 },
  { key: '30-39', min: 30, max: 39 },
  { key: '40-49', min: 40, max: 49 },
  { key: '50-59', min: 50, max: 59 },
  { key: '60+', min: 60, max: 150 },
]

interface RegistrationWithAthlete {
  id: string
  payment_status: string
  payment_amount: number
  athlete: { birth_date: string; gender: string | null; city: string | null }
}


function getAge(birthDate: string, cutoffDate: string): number {
  const birth = new Date(birthDate)
  const cutoff = new Date(cutoffDate)
  return cutoff.getFullYear() - birth.getFullYear()
}

function getAgeRange(age: number): string {
  return AGE_RANGES.find((r) => age >= r.min && age <= r.max)?.key ?? '60+'
}

export default function OrgAdminDashboard() {
  const [total, setTotal] = useState(0)
  const [citiesCount, setCitiesCount] = useState(0)
  const [daysToEvent, setDaysToEvent] = useState<number | null>(null)
  const [ageDistribution, setAgeDistribution] = useState<
    { range: string; male: number; female: number }[]
  >([])
  const [topCities, setTopCities] = useState<{ city: string; count: number }[]>([])
  const [paymentStats, setPaymentStats] = useState({
    paid: 0,
    pending: 0,
    free: 0,
    totalAmount: 0,
  })
  const [docStats, setDocStats] = useState({ approved: 0, pending: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data: event } = await supabase
        .from('events')
        .select('id, race_date, age_cutoff_date')
        .eq('year', 2026)
        .single()

      if (!event) {
        setTotal(0)
        setCitiesCount(0)
        setDaysToEvent(null)
        setAgeDistribution([])
        setTopCities([])
        setPaymentStats({ paid: 0, pending: 0, free: 0, totalAmount: 0 })
        setDocStats({ approved: 0, pending: 0, rejected: 0 })
        return
      }

      const cutoffDate = event.age_cutoff_date ?? event.race_date ?? new Date().toISOString().slice(0, 10)
      if (event.race_date) {
        const today = new Date()
        const race = new Date(event.race_date)
        setDaysToEvent(Math.max(0, Math.ceil((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))))
      } else {
        setDaysToEvent(null)
      }

      const { data: regs } = await supabase
        .from('registrations')
        .select(`
          id,
          payment_status,
          payment_amount,
          athlete:athletes(birth_date, gender, city)
        `)
        .eq('event_id', event.id)

      const list = (regs || []) as unknown as RegistrationWithAthlete[]
      setTotal(list.length)

      const cities = new Set(list.map((r) => (r.athlete?.city ?? 'Não informado').trim() || 'Não informado'))
      setCitiesCount(cities.size)

      const byCity = list.reduce<Record<string, number>>((acc, r) => {
        const city = (r.athlete?.city ?? 'Não informado').trim() || 'Não informado'
        acc[city] = (acc[city] || 0) + 1
        return acc
      }, {})
      const top = Object.entries(byCity)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([city, count]) => ({ city, count }))
      setTopCities(top)

      const ageByRange: Record<string, { male: number; female: number }> = {}
      AGE_RANGES.forEach((r) => {
        ageByRange[r.key] = { male: 0, female: 0 }
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
      })
      setAgeDistribution(
        AGE_RANGES.map((r) => ({
          range: r.key,
          male: ageByRange[r.key].male,
          female: ageByRange[r.key].female,
        }))
      )

      const paid = list.filter((r) => r.payment_status === 'paid').length
      const pending = list.filter((r) => ['pending', 'processing'].includes(r.payment_status ?? '')).length
      const free = list.filter((r) => r.payment_status === 'free' || !r.payment_status).length
      const totalAmount = list
        .filter((r) => r.payment_status === 'paid')
        .reduce((sum, r) => sum + (Number(r.payment_amount) || 0), 0)
      setPaymentStats({ paid, pending, free, totalAmount })

      const regIds = list.map((r) => r.id)
      if (regIds.length > 0) {
        const { data: docs } = await supabase
          .from('documents')
          .select('status')
          .in('registration_id', regIds)
        const docList = (docs || []) as { status: string }[]
        const approved = docList.filter((d) => d.status === 'approved').length
        const pendingDoc = docList.filter((d) => d.status === 'pending').length
        const rejected = docList.filter((d) => d.status === 'rejected').length
        setDocStats({ approved, pending: pendingDoc, rejected })
      } else {
        setDocStats({ approved: 0, pending: 0, rejected: 0 })
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      setTotal(0)
      setCitiesCount(0)
      setDaysToEvent(null)
      setAgeDistribution([])
      setTopCities([])
      setPaymentStats({ paid: 0, pending: 0, free: 0, totalAmount: 0 })
      setDocStats({ approved: 0, pending: 0, rejected: 0 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-display font-bold mb-2">Dashboard Organizacional 📊</h2>
          <p className="text-green-100 text-lg">
            Acompanhe métricas e relatórios em tempo real. Acesso somente leitura.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="admin-card">
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="animate-spin text-green-600" size={28} />
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="text-green-600" size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{total.toLocaleString('pt-BR')}</p>
                <p className="text-sm text-gray-600">Total de Inscrições</p>
              </div>
              <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="text-green-600" size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{citiesCount}</p>
                <p className="text-sm text-gray-600">Cidades Representadas</p>
              </div>
              <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-green-600" size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {daysToEvent != null ? daysToEvent : '—'}
                </p>
                <p className="text-sm text-gray-600">Dias para o Evento</p>
              </div>
              <div className="admin-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="text-green-600" size={24} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {total > 0 ? `${((paymentStats.paid / total) * 100).toFixed(1)}%` : '0%'}
                </p>
                <p className="text-sm text-gray-600">Pagamentos Confirmados</p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Distribution */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Distribuição por Idade e Sexo</h3>
              <PieChart size={20} className="text-gray-400" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="animate-spin text-green-600" size={24} />
              </div>
            ) : (
              <div className="space-y-3">
                {ageDistribution.map((item) => {
                  const total = item.male + item.female
                  return (
                    <div key={item.range}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.range} anos</span>
                        <span className="text-sm text-gray-600">
                          M: {item.male} / F: {item.female}
                        </span>
                      </div>
                      <div className="flex gap-1 h-2">
                        {total > 0 ? (
                          <>
                            <div
                              className="bg-blue-500 rounded-l"
                              style={{ width: `${(item.male / total) * 100}%` }}
                            />
                            <div
                              className="bg-pink-500 rounded-r"
                              style={{ width: `${(item.female / total) * 100}%` }}
                            />
                          </>
                        ) : (
                          <div className="w-full bg-gray-200 rounded h-2" />
                        )}
                      </div>
                    </div>
                  )
                })}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-xs text-gray-600">Masculino</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-pink-500 rounded"></div>
                    <span className="text-xs text-gray-600">Feminino</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Cities */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Principais Cidades</h3>
              <MapPin size={20} className="text-gray-400" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="animate-spin text-green-600" size={24} />
              </div>
            ) : topCities.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma inscrição ainda.</p>
            ) : (
              <div className="space-y-4">
                {topCities.map((item, index) => (
                  <div key={item.city}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{item.city}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div className="admin-card">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Status de Pagamento</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-green-600" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <p className="text-3xl font-bold text-green-600 mb-2">{paymentStats.paid}</p>
                <p className="text-sm text-gray-600">Confirmados</p>
                <p className="text-xs text-green-600 font-semibold mt-1">
                  {total > 0 ? `${((paymentStats.paid / total) * 100).toFixed(0)}%` : '0%'}
                </p>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-3xl font-bold text-yellow-600 mb-2">{paymentStats.pending}</p>
                <p className="text-sm text-gray-600">Aguardando</p>
                <p className="text-xs text-yellow-600 font-semibold mt-1">
                  {total > 0 ? `${((paymentStats.pending / total) * 100).toFixed(0)}%` : '0%'}
                </p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-3xl font-bold text-blue-600 mb-2">{paymentStats.free}</p>
                <p className="text-sm text-gray-600">Gratuitos</p>
                <p className="text-xs text-blue-600 font-semibold mt-1">
                  {total > 0 ? `${((paymentStats.free / total) * 100).toFixed(0)}%` : '0%'}
                </p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-3xl font-bold text-purple-600 mb-2">
                  R$ {paymentStats.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-600">Total Arrecadado</p>
                <p className="text-xs text-purple-600 font-semibold mt-1">
                  {paymentStats.paid} × R$ {(paymentStats.totalAmount / (paymentStats.paid || 1)).toFixed(0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Documents Status */}
        <div className="admin-card">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Status de Documentação</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-green-600" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-green-600">{docStats.approved}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Aprovados</p>
                  <p className="text-xs text-gray-600">Documentos revisados</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-yellow-600">{docStats.pending}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Em Análise</p>
                  <p className="text-xs text-gray-600">Aguardando revisão</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-red-600">{docStats.rejected}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Rejeitados</p>
                  <p className="text-xs text-gray-600">Documentos recusados</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Reports */}
        <div className="admin-card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Relatórios Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Resumo Executivo', desc: 'Visão geral completa das inscrições', href: '/admin/org/reports' },
              { name: 'Distribuição Demográfica', desc: 'Análise por idade, sexo e cidade', href: '/admin/org/reports' },
              { name: 'Status de Documentação', desc: 'Relatório detalhado de docs', href: '/admin/org/reports' },
              { name: 'Análise de Pagamentos', desc: 'Fluxo financeiro e conversão', href: '/admin/org/reports' },
            ].map((report) => (
              <Link
                key={report.name}
                href={report.href}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors group"
              >
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.desc}</p>
                </div>
                <span className="text-green-600 hover:text-green-700 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <FileText size={16} />
                  Ver →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">ℹ️</span>
            </div>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Acesso Somente Leitura</p>
              <p className="text-sm text-blue-700">
                Este painel fornece visualização de dados e relatórios. Para realizar alterações ou ações administrativas, entre em contato com o administrador do site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
