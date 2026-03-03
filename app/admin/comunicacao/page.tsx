'use client'

import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import {
    MessageSquare,
    Mail,
    Send,
    Loader2,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    ExternalLink,
    Copy
} from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'
import { Button, Input, Badge, Card } from '@/components/ui'

interface Registration {
    id: string
    status: string
    athlete: {
        full_name: string
        email: string
        phone: string | null
    }
}

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendente',
    pending_payment: 'Pagamento Pendente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
}

export default function ComunicacaoPage() {
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [registrations, setRegistrations] = useState<Registration[]>([])

    // Filters & Selection
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Message Content
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [channel, setChannel] = useState<'email' | 'whatsapp'>('whatsapp')

    useEffect(() => {
        loadRecipients()
    }, [])

    async function loadRecipients() {
        try {
            setLoading(true)
            const supabase = createClient()
            const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()

            if (!event) return

            const { data, error } = await supabase
                .from('registrations')
                .select('id, status, athlete:athletes(full_name, email, phone)')
                .eq('event_id', event.id)

            if (error) throw error
            setRegistrations(data as any[] || [])
        } catch (err: any) {
            toast.error('Erro ao carregar atletas')
        } finally {
            setLoading(false)
        }
    }

    const filteredRegistrations = useMemo(() => {
        return registrations.filter(r => statusFilter === 'all' || r.status === statusFilter)
    }, [registrations, statusFilter])

    const selectedAthletes = useMemo(() => {
        return registrations.filter(r => selectedIds.has(r.id))
    }, [registrations, selectedIds])

    function toggleSelectAll() {
        if (selectedIds.size === filteredRegistrations.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredRegistrations.map(r => r.id)))
        }
    }

    function toggleSelect(id: string) {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    async function handleSendEmail() {
        if (!subject.trim() || !message.trim()) {
            toast.error('Preencha o assunto e a mensagem')
            return
        }

        const recipients = selectedAthletes.map(r => ({
            email: r.athlete.email,
            athlete_name: r.athlete.full_name
        })).filter(r => r.email)

        if (recipients.length === 0) {
            toast.error('Nenhum atleta com e-mail selecionado')
            return
        }

        try {
            setSending(true)
            const res = await fetch('/api/admin/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, body: message, recipients }),
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Erro ao enviar')

            toast.success(`${result.sent} e-mails enviados com sucesso!`)
            setSubject('')
            setMessage('')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSending(false)
        }
    }

    function handleSendWhatsApp() {
        if (!message.trim()) {
            toast.error('Escreva a mensagem primeiro')
            return
        }

        const athletesToMsg = selectedAthletes.filter(r => r.athlete.phone)
        if (athletesToMsg.length === 0) {
            toast.error('Nenhum atleta com celular selecionado')
            return
        }

        if (athletesToMsg.length > 5) {
            toast.info('Abrindo os primeiros 5 WhatsApp Web. Use o botão ao lado de cada nome para os demais.')
        }

        athletesToMsg.slice(0, 5).forEach((r, i) => {
            const phone = r.athlete.phone!.replace(/\D/g, '')
            const text = encodeURIComponent(`Olá ${r.athlete.full_name},\n\n${message}`)
            setTimeout(() => {
                window.open(`https://wa.me/55${phone}?text=${text}`, '_blank')
            }, i * 1000)
        })
    }

    function copyNumbers() {
        const numbers = selectedAthletes
            .map(r => r.athlete.phone?.replace(/\D/g, ''))
            .filter(Boolean)
            .join(', ')

        if (!numbers) {
            toast.error('Nenhum número disponível')
            return
        }

        navigator.clipboard.writeText(numbers)
        toast.success('Números copiados para a área de transferência')
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                        Central de Comunicação 📣
                    </h1>
                    <p className="text-gray-600">
                        Filtre, selecione e envie mensagens personalizadas para seus atletas.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List & Selection */}
                    <Card className="lg:col-span-1 p-6 flex flex-col h-[700px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Seleção de Atletas</h2>
                            <Badge variant="neutral">{filteredRegistrations.length}</Badge>
                        </div>

                        <div className="mb-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="admin-input w-full text-sm"
                            >
                                <option value="all">Todos os Status</option>
                                {Object.entries(STATUS_LABELS).map(([key, val]) => (
                                    <option key={key} value={key}>{val}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <Button
                                variant="secondary"
                                className="flex-1 text-xs py-1"
                                onClick={toggleSelectAll}
                            >
                                {selectedIds.size === filteredRegistrations.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin text-primary-600" />
                                </div>
                            ) : filteredRegistrations.length === 0 ? (
                                <p className="text-center text-gray-500 text-sm py-8">Nenhum atleta encontrado.</p>
                            ) : (
                                filteredRegistrations.map(reg => (
                                    <div
                                        key={reg.id}
                                        onClick={() => toggleSelect(reg.id)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${selectedIds.has(reg.id)
                                                ? 'bg-primary-50 border-primary-200 shadow-sm'
                                                : 'hover:bg-gray-50 border-gray-100'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${selectedIds.has(reg.id) ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'
                                            }`}>
                                            {selectedIds.has(reg.id) && <CheckCircle2 size={14} className="text-white" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{reg.athlete.full_name}</p>
                                            <p className="text-xs text-gray-500 truncate">{reg.athlete.phone || reg.athlete.email}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Composer */}
                    <Card className="lg:col-span-2 p-6 flex flex-col h-[700px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Compor Mensagem</h2>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setChannel('whatsapp')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${channel === 'whatsapp' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
                                        }`}
                                >
                                    <MessageSquare size={16} /> WhatsApp
                                </button>
                                <button
                                    onClick={() => setChannel('email')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${channel === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                                        }`}
                                >
                                    <Mail size={16} /> E-mail
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                                    <Users size={16} className="text-primary-600" />
                                    Destinatários selecionados: <span className="text-primary-600 font-bold">{selectedIds.size}</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    {channel === 'whatsapp'
                                        ? 'As mensagens serão abertas individualmente para garantir a entrega.'
                                        : 'Os e-mails serão enviados em lote de forma automática.'}
                                </p>
                            </div>

                            {channel === 'email' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Assunto do E-mail</label>
                                    <Input
                                        placeholder="Ex: Lembrete Importante - Corrida de Macuco"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex-1 flex flex-col">
                                <label className="block text-sm font-bold text-gray-900 mb-2">Mensagem</label>
                                <textarea
                                    className="admin-input flex-1 w-full min-h-[300px] resize-none py-4"
                                    placeholder={channel === 'whatsapp'
                                        ? "Olá [Nome], sua inscrição no evento..."
                                        : "Prezado(a) [Nome],\n\nGostaríamos de informar que..."}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <p className="mt-2 text-xs text-amber-600 flex items-center gap-1 font-medium">
                                    <AlertCircle size={14} /> Dica: Comece a mensagem com um tom amigável.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t mt-6 flex flex-wrap gap-3">
                            {channel === 'whatsapp' ? (
                                <>
                                    <Button
                                        variant="primary"
                                        className="bg-emerald-600 hover:bg-emerald-700 flex-1 py-4"
                                        leftIcon={<MessageSquare size={20} />}
                                        onClick={handleSendWhatsApp}
                                        disabled={selectedIds.size === 0}
                                    >
                                        Abrir WhatsApp Web
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        leftIcon={<Copy size={18} />}
                                        onClick={copyNumbers}
                                        disabled={selectedIds.size === 0}
                                    >
                                        Copiar Números
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="primary"
                                    className="bg-blue-600 hover:bg-blue-700 w-full py-4 text-lg"
                                    leftIcon={sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    onClick={handleSendEmail}
                                    disabled={sending || selectedIds.size === 0}
                                >
                                    {sending ? 'Enviando Mensagens...' : 'Enviar Comunicados agora'}
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
