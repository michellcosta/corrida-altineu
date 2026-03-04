import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getDynamicContext, getAiUsage, incrementAiUsage, PRIVACY_DRAWER, LOGISTICS_DRAWER, HISTORY_DRAWER } from '@/lib/admin/ai-context'

const MAX_MESSAGES = 15

export async function POST(request: NextRequest) {
    try {
        const { message, history, regulationText, systemPrompt, userCpf, userName } = await request.json()

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Chave de API não configurada.' }, { status: 500 })
        }

        // 1. Validar Identificação e Limites
        if (!userCpf) {
            return NextResponse.json({ error: 'Identificação necessária.' }, { status: 401 })
        }

        const usage = await getAiUsage(userCpf, userName)
        if (!usage) {
            return NextResponse.json({ error: 'Erro ao validar acesso.' }, { status: 500 })
        }

        if (!usage.isAdmin && usage.message_count >= MAX_MESSAGES) {
            return NextResponse.json({ 
                error: `Limite de ${MAX_MESSAGES} mensagens diárias atingido. Sua cota renova em 24h.` 
            }, { status: 429 })
        }

        // 2. Identificar busca de documento na mensagem (Volátil)
        // Procura por sequências de números (CPF/RG) ou códigos alfanuméricos (ex: V567Z5CX)
        // Ajustado para evitar pegar palavras comuns como "Verificar"
        const docMatch = message.match(/([A-Z]{1}[0-9A-Z]{7}|\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{5,12})/i)
        
        // Se o usuário pedir para verificar a inscrição, usamos o CPF da sessão como busca
        const isAskingForSelf = message.toLowerCase().includes('minha inscrição') || 
                               message.toLowerCase().includes('meu status') ||
                               message.toLowerCase().includes('meu cadastro') ||
                               message.toLowerCase().includes('estou inscrito')

        // Se houver um match de documento na mensagem, usamos ele. 
        // Caso contrário, se for uma pergunta sobre si mesmo, usamos o userCpf.
        const searchQuery = docMatch ? docMatch[0] : (isAskingForSelf ? userCpf : undefined)

        console.log('DEBUG AI SEARCH:', { message, userCpf, isAskingForSelf, searchQuery, docMatch: docMatch ? docMatch[0] : null })

        // 3. Buscar dados em tempo real (Nunca cacheados)
        const dynamicContext = await getDynamicContext(searchQuery)

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `
            VOCÊ É O ASSISTENTE VIRTUAL DA 51ª CORRIDA DE MACUCO.
            Olá, você está falando com ${usage.full_name || 'um atleta'}.
            O CPF deste usuário logado é ${userCpf}.

            ${PRIVACY_DRAWER}
            
            DIRETIVA DE BUSCA DE INSCRIÇÃO:
            1. Se o usuário perguntar "Verificar minha inscrição" ou similar, olhe para o bloco "DADOS EM TEMPO REAL" abaixo.
            2. Se houver um "RESULTADO DA BUSCA" ou "BUSCA TEMPORÁRIA" informando que a inscrição foi ENCONTRADA, use esses dados para confirmar o status, categoria e código.
            3. Se o resultado diz que a inscrição foi ENCONTRADA, NÃO peça o CPF novamente. Responda diretamente.
            4. Se o resultado diz que NENHUMA inscrição foi encontrada para o CPF ${userCpf}, informe que não localizou e peça para ele conferir se o CPF informado na identificação está correto.

            CONHECIMENTO BASE (CACHE):
            ${LOGISTICS_DRAWER}
            ${HISTORY_DRAWER}
            ${(regulationText || '').substring(0, 3000)}

            ${dynamicContext}

            PROMPT DO ADMIN:
            ${systemPrompt || "Seja amigável e conciso."}
            `
        }, { apiVersion: 'v1beta' })

        // 4. Iniciar chat com histórico reduzido (Economia de Tokens)
        const chat = model.startChat({
            history: (history || []).slice(-6).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
        })

        // 5. Incrementar uso no banco (antes de enviar para a IA para garantir o controle)
        await incrementAiUsage(userCpf)

        // 6. Streaming de Resposta
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
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
            }
        })

    } catch (error: any) {
        console.error('ERRO GEMINI:', error)
        return NextResponse.json({ error: 'Erro ao processar mensagem.' }, { status: 500 })
    }
}
