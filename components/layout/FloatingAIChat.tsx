'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Bot, Loader2, RefreshCcw, ExternalLink, User, Fingerprint } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/browserClient'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

const QUICK_QUESTIONS = [
    "Onde retiro meu kit?",
    "Qual o horário da largada?",
    "Como me inscrever?",
    "Verificar minha inscrição"
]

const MAX_MESSAGES_PER_SESSION = 15

export default function FloatingAIChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [message, setMessage] = useState('')
    const [history, setHistory] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    
    // Auth & Identification State
    const [step, setStep] = useState<'identify' | 'name' | 'chat'>('identify')
    const [userCpf, setUserCpf] = useState('')
    const [userName, setUserName] = useState('')
    const [messageCount, setMessageCount] = useState(0)
    const [identifying, setIdentifying] = useState(false)
    
    const [isAdmin, setIsAdmin] = useState(false)
    
    const scrollRef = useRef<HTMLDivElement>(null)

    // Carregar identificação salva
    useEffect(() => {
        const savedCpf = localStorage.getItem('chat_user_cpf')
        const savedName = localStorage.getItem('chat_user_name')
        const interacted = localStorage.getItem('chat_has_interacted') === 'true'
        
        if (interacted) setHasInteracted(true)

        if (savedCpf && savedName) {
            setUserCpf(savedCpf)
            setUserName(savedName)
            setStep('chat')
            // Verificar se é admin (Michell)
            if (savedCpf === '13017905756') {
                setIsAdmin(true)
            }
        }
    }, [])

    const toggleChat = () => {
        setIsOpen(!isOpen)
        if (!hasInteracted) {
            setHasInteracted(true)
            localStorage.setItem('chat_has_interacted', 'true')
        }
    }

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [history, loading, step])

    async function handleIdentify() {
        const cleanCpf = userCpf.replace(/\D/g, '')
        if (cleanCpf.length < 11) {
            toast.error('Informe um CPF válido')
            return
        }

        setIdentifying(true)
        try {
            const supabase = createClient()
            
            // 1. Buscar na base de atletas (usando o CPF limpo)
            const { data: athlete, error: athleteErr } = await supabase
                .from('athletes')
                .select('full_name')
                .eq('document_number', cleanCpf)
                .maybeSingle()

            console.log('DEBUG IDENTIFY:', { cleanCpf, athlete, athleteErr })

            if (athlete) {
                setUserName(athlete.full_name)
                localStorage.setItem('chat_user_cpf', cleanCpf)
                localStorage.setItem('chat_user_name', athlete.full_name)
                
                if (cleanCpf === '13017905756') {
                    setIsAdmin(true)
                }

                setStep('chat')
                toast.success(`Bem-vindo de volta, ${athlete.full_name.split(' ')[0]}!`)
            } else {
                // 2. Buscar na base de uso da IA (se já passou por aqui anteriormente)
                const { data: usage } = await supabase
                    .from('ai_usage')
                    .select('full_name')
                    .eq('cpf', cleanCpf)
                    .maybeSingle()

                if (usage && usage.full_name && usage.full_name !== 'Visitante') {
                    setUserName(usage.full_name)
                    localStorage.setItem('chat_user_cpf', cleanCpf)
                    localStorage.setItem('chat_user_name', usage.full_name)
                    setStep('chat')
                    toast.success(`Olá novamente, ${usage.full_name.split(' ')[0]}!`)
                } else {
                    setStep('name')
                }
            }
        } catch (err) {
            console.error('Erro na identificação:', err)
            toast.error('Erro ao verificar identificação. Tente novamente.')
        } finally {
            setIdentifying(false)
        }
    }

    async function handleSaveName() {
        if (userName.trim().length < 3) {
            toast.error('Informe seu nome completo')
            return
        }
        const cleanCpf = userCpf.replace(/\D/g, '')
        localStorage.setItem('chat_user_cpf', cleanCpf)
        localStorage.setItem('chat_user_name', userName.trim())
        setStep('chat')
        toast.success(`Prazer em te conhecer, ${userName.split(' ')[0]}!`)
    }

    async function handleSendMessage(text: string = message) {
        const trimmedText = text.trim()
        if (!trimmedText || loading) return

        const userMsg: Message = { role: 'user', content: trimmedText }
        setMessage('')
        setHistory(prev => [...prev, userMsg])
        setLoading(true)

        // Adicionar placeholder
        setHistory(prev => [...prev, { role: 'assistant', content: '' }])

        try {
            const res = await fetch('/api/admin/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmedText,
                    history: history.slice(-6),
                    userCpf: userCpf.replace(/\D/g, ''),
                    userName: userName
                })
            })

            if (res.status === 429) {
                const data = await res.json()
                throw new Error(data.error)
            }

            if (!res.ok) throw new Error('Erro ao processar resposta')

            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            let accumulatedText = ''

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value, { stream: true })
                    accumulatedText += chunk
                    setHistory(prev => {
                        const newHistory = [...prev]
                        if (newHistory.length > 0) {
                            newHistory[newHistory.length - 1] = { role: 'assistant', content: accumulatedText }
                        }
                        return newHistory
                    })
                }
                setMessageCount(prev => prev + 1)
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Ocorreu um erro'
            setHistory(prev => {
                const newHistory = [...prev]
                if (newHistory.length > 0) {
                    newHistory[newHistory.length - 1] = { role: 'assistant', content: `⚠️ ${errorMsg}` }
                }
                return newHistory
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary-600 text-white flex items-center justify-between shadow-md shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold leading-tight">Assistente Virtual</p>
                                    <p className="text-[10px] text-primary-100 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        {step === 'chat' ? `Olá, ${userName.split(' ')[0]}` : 'Identificação necessária'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={toggleChat} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50/50 scroll-smooth">
                            {step === 'identify' && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-4">
                                    <Fingerprint size={48} className="text-primary-500" />
                                    <div className="space-y-2">
                                        <p className="font-bold text-gray-800">Identificação</p>
                                        <p className="text-xs text-gray-500">Informe seu CPF para um atendimento personalizado e seguro.</p>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        className="admin-input w-full text-center"
                                        value={userCpf}
                                        onChange={(e) => setUserCpf(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleIdentify()}
                                    />
                                    <Button onClick={handleIdentify} disabled={identifying} className="w-full">
                                        {identifying ? <Loader2 className="animate-spin" /> : 'Continuar'}
                                    </Button>
                                </div>
                            )}

                            {step === 'name' && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-4">
                                    <User size={48} className="text-primary-500" />
                                    <div className="space-y-2">
                                        <p className="font-bold text-gray-800">Quase lá!</p>
                                        <p className="text-xs text-gray-500">Ainda não te encontramos. Qual o seu nome completo?</p>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Seu nome completo"
                                        className="admin-input w-full text-center"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                    />
                                    <Button onClick={handleSaveName} className="w-full">Começar Chat</Button>
                                    <button onClick={() => setStep('identify')} className="text-xs text-gray-400 hover:underline">Voltar</button>
                                </div>
                            )}

                            {step === 'chat' && (
                                <div className="space-y-4">
                                    {history.length === 0 && (
                                        <div className="text-center py-4 space-y-4">
                                            <Bot size={32} className="text-primary-600 mx-auto" />
                                            <p className="text-xs text-gray-500 px-4">
                                                Olá <strong>{userName.split(' ')[0]}</strong>! Como posso te ajudar com a 51ª Corrida de Macuco hoje?
                                            </p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {QUICK_QUESTIONS.map((q, i) => (
                                                    <button key={i} onClick={() => handleSendMessage(q)} className="text-[11px] bg-white border border-gray-200 hover:border-primary-300 hover:text-primary-600 px-3 py-1.5 rounded-full transition-all shadow-sm">
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {history.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                                                <div className="whitespace-pre-wrap leading-relaxed">
                                                    {msg.content.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
                                                        const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                                                        if (match) return <a key={index} href={match[2]} className="text-primary-600 underline font-bold hover:text-primary-700 inline-flex items-center gap-0.5" target={match[2].startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">{match[1]}<ExternalLink size={10} /></a>;
                                                        
                                                        // Tratar negrito simples **texto** ou *texto*
                                                        return part.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((subPart, subIndex) => {
                                                            if (subPart.startsWith('**') && subPart.endsWith('**')) {
                                                                return <strong key={`${index}-${subIndex}`} className="font-bold text-gray-900">{subPart.slice(2, -2)}</strong>;
                                                            }
                                                            if (subPart.startsWith('*') && subPart.endsWith('*')) {
                                                                return <strong key={`${index}-${subIndex}`} className="font-bold text-gray-900">{subPart.slice(1, -1)}</strong>;
                                                            }
                                                            return subPart;
                                                        });
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {loading && history[history.length-1]?.content === '' && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        {step === 'chat' && (
                            <div className="p-4 border-t bg-white shrink-0">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1 focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:bg-white transition-all border border-transparent focus-within:border-primary-200">
                                    <input
                                        type="text"
                                        placeholder="Digite sua dúvida..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm py-2 disabled:opacity-50"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={loading}
                                    />
                                    <button onClick={() => handleSendMessage()} disabled={!message.trim() || loading} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-30 transition-all">
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2 px-1">
                                    <p className="text-[9px] text-gray-400">
                                        {isAdmin ? 'Acesso Administrador (Ilimitado)' : 'Limite diário: 15 mensagens'}
                                    </p>
                                    <button onClick={() => { localStorage.removeItem('chat_user_cpf'); localStorage.removeItem('chat_user_name'); setStep('identify'); setHistory([]); setIsAdmin(false); }} className="text-[9px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                                        Sair / Trocar CPF
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleChat}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all relative ${isOpen ? 'bg-white text-gray-600' : 'bg-primary-600 text-white'}`}
            >
                {/* Efeito de Pulso (Glow) */}
                {!isOpen && !hasInteracted && (
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-primary-400 rounded-full -z-10"
                    />
                )}

                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                
                {/* Selo de Notificação */}
                {!isOpen && !hasInteracted && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                    >
                        1
                    </motion.div>
                )}
            </motion.button>
        </div>
    )
}
