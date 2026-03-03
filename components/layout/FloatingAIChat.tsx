'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Bot, Loader2, RefreshCcw, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

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

const MAX_MESSAGES_PER_SESSION = 10

export default function FloatingAIChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [history, setHistory] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [messageCount, setMessageCount] = useState(0)
    
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll para o fim das mensagens
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [history, loading])

    async function handleSendMessage(text: string = message) {
        const trimmedText = text.trim()
        if (!trimmedText || loading) return

        if (messageCount >= MAX_MESSAGES_PER_SESSION) {
            toast.error('Limite de mensagens da sessão atingido. Recarregue para continuar.')
            return
        }

        const userMsg: Message = { role: 'user', content: trimmedText }
        setMessage('')
        setHistory(prev => [...prev, userMsg])
        setLoading(true)
        setMessageCount(prev => prev + 1)

        // Adicionar placeholder para o assistente
        setHistory(prev => [...prev, { role: 'assistant', content: '' }])

        try {
            const res = await fetch('/api/admin/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmedText,
                    history: history.slice(-4), // Enviar apenas as últimas 4 mensagens para economizar tokens
                    // Nota: O backend já busca o regulamento e contexto automaticamente
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erro ao processar resposta')
            }

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
            console.error('Erro no chat:', err)
            const errorMsg = err.message || 'Ocorreu um erro ao falar com a IA'
            setHistory(prev => {
                const newHistory = [...prev]
                if (newHistory.length > 0) {
                    newHistory[newHistory.length - 1] = {
                        role: 'assistant',
                        content: `Ops! Tive um probleminha: ${errorMsg}. Tente novamente em alguns segundos.`
                    }
                }
                return newHistory
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary-600 text-white flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-bold leading-tight">Assistente Virtual</p>
                                    <p className="text-[10px] text-primary-100 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        Online agora
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth"
                        >
                            {history.length === 0 && (
                                <div className="text-center py-8 space-y-4">
                                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
                                        <Bot size={32} className="text-primary-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-bold text-gray-800">Olá! Como posso ajudar?</p>
                                        <p className="text-xs text-gray-500 px-8">
                                            Sou o assistente oficial da 51ª Corrida de Macuco. Tire suas dúvidas sobre o regulamento, percurso ou inscrições.
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                                        {QUICK_QUESTIONS.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSendMessage(q)}
                                                className="text-[11px] bg-white border border-gray-200 hover:border-primary-300 hover:text-primary-600 px-3 py-1.5 rounded-full transition-all shadow-sm active:scale-95"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {history.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-primary-600 text-white rounded-tr-none'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {msg.content.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, index) => {
                                                const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                                                if (match) {
                                                    return (
                                                        <a
                                                            key={index}
                                                            href={match[2]}
                                                            className="text-primary-600 underline font-bold hover:text-primary-700 inline-flex items-center gap-0.5"
                                                            target={match[2].startsWith('http') ? '_blank' : '_self'}
                                                            rel="noopener noreferrer"
                                                        >
                                                            {match[1]}
                                                            <ExternalLink size={10} />
                                                        </a>
                                                    );
                                                }
                                                return part;
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

                        {/* Input Area */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                                <input
                                    type="text"
                                    placeholder={messageCount >= MAX_MESSAGES_PER_SESSION ? "Limite atingido..." : "Digite sua dúvida..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 disabled:opacity-50"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={loading || messageCount >= MAX_MESSAGES_PER_SESSION}
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!message.trim() || loading || messageCount >= MAX_MESSAGES_PER_SESSION}
                                    className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg disabled:opacity-30 transition-all"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-2 px-1">
                                <p className="text-[9px] text-gray-400">
                                    {messageCount}/{MAX_MESSAGES_PER_SESSION} mensagens nesta sessão
                                </p>
                                <button 
                                    onClick={() => {
                                        setHistory([])
                                        setMessageCount(0)
                                    }}
                                    className="text-[9px] text-gray-400 hover:text-primary-600 flex items-center gap-1 transition-colors"
                                >
                                    <RefreshCcw size={10} /> Limpar conversa
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
                    isOpen ? 'bg-white text-gray-600' : 'bg-primary-600 text-white'
                }`}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                    >
                        1
                    </motion.div>
                )}
            </motion.button>
        </div>
    )
}
