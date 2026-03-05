import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getDynamicContext, getAiUsage, incrementAiUsage, getAiConfig, PRIVACY_DRAWER, LOGISTICS_DRAWER, HISTORY_DRAWER, SITE_MAP_DRAWER } from '@/lib/admin/ai-context'

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

        // 1. Validar Identificação e Limites
        if (!userCpf) {
            return NextResponse.json({ error: 'Identificação necessária.' }, { status: 401 })
        }

        const cleanUserCpf = userCpf.replace(/\D/g, '')
        const usage = await getAiUsage(cleanUserCpf, userName)
        if (!usage) {
            return NextResponse.json({ error: 'Erro ao validar acesso.' }, { status: 500 })
        }

        if (!usage.isAdmin && usage.message_count >= MAX_MESSAGES) {
            return NextResponse.json({
                error: `Limite de ${MAX_MESSAGES} mensagens diárias atingido. Sua cota renova amanhã.`
            }, { status: 429 })
        }

        // 2. Identificar busca de documento na mensagem (Volátil)
        const docMatch = message.match(/([A-Z]{1}[0-9A-Z]{7}|\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{5,12})/i)
        const lowerMessage = message.toLowerCase()
        const isAskingForSelf = (lowerMessage.includes('minha') || lowerMessage.includes('meu') || lowerMessage.includes('estou')) &&
            (lowerMessage.includes('inscrição') || lowerMessage.includes('inscrito') || lowerMessage.includes('status') || lowerMessage.includes('cadastro') || lowerMessage.includes('verificar'))

        const searchQuery = docMatch ? docMatch[0] : cleanUserCpf
        console.log(`DEBUG AI CHAT: userCpf=${cleanUserCpf}, searchQuery=${searchQuery}`)

        // 3. Buscar dados em tempo real
        const dynamicContext = await getDynamicContext(searchQuery)
        console.log(`DEBUG AI CHAT: dynamicContext length=${dynamicContext.length}, foundInscricao=${dynamicContext.includes('ENCONTRADA')}`)

        const systemInstruction = `
            VOCÊ É O ASSISTENTE VIRTUAL DA 51ª CORRIDA DE MACUCO.
            Olá, você está falando com ${usage.full_name || 'um atleta'}.
            O CPF deste usuário logado é ${cleanUserCpf}.

            ${PRIVACY_DRAWER.replace('${userCpf}', cleanUserCpf)}
            
            DIRETIVA DE BUSCA DE INSCRIÇÃO:
            1. SEMPRE verifique o bloco "DADOS EM TEMPO REAL" abaixo antes de responder sobre inscrições.
            2. Se houver um "RESULTADO DA BUSCA DE INSCRIÇÃO: ENCONTRADA ✅", você DEVE informar os dados (Status, Categoria, Código) imediatamente.
            3. Se a inscrição foi ENCONTRADA, NUNCA peça o CPF ou qualquer documento.
            4. Se o resultado for "NÃO ENCONTRADA ❌" para o CPF ${cleanUserCpf}, informe que não localizou e pergunte se ele tem um RG ou Código para tentar novamente.

            CONHECIMENTO BASE (CACHE):
            ${LOGISTICS_DRAWER}
            ${HISTORY_DRAWER}
            ${SITE_MAP_DRAWER}
            ${(regulationText || '').substring(0, 3000)}

            ${dynamicContext}

            PROMPT DO ADMIN:
            ${systemPrompt || "Seja amigável e conciso."}
        `

        // 4. Incrementar uso no banco
        await incrementAiUsage(cleanUserCpf)

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
                const error = await response.json()
                throw new Error(error.message || 'Erro DeepSeek')
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
