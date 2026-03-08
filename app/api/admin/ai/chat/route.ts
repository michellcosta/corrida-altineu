import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getDynamicContext, getAiUsage, incrementAiUsage, getAiConfig, HONESTY_DRAWER, PRIVACY_DRAWER, LOGISTICS_DRAWER, PERCURSOS_DRAWER, CONTACTS_DRAWER, AWARDS_DRAWER, HISTORY_DRAWER, SITE_MAP_DRAWER } from '@/lib/admin/ai-context'

const MAX_MESSAGES = 15
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
    let aiProvider = 'gemini'
    try {
        const body = await request.json()
        let { message, history, regulationText, systemPrompt, userCpf, userName } = body
        aiProvider = String(body.aiProvider || '').toLowerCase().trim()

        // Se o provedor ou contexto não foi enviado (ex: chat público), carregar do banco
        if (!aiProvider || !regulationText || !systemPrompt) {
            const globalConfig = await getAiConfig()
            if (globalConfig) {
                if (!aiProvider) aiProvider = (globalConfig.ai_provider as string) || 'gemini'
                if (!regulationText) regulationText = globalConfig.regulation_text
                if (!systemPrompt) systemPrompt = globalConfig.system_prompt
            } else {
                if (!aiProvider) aiProvider = 'gemini'
            }
        }

        const geminiKey = process.env.GEMINI_API_KEY
        const deepseekKey = process.env.DEEPSEEK_API_KEY
        const adminCpf = (process.env.ADMIN_CHAT_CPF || '').replace(/\D/g, '')

        // 1. Validar Identificação e Limites
        if (!userCpf) {
            return NextResponse.json({ error: 'Identificação necessária.' }, { status: 401 })
        }

        const cleanUserCpf = userCpf.replace(/\D/g, '')

        // Se o CPF enviado for o fallback do painel admin (00000000000), substituir pelo CPF real do admin
        const effectiveCpf = (cleanUserCpf === '00000000000' && adminCpf) ? adminCpf : cleanUserCpf

        const usage = await getAiUsage(effectiveCpf, userName)
        if (!usage) {
            return NextResponse.json({ error: 'Erro ao validar acesso.' }, { status: 500 })
        }

        if (!usage.isAdmin && usage.message_count >= MAX_MESSAGES) {
            return NextResponse.json({
                error: `Limite de ${MAX_MESSAGES} mensagens diárias atingido. Sua cota renova amanhã!`
            }, { status: 429 })
        }

        // 2. Identificar busca de documento na mensagem (Volátil)
        let searchQuery = effectiveCpf

        const regMatch = message.match(/\b2026-[a-z]+-\d{4}\b/i)
        const docPattern = message.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\b\d{5,12}\b/)
        const codeMatch = message.match(/\b[a-z0-9]{8}\b/i)

        if (regMatch) {
            searchQuery = regMatch[0]
        } else if (docPattern) {
            searchQuery = docPattern[0]
        } else if (codeMatch) {
            const possibleCode = codeMatch[0]
            // Ignorar se for uma palavra comum (apenas letras minúsculas digitadas no texto)
            if (!/^[a-z]+$/.test(possibleCode) || possibleCode === possibleCode.toUpperCase()) {
                searchQuery = possibleCode
            }
        }

        const lowerMessage = message.toLowerCase()
        const isAskingForSelf = (lowerMessage.includes('minha') || lowerMessage.includes('meu') || lowerMessage.includes('estou')) &&
            (lowerMessage.includes('inscrição') || lowerMessage.includes('inscrito') || lowerMessage.includes('status') || lowerMessage.includes('cadastro') || lowerMessage.includes('verificar'))

        console.log(`DEBUG AI CHAT: userCpf=${effectiveCpf}, searchQuery=${searchQuery}`)

        // 3. Buscar dados em tempo real
        const dynamicContext = await getDynamicContext(searchQuery)
        console.log(`DEBUG AI CHAT: dynamicContext length=${dynamicContext.length}, foundInscricao=${dynamicContext.includes('ENCONTRADA')}`)

        const systemInstruction = `
            VOCÊ É O ASSISTENTE VIRTUAL DA 51ª CORRIDA DE MACUCO.
            Olá, você está falando com ${usage.full_name || 'um atleta'}.
            O CPF deste usuário logado é ${cleanUserCpf}.

            ${HONESTY_DRAWER}
            ${PRIVACY_DRAWER.replace('${userCpf}', cleanUserCpf)}
            
            DIRETIVA DE BUSCA DE INSCRIÇÃO:
            1. Verifique o bloco "DADOS EM TEMPO REAL" abaixo APENAS quando o usuário perguntar sobre inscrição, status, confirmação ou cadastro.
            2. NUNCA mostre o status da inscrição (CONFIRMADA, Código, Categoria) no início da conversa ou de forma proativa. Informe esses dados SOMENTE quando o usuário perguntar explicitamente (ex: "minha inscrição", "estou inscrito?", "qual meu status?", "meu código").
            3. Se a inscrição foi ENCONTRADA e o usuário perguntou, informe os dados (Status, Categoria, Código). NUNCA peça CPF ou documento nesse caso.
            4. Se o resultado for "NÃO ENCONTRADA ❌" e o usuário perguntou, informe que não localizou e sugira RG ou Código para tentar novamente.

            CONHECIMENTO BASE (CACHE):
            ${LOGISTICS_DRAWER}
            ${PERCURSOS_DRAWER}
            ${AWARDS_DRAWER}
            ${CONTACTS_DRAWER}
            ${HISTORY_DRAWER}
            ${SITE_MAP_DRAWER}
            ${(regulationText || '').substring(0, 3000)}

            ${dynamicContext}

            PROMPT DO ADMIN:
            ${systemPrompt || "Seja amigável e conciso."}
        `

        // 4. Incrementar uso no banco
        await incrementAiUsage(effectiveCpf)

        // 5. Lógica por Provedor
        if (aiProvider === 'deepseek') {
            if (!deepseekKey) {
                return NextResponse.json({ error: 'Chave DeepSeek não configurada.' }, { status: 500 })
            }

            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${deepseekKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: systemInstruction },
                        ...(history || []).slice(-6).map((msg: any) => ({
                            role: msg.role === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        })),
                        { role: 'user', content: message }
                    ],
                    stream: true
                })
            })

            if (!response.ok) {
                let errorMsg = 'Erro DeepSeek'
                try {
                    const errorData = await response.json()
                    errorMsg = errorData.message || errorData.error?.message || JSON.stringify(errorData)
                } catch (e) {
                    try {
                        errorMsg = await response.text()
                    } catch (t) {
                        errorMsg = 'Não foi possível ler a mensagem de erro da API.'
                    }
                }
                console.error(`DETALHE ERRO DEEPSEEK (${response.status}):`, errorMsg)
                throw new Error(`DeepSeek API (${response.status}): ${errorMsg}`)
            }

            const stream = new ReadableStream({
                async start(controller) {
                    const reader = response.body?.getReader()
                    const decoder = new TextDecoder()
                    const encoder = new TextEncoder()

                    if (!reader) return

                    try {
                        while (true) {
                            const { done, value } = await reader.read()
                            if (done) break

                            const chunk = decoder.decode(value)
                            const lines = chunk.split('\n').filter(line => line.trim() !== '')

                            for (const line of lines) {
                                if (line.startsWith('data: ')) {
                                    const dataStr = line.slice(6)
                                    if (dataStr === '[DONE]') {
                                        controller.close()
                                        return
                                    }

                                    try {
                                        const data = JSON.parse(dataStr)
                                        const content = data.choices[0]?.delta?.content || ''
                                        if (content) {
                                            controller.enqueue(encoder.encode(content))
                                        }
                                    } catch (e) {
                                        console.error('Erro parse deepseek chunk:', e)
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        controller.error(err)
                    }
                }
            })

            return new Response(stream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' }
            })

        } else {
            // Default: Gemini
            if (!geminiKey) {
                return NextResponse.json({ error: 'Chave Gemini não configurada.' }, { status: 500 })
            }

            const genAI = new GoogleGenerativeAI(geminiKey)
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: systemInstruction
            })

            const chat = model.startChat({
                history: (history || []).slice(-6).map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }],
                })),
            })

            const result = await chat.sendMessageStream(message)

            const stream = new ReadableStream({
                async start(controller) {
                    const encoder = new TextEncoder()
                    try {
                        for await (const chunk of result.stream) {
                            const chunkText = chunk.text()
                            if (chunkText) {
                                controller.enqueue(encoder.encode(chunkText))
                            }
                        }
                        controller.close()
                    } catch (err) {
                        controller.error(err)
                    }
                }
            })

            return new Response(stream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' }
            })
        }

    } catch (error: any) {
        console.error('ERRO AI ROUTE:', error)
        return NextResponse.json({
            error: error.message || 'Erro ao processar mensagem.',
            aiProviderAtError: aiProvider,
            stack: error.stack
        }, { status: 500 })
    }
}
