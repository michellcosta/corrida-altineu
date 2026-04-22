'use client'

import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import {
    TrendingUp,
    DollarSign,
    PieChart,
    Loader2,
    Calendar,
    ArrowUpRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { Card } from '@/components/ui'

const FEE_PER_TRANSACTION = 0.22 // R$ 0,22 por PIX confirmado

interface RegistrationData {
    id: string
    payment_status: string
    payment_amount: number | string
    registered_at: string
}

export default function FinanceiroPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<RegistrationData[]>([])
    const [stats, setStats] = useState({
        totalGross: 0,
        totalFees: 0,
        totalNet: 0,
        paidCount: 0,
        pendingCount: 0,
        withdrawalAmount: 0,
        withdrawalNote: ''
    })

    useEffect(() => {
        loadFinanceData()
    }, [])

    async function loadFinanceData() {
        try {
            setLoading(true)
            const supabase = createClient()

            const { data: event } = await supabase
                .from('events')
                .select('id, withdrawal_amount, withdrawal_note')
                .eq('year', 2026)
                .single()

            if (!event) return

            const { data: regs, error } = await supabase
                .from('registrations')
                .select('id, payment_status, payment_amount, registered_at')
                .eq('event_id', event.id)

            if (error) throw error

            const list = (regs || []) as RegistrationData[]
            setData(list)

            const paid = list.filter(r => r.payment_status === 'paid')
            const pending = list.filter(r => ['pending', 'processing', 'pending_payment'].includes(r.payment_status))

            const gross = paid.reduce((sum, r) => {
                const val = typeof r.payment_amount === 'string' ? parseFloat(r.payment_amount) : Number(r.payment_amount)
                return sum + (Number.isFinite(val) ? val : 0)
            }, 0)

            const fees = paid.length * FEE_PER_TRANSACTION
            const withdrawalAmount = Number((event as { withdrawal_amount?: number | null }).withdrawal_amount ?? 0)
            const withdrawalNote = String((event as { withdrawal_note?: string | null }).withdrawal_note ?? '')
            const net = gross - fees - withdrawalAmount

            setStats({
                totalGross: gross,
                totalFees: fees,
                totalNet: net,
                paidCount: paid.length,
                pendingCount: pending.length,
                withdrawalAmount,
                withdrawalNote
            })
        } catch (error) {
            console.error('Erro ao carregar dados financeiros:', error)
        } finally {
            setLoading(false)
        }
    }

    const chartData = useMemo(() => {
        const paidOnly = data.filter(r => r.payment_status === 'paid')
        const grouped: Record<string, number> = {}

        paidOnly.forEach(r => {
            const date = new Date(r.registered_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            const val = typeof r.payment_amount === 'string' ? parseFloat(r.payment_amount) : Number(r.payment_amount)
            grouped[date] = (grouped[date] || 0) + val
        })

        return Object.entries(grouped)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => {
                const [dayA, monthA] = a.date.split('/')
                const [dayB, monthB] = b.date.split('/')
                return new Date(2026, parseInt(monthA) - 1, parseInt(dayA)).getTime() -
                    new Date(2026, parseInt(monthB) - 1, parseInt(dayB)).getTime()
            })
    }, [data])

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl md:text-3xl font-display font-bold text-gray-900 mb-1 md:mb-2">
                            Painel Financeiro 💰
                        </h1>
                        <p className="text-sm md:text-base text-gray-600">
                            Acompanhamento de faturamento e taxas (Somente PIX)
                        </p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-full text-xs md:text-sm font-semibold border border-emerald-100 flex items-center gap-2 w-fit">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Dados em Tempo Real
                    </div>
                </div>

                {/* Highlight Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 border-l-4 border-l-blue-500 bg-white shadow-sm overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Faturamento Bruto</p>
                            <DollarSign className="text-blue-500 opacity-20 group-hover:opacity-40 transition-opacity" size={48} />
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">
                            R$ {stats.totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="mt-4 flex items-center text-xs text-blue-600 font-semibold bg-blue-50 w-fit px-2 py-1 rounded">
                            <ArrowUpRight size={14} className="mr-1" />
                            {stats.paidCount} pagamentos confirmados
                        </div>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-amber-500 bg-white shadow-sm overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Taxas Estimadas (R$ 0,22/PIX)</p>
                            <PieChart className="text-amber-500 opacity-20 group-hover:opacity-40 transition-opacity" size={48} />
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">
                            R$ {stats.totalFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="mt-4 text-xs text-amber-600 font-medium">
                            Baseado em {stats.paidCount} transações processadas
                        </p>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50 shadow-sm overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-emerald-800 uppercase tracking-wider">Valor Líquido</p>
                            <TrendingUp className="text-emerald-500 opacity-20 group-hover:opacity-40 transition-opacity" size={48} />
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-emerald-700">
                            R$ {stats.totalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="mt-4 text-xs text-emerald-600 font-medium italic">
                            Valor aproximado: bruto - taxas - retirada
                        </p>
                        <p className="mt-2 text-xs text-emerald-700 font-semibold">
                            Retirada aplicada: R$ {stats.withdrawalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {stats.withdrawalNote ? (
                            <p className="mt-1 text-xs text-gray-600">{stats.withdrawalNote}</p>
                        ) : null}
                    </Card>
                </div>

                {/* Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 p-6 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Evolução de Faturamento</h3>
                                <p className="text-sm text-gray-500">Valor diário de inscrições pagas</p>
                            </div>
                            <Calendar className="text-gray-400" size={20} />
                        </div>

                        <div className="h-[280px] md:h-[350px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReBarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            tickFormatter={(val) => `R$ ${val}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f9fafb' }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                padding: '12px'
                                            }}
                                            formatter={(value) => {
                                                const n =
                                                    value == null ? NaN : typeof value === 'number' ? value : Number(value)
                                                const formatted = Number.isFinite(n)
                                                    ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                                                    : '—'
                                                return [`R$ ${formatted}`, 'Faturamento']
                                            }}
                                        />
                                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={40}>
                                            {chartData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#059669' : '#10b981'} />
                                            ))}
                                        </Bar>
                                    </ReBarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                                    <TrendingUp size={48} strokeWidth={1} />
                                    <p>Ainda não há dados de faturamento para exibir</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6 bg-white shadow-sm overflow-hidden">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo de Status</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                    <span className="text-sm font-medium text-gray-700">Pagantes</span>
                                </div>
                                <span className="font-bold text-gray-900">{stats.paidCount}</span>
                            </div>

                            <div className="pt-6 border-t mt-6">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    * Os valores líquidos são estimativos e consideram taxa PIX e retirada configurada no Site Admin.
                                </p>
                                <button
                                    onClick={() => loadFinanceData()}
                                    className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    Atualizar Dados
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
