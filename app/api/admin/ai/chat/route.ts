import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSiteContext } from '@/lib/admin/ai-context'

export async function POST(request: NextRequest) {
    try {
        const { message, history, regulationText, systemPrompt } = await request.json()

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Chave de API do Gemini (GEMINI_API_KEY) não configurada.' },
                { status: 500 }
            )
        }

        // 1. Tentar extrair um possível documento/código da mensagem para a busca
        // Procura por sequências de números (CPF/RG) ou códigos alfanuméricos
        const docMatch = message.match(/(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{5,12}|[A-Z0-9]{6,10})/i)
        const searchQuery = docMatch ? docMatch[0] : undefined

        // 2. Gerar o Contexto do Site (passando a query de busca se houver)
        // Usar Promise.all para buscar contexto e regulamento em paralelo se necessário
        const automatedContext = await getSiteContext(searchQuery)

        // 3. Preparar o Regulamento
        const safeRegulation = (regulationText || '').substring(0, 5000) // Reduzido de 10k para 5k para acelerar

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `
            ${automatedContext}

            REGULAMENTO DO EVENTO:
            ${safeRegulation || 'Nenhum regulamento extra fornecido.'}

            PROMPT DO ADMINISTRADOR:
            ${systemPrompt || "Seja amigável e conciso."}
            `
        })

        // Iniciar chat com histórico
        const chat = model.startChat({
            history: (history || []).slice(-10).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
        })

        // Enviar mensagem com Streaming
        const result = await chat.sendMessageStream(message)

        // Criar stream de resposta
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
        console.error('ERRO GEMINI STREAMING:', error)
        return NextResponse.json(
            { error: 'Erro ao processar mensagem com a IA.' },
            { status: 500 }
        )
    }
}
