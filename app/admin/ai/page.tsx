'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import {
    Bot,
    Settings,
    MessageSquare,
    Save,
    Loader2,
    Sparkles,
    FileText,
    AlertCircle,
    RefreshCcw,
    Send
} from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'
import { Button, Card, Badge } from '@/components/ui'

interface AIConfig {
    id: string
    system_prompt: string
    regulation_text: string
    updated_at: string
}

export default function AIPanelPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState<AIConfig | null>(null)

    // Tabs
    const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('settings')

    // Settings State
    const [systemPrompt, setSystemPrompt] = useState('')
    const [regulationText, setRegulationText] = useState('')

    // Chat State
    const [chatMessage, setChatMessage] = useState('')
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
    const [chatLoading, setChatLoading] = useState(false)

    useEffect(() => {
        loadConfig()
    }, [])

    async function loadConfig() {
        try {
            setLoading(true)
            const supabase = createClient()

            const { data: event } = await supabase
                .from('events')
                .select('id')
                .eq('year', 2026)
                .single()

            if (!event) return

            const { data, error } = await supabase
                .from('ai_config')
                .select('*')
                .eq('event_id', event.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data) {
                setConfig(data)
                setSystemPrompt(data.system_prompt)
                setRegulationText(data.regulation_text)
            }
        } catch (err: any) {
            console.error('Erro ao carregar configuração da IA:', err)
            toast.error('Erro ao carregar configurações')
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveSettings() {
        try {
            setSaving(true)
            const supabase = createClient()

            const { data: event } = await supabase
                .from('events')
                .select('id')
                .eq('year', 2026)
                .single()

            if (!event) return

            const { data, error } = await supabase
                .from('ai_config')
                .upsert({
                    event_id: event.id,
                    system_prompt: systemPrompt,
                    regulation_text: regulationText,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error

            setConfig(data)
            toast.success('Configurações salvas com sucesso!')
        } catch (err: any) {
            toast.error('Erro ao salvar configurações')
        } finally {
            setSaving(false)
        }
    }

    async function handleSendMessage() {
        if (!chatMessage.trim() || chatLoading) return

        const newMessage = chatMessage
        setChatMessage('')
        setChatHistory(prev => [...prev, { role: 'user', content: newMessage }])
        setChatLoading(true)

        // Adicionar mensagem vazia para o assistente que será preenchida via stream
        setChatHistory(prev => [...prev, { role: 'assistant', content: '' }])

        try {
            const res = await fetch('/api/admin/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: newMessage,
                    history: chatHistory,
                    regulationText: config?.regulation_text,
                    systemPrompt: config?.system_prompt
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erro no chat')
            }

            // Ler o stream
            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            let accumulatedText = ''

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    accumulatedText += chunk

                    // Atualizar a última mensagem no histórico
                    setChatHistory(prev => {
                        const newHistory = [...prev]
                        if (newHistory.length > 0) {
                            newHistory[newHistory.length - 1] = {
                                role: 'assistant',
                                content: accumulatedText
                            }
                        }
                        return newHistory
                    })
                }
            }
        } catch (err: any) {
            const msg = err.message || 'Ocorreu um erro ao falar com a IA'
            toast.error(msg)
            setChatHistory(prev => {
                const newHistory = [...prev]
                if (newHistory.length > 0) {
                    newHistory[newHistory.length - 1] = {
                        role: 'assistant',
                        content: `Erro: ${msg}`
                    }
                }
                return newHistory
            })
        } finally {
            setChatLoading(false)
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                            Painel de IA (Gemini) ✨
                        </h1>
                        <p className="text-gray-600">
                            Gerencie a inteligência que atende os atletas.
                        </p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            <Settings size={18} /> Configurações
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            <MessageSquare size={18} /> Chat de Teste
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {activeTab === 'settings' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2 p-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Sparkles className="text-primary-500" size={20} />
                                            Instruções de Sistema
                                        </h3>
                                        <div className="text-sm text-gray-500 mb-2">
                                            Defina como a IA deve se comportar e qual sua personalidade.
                                        </div>
                                        <textarea
                                            className="admin-input w-full min-h-[120px] resize-none"
                                            placeholder="Ex: Você é o assistente oficial da Corrida de Macuco..."
                                            value={systemPrompt}
                                            onChange={(e) => setSystemPrompt(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FileText className="text-primary-500" size={20} />
                                            Conteúdo Base (Regulamento)
                                        </h3>
                                        <div className="text-sm text-gray-500 mb-2">
                                            Cole aqui todo o texto do regulamento e informações do percurso.
                                        </div>
                                        <textarea
                                            className="admin-input w-full min-h-[300px] resize-none"
                                            placeholder="Cole o regulamento completo aqui..."
                                            value={regulationText}
                                            onChange={(e) => setRegulationText(e.target.value)}
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            variant="primary"
                                            onClick={handleSaveSettings}
                                            disabled={saving}
                                            className="px-8"
                                            leftIcon={saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        >
                                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                                        </Button>
                                    </div>
                                </Card>

                                <div className="space-y-6">
                                    <Card className="p-6 bg-gradient-to-br from-primary-50 to-white border-primary-100">
                                        <h4 className="font-bold text-primary-900 mb-2 flex items-center gap-2">
                                            <Bot size={18} /> Como funciona?
                                        </h4>
                                        <div className="text-sm text-primary-800 leading-relaxed">
                                            A IA utiliza o modelo <strong>Gemini 2.0 Flash</strong> para processar as informações fornecidas e responder os atletas em tempo real.
                                        </div>
                                        <ul className="mt-4 space-y-2 text-xs text-primary-700">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                                Suporte a perguntas complexas
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                                Memória de percurso e datas
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                                Capacidade de análise de regulamento
                                            </li>
                                        </ul>
                                    </Card>

                                    <Card className="p-6">
                                        <h4 className="font-bold text-gray-900 mb-4">Status da Integração</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Modelo</span>
                                                <Badge variant="info">Gemini 2.0 Flash</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Base de Dados</span>
                                                <span className="text-sm font-medium">{regulationText.length > 0 ? `${regulationText.length} caracteres` : 'Vazia'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Última Atualização</span>
                                                <span className="text-xs text-gray-400">
                                                    {config?.updated_at ? new Date(config.updated_at).toLocaleString() : 'Nunca'}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <Card className="p-0 overflow-hidden h-[700px] flex flex-col">
                                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <Bot size={24} className="text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Assistente IA de Teste</p>
                                            <div className="text-xs text-emerald-600 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online e pronto
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setChatHistory([])}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                        title="Limpar chat"
                                    >
                                        <RefreshCcw size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                                    {chatHistory.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                            <Bot size={64} className="text-gray-300" />
                                            <div>
                                                <p className="font-medium text-gray-900">Inicie um teste agora</p>
                                                <p className="text-sm text-gray-500 max-w-xs">Simule perguntas de atletas para ver como a IA responde com base no seu regulamento.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        chatHistory.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                                    : 'bg-white border text-gray-800 rounded-tl-none'
                                                    }`}>
                                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                                        {msg.content.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
                                                            const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                                                            if (match) {
                                                                return (
                                                                    <a
                                                                        key={index}
                                                                        href={match[2]}
                                                                        className="text-primary-600 underline font-bold hover:text-primary-700"
                                                                        target={match[2].startsWith('http') ? '_blank' : '_self'}
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {match[1]}
                                                                    </a>
                                                                );
                                                            }
                                                            return part;
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {chatLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t bg-white">
                                    <div className="flex gap-4">
                                        <input
                                            className="admin-input flex-1 border-none focus:ring-0 text-sm"
                                            placeholder="Digite sua dúvida sobre o evento..."
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        />
                                        <Button
                                            variant="primary"
                                            className=" rounded-xl"
                                            onClick={handleSendMessage}
                                            disabled={chatLoading || !chatMessage.trim()}
                                        >
                                            <Send size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-amber-800">
                        <strong>Atenção:</strong> Lembre-se que a IA pode ter alucinações. Revise sempre o conteúdo do regulamento. Cada interação consome tokens da API Gemini.
                    </p>
                </div>
            </div>
        </AdminLayout>
    )
}

function CheckCircle2({ size, className }: { size: number, className: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
