'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle, User, AlertCircle, Loader2, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'
import Link from 'next/link'

type Message = {
    role: 'user' | 'assistant'
    content: string
}

type Step = 'identify' | 'birthDate' | 'locked' | 'chat'

const QUICK_PROMPTS = [
    "Onde retiro meu kit?",
    "Como acompanho minha inscrição?",
    "Qual o valor da premiação?",
    "Informações sobre percursos",
]

const MAX_FREE_MESSAGES = 15

const MONTHS = [
  { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' }, { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' }, { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' }, { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
]
const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
const YEARS = Array.from({ length: 101 }, (_, i) => {
  const y = new Date().getFullYear() - i
  return { value: String(y), label: String(y) }
})

const MarkdownText = ({ content, onLinkClick }: { content: string, onLinkClick?: () => void }): any => {
    if (!content) return null;

    // Segmenta o texto em tokens de Link, Negrito, Itálico ou Texto comum
    // Ordem de precedência: Link > Negrito > Itálico
    const tokens = content.split(/(\[[\s\S]+?\]\s*\([\s\S]+?\))|(\*\*[\s\S]+?\*\*)|(\*[\s\S]+?\*)/g);

    return tokens.map((part, i) => {
        if (!part) return null;

        // 1. Link Markdown: [texto](url)
        const linkMatch = part.match(/^\[([\s\S]+?)\]\s*\(([\s\S]+?)\)$/);
        if (linkMatch) {
            const [_, text, url] = linkMatch;
            return (
                <Link
                    key={`link-${i}`}
                    href={url.trim()}
                    className="text-blue-600 underline hover:text-blue-800 transition-colors font-bold mx-0.5 inline-flex items-center gap-1 cursor-pointer bg-blue-50/80 px-1.5 py-0.5 rounded shadow-sm relative z-10 active:scale-95 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (window.innerWidth < 768) onLinkClick?.()
                    }}
                >
                    <MarkdownText content={text} onLinkClick={onLinkClick} />
                </Link>
            );
        }

        // 2. Negrito Markdown: **texto**
        if (part.startsWith('**') && part.endsWith('**')) {
            const boldText = part.slice(2, -2);
            return (
                <strong key={`bold-${i}`} className="font-bold text-gray-900 mx-0.1">
                    <MarkdownText content={boldText} />
                </strong>
            );
        }

        // 3. Itálico Markdown: *texto*
        if (part.startsWith('*') && part.endsWith('*')) {
            const italicText = part.slice(1, -1);
            return (
                <em key={`italic-${i}`} className="italic text-gray-800">
                    <MarkdownText content={italicText} />
                </em>
            );
        }

        // 4. Texto comum com suporte a quebras de linha
        return part.split('\n').map((line, lIdx, arr) => (
            <span key={`text-${i}-${lIdx}`}>
                {line}
                {lIdx < arr.length - 1 && <br />}
            </span>
        ));
    });
};

export default function FloatingAIChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState<Step>('identify')
    const [userCpf, setUserCpf] = useState('')
    const [userName, setUserName] = useState('')
    const [message, setMessage] = useState('')
    const [history, setHistory] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [identifying, setIdentifying] = useState(false)
    const [unlocking, setUnlocking] = useState(false)
    const [birthDay, setBirthDay] = useState('')
    const [birthMonth, setBirthMonth] = useState('')
    const [birthYear, setBirthYear] = useState('')
    const [unlockCode, setUnlockCode] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)
    const [messageCount, setMessageCount] = useState(0)
    const [showTooltip, setShowTooltip] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Controle de visibilidade do Tooltip (Primeira vez por dia + Scroll)
    useEffect(() => {
        // Forçar página para o topo no carregamento para garantir que o tooltip seja visto
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        const checkTooltip = () => {
            const today = new Date().toISOString().split('T')[0]
            const lastShown = localStorage.getItem('chat_tooltip_last_date')

            if (lastShown !== today) {
                setShowTooltip(true)
                // Não marcamos como exibido ainda, deixamos o usuário ver
            }
        }

        checkTooltip()

        const handleScroll = () => {
            if (window.scrollY > 50) {
                setShowTooltip(false)
                // Uma vez que sumiu no scroll, marcamos como "visto hoje"
                const today = new Date().toISOString().split('T')[0]
                localStorage.setItem('chat_tooltip_last_date', today)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Admin pode pular verificação; outros precisam verificar CPF + data
    useEffect(() => {
        const savedCpf = localStorage.getItem('chat_user_cpf')
        const savedName = localStorage.getItem('chat_user_name')
        const clean = savedCpf?.replace(/\D/g, '') || ''

        // Admin: restaurar sessão sem verificar
        if (clean === '13017905756' && savedName) {
            setUserCpf(clean)
            setUserName(savedName)
            setIsAdmin(true)
            setStep('chat')
            fetchUsage(clean)
            return
        }

        // Preencher CPF da URL se disponível
        const urlParams = new URLSearchParams(window.location.search)
        const cpfParam = urlParams.get('cpf') || urlParams.get('doc')
        if (cpfParam) {
            const urlClean = cpfParam.replace(/\D/g, '')
            if (urlClean.length >= 9) setUserCpf(urlClean)
        }
    }, [])

    async function fetchUsage(cpf: string) {
        if (!cpf || cpf === '13017905756') return
        try {
            const supabase = createClient()
            const { data } = await supabase
                .from('ai_usage')
                .select('message_count')
                .eq('cpf', cpf.replace(/\D/g, ''))
                .limit(1)

            if (data?.[0]) {
                setMessageCount(data[0].message_count)
            }
        } catch (e) {
            console.error('Erro ao buscar uso:', e)
        }
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [history, loading, step])

    function handleIdentify() {
        const cleanDoc = userCpf.replace(/\D/g, '')
        if (cleanDoc.length < 9) {
            toast.error('Informe CPF (11 dígitos) ou RG (9 dígitos) válido')
            return
        }
        setStep('birthDate')
    }

    async function handleVerifyBirthDate() {
        const cleanDoc = userCpf.replace(/\D/g, '')
        const birthDateStr = birthYear && birthMonth && birthDay
            ? `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`
            : ''

        if (!birthDateStr) {
            toast.error('Informe a data de nascimento completa')
            return
        }

        setIdentifying(true)
        try {
            const res = await fetch('/api/admin/ai/chat/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: cleanDoc,
                    identifierType: cleanDoc.length === 11 ? 'cpf' : 'rg',
                    birthDate: birthDateStr,
                }),
            })
            const json = await res.json()

            if (res.status === 403 && json.locked) {
                setStep('locked')
                toast.error(json.error || 'Muitas tentativas. Use o código para desbloquear.')
                return
            }

            if (json.valid) {
                setUserName(json.userName)
                localStorage.setItem('chat_user_cpf', cleanDoc)
                localStorage.setItem('chat_user_name', json.userName)
                setIsAdmin(cleanDoc === '13017905756')
                setStep('chat')
                fetchUsage(cleanDoc)
                toast.success(`Bem-vindo, ${json.userName.split(' ')[0]}!`)
            } else {
                toast.error(json.error || 'Dados não conferem.')
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao verificar.')
        } finally {
            setIdentifying(false)
        }
    }

    async function handleUnlock() {
        const cleanDoc = userCpf.replace(/\D/g, '')
        if (!unlockCode.trim()) {
            toast.error('Informe o código de confirmação')
            return
        }

        setUnlocking(true)
        try {
            const res = await fetch('/api/admin/ai/chat/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: cleanDoc,
                    identifierType: cleanDoc.length === 11 ? 'cpf' : 'rg',
                    codigo: unlockCode.trim(),
                }),
            })
            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error || 'Código inválido.')
                return
            }

            setUserName(json.userName)
            localStorage.setItem('chat_user_cpf', cleanDoc)
            localStorage.setItem('chat_user_name', json.userName)
            setStep('chat')
            setUnlockCode('')
            fetchUsage(cleanDoc)
            toast.success('Desbloqueado! Bem-vindo de volta.')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao desbloquear.')
        } finally {
            setUnlocking(false)
        }
    }

    function handleLogout() {
        localStorage.removeItem('chat_user_cpf')
        localStorage.removeItem('chat_user_name')
        setUserCpf('')
        setUserName('')
        setHistory([])
        setStep('identify')
        setIsAdmin(false)
        setMessageCount(0)
        toast.success('Sessão encerrada.')
    }

    function handleQuickPrompt(prompt: string) {
        if (loading) return
        handleSendMessage(prompt)
    }

    async function handleSendMessage(directMsg?: string) {
        const textToSend = directMsg || message
        if (!textToSend.trim() || loading) return

        const userMsg = textToSend
        if (!directMsg) setMessage('')
        setHistory(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            const res = await fetch('/api/admin/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    history: history,
                    userCpf: userCpf.replace(/\D/g, ''),
                    userName: userName
                })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Erro ao processar sua dúvida.')
            }

            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            let assistantMsg = ''

            setHistory(prev => [...prev, { role: 'assistant', content: '' }])

            while (reader) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                assistantMsg += chunk

                setHistory(prev => {
                    const newHistory = [...prev]
                    newHistory[newHistory.length - 1].content = assistantMsg
                    return newHistory
                })
            }

            // Sincronizar contador real do banco após o envio
            fetchUsage(userCpf)

        } catch (error: any) {
            console.error('Chat Error:', error)
            setHistory(prev => [...prev, {
                role: 'assistant',
                content: `Ops! Tive um probleminha: ${error.message}. Pode tentar de novo?`
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex items-center justify-between text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm truncate">Assistente Virtual</h3>
                                    <p className="text-[10px] text-blue-100 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                        {step === 'chat' ? (isAdmin ? 'Modo Administrador' : 'Online para te ajudar') : 'Identificação necessária'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {step === 'chat' && (
                                    <button
                                        onClick={handleLogout}
                                        title="Trocar usuário / Sair"
                                        className="hover:bg-white/10 p-1.5 rounded-lg transition-colors mr-1"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50">
                            {step === 'identify' && (
                                <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-6">
                                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                                        <User className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-800 text-lg">Identificação</h4>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            Informe seu CPF ou RG usado na inscrição para que o assistente possa encontrar suas informações.
                                        </p>
                                    </div>
                                    <div className="w-full space-y-4">
                                        <input
                                            type="text"
                                            value={userCpf}
                                            onChange={(e) => setUserCpf(e.target.value)}
                                            placeholder="Digite apenas números (CPF ou RG)"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center font-semibold tracking-wider text-gray-700"
                                        />
                                        <button
                                            onClick={handleIdentify}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                        >
                                            Continuar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 'birthDate' && (
                                <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-6">
                                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                                        <User className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-800">Confirmação de segurança</h4>
                                        <p className="text-sm text-gray-500">
                                            Informe sua data de nascimento para confirmar sua identidade.
                                        </p>
                                    </div>
                                    <div className="w-full space-y-4">
                                        <div className="grid grid-cols-3 gap-2">
                                            <select
                                                value={birthDay}
                                                onChange={(e) => setBirthDay(e.target.value)}
                                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="">Dia</option>
                                                {DAYS.map((d) => (
                                                    <option key={d.value} value={d.value}>{d.label}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={birthMonth}
                                                onChange={(e) => setBirthMonth(e.target.value)}
                                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="">Mês</option>
                                                {MONTHS.map((m) => (
                                                    <option key={m.value} value={m.value}>{m.label}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={birthYear}
                                                onChange={(e) => setBirthYear(e.target.value)}
                                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="">Ano</option>
                                                {YEARS.map((y) => (
                                                    <option key={y.value} value={y.value}>{y.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleVerifyBirthDate}
                                            disabled={identifying}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                        >
                                            {identifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar'}
                                        </button>
                                        <button
                                            onClick={() => setStep('identify')}
                                            className="text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            Voltar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 'locked' && (
                                <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-6">
                                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                                        <AlertCircle className="w-8 h-8 text-amber-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-800">Acesso bloqueado</h4>
                                        <p className="text-sm text-gray-500">
                                            Muitas tentativas incorretas. Use o código de confirmação enviado no seu e-mail para desbloquear.
                                        </p>
                                    </div>
                                    <div className="w-full space-y-4">
                                        <input
                                            type="text"
                                            value={unlockCode}
                                            onChange={(e) => setUnlockCode(e.target.value.toUpperCase())}
                                            placeholder="Código de confirmação"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-center font-mono tracking-widest uppercase"
                                        />
                                        <button
                                            onClick={handleUnlock}
                                            disabled={unlocking}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                        >
                                            {unlocking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Desbloquear'}
                                        </button>
                                        <p className="text-xs text-gray-400">
                                            Não tem o código?{' '}
                                            <Link href="/inscricao/acompanhar" className="text-blue-600 underline hover:text-blue-700">
                                                Acompanhar inscrição
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {step === 'chat' && (
                                <>
                                    <div
                                        ref={scrollRef}
                                        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                                    >
                                        {history.length === 0 && (
                                            <div className="text-center py-6 space-y-4">
                                                <div className="inline-block p-4 rounded-2xl bg-blue-50 text-blue-700 text-sm max-w-[80%]">
                                                    Olá <span className="font-bold">{userName.split(' ')[0]}</span>! 🏃‍♂️ Sou seu assistente oficial. O que você precisa saber?
                                                </div>

                                                <div className="grid grid-cols-1 gap-2 px-4">
                                                    {QUICK_PROMPTS.map((prompt, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                handleQuickPrompt(prompt)
                                                            }}
                                                            className="text-left p-3 rounded-xl bg-white border border-gray-100 text-xs text-gray-600 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
                                                        >
                                                            {prompt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {history.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-100'
                                                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm'
                                                    }`}>
                                                    <MarkdownText
                                                        content={msg.content}
                                                        onLinkClick={msg.role === 'assistant' ? () => setIsOpen(false) : undefined}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {loading && history[history.length - 1]?.role === 'user' && (
                                            <div className="flex justify-start">
                                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer / Input */}
                                    <div className="p-4 bg-white border-t border-gray-100">
                                        {isAdmin ? (
                                            <div className="mb-2 flex justify-between items-center px-1">
                                                <span className="text-[10px] text-gray-400 font-medium">Limite diário</span>
                                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                                    Ilimitado (Admin)
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="mb-2 flex justify-between items-center px-1">
                                                <span className="text-[10px] text-gray-400 font-medium">Limite diário</span>
                                                <span className={`text-[10px] font-bold ${messageCount >= MAX_FREE_MESSAGES ? 'text-red-500' : 'text-blue-500'}`}>
                                                    {messageCount}/{MAX_FREE_MESSAGES} perguntas
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Sua dúvida..."
                                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                            />
                                            <button
                                                onClick={() => handleSendMessage()}
                                                disabled={loading || !message.trim()}
                                                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition-all shadow-md active:scale-95"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Button with Tooltip */}
            <div className="relative group">
                <AnimatePresence>
                    {!isOpen && showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.8, transition: { duration: 0.5 } }}
                            className="absolute bottom-full right-0 mb-4 whitespace-nowrap bg-white px-4 py-2 rounded-xl shadow-xl border border-blue-100 text-sm font-medium text-blue-600 pointer-events-none"
                        >
                            Tire suas dúvidas com o Assistente! 🏃‍♂️
                            <div className="absolute top-full right-6 -mt-1 border-8 border-transparent border-t-white"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 ${isOpen ? 'bg-gray-200 text-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
                </button>
            </div>
        </div>
    )
}
