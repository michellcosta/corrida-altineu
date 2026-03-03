import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSiteContext } from '@/lib/admin/ai-context'

export async function POST(request: NextRequest) {
    try {
        const { message, history, regulationText, systemPrompt } = await request.json()

        const apiKey = process.env.GEMINI_API_KEY
        console.log('DEBUG GEMINI:', { hasKey: !!apiKey, keyPrefix: apiKey?.substring(0, 10) })

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Chave de API do Gemini (GEMINI_API_KEY) não configurada nas variáveis de ambiente.' },
                { status: 500 }
            )
        }

        // 1. Gerar o Cérebro da IA (Contexto Automático do Site)
        const automatedContext = await getSiteContext()

        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `
            ${automatedContext}

            PROMPT DO ADMINISTRADOR:
            ${systemPrompt || "Seja amigável e conciso."}
            `
        })

        // Log de tamanho do contexto para debug de cota
        const regLength = regulationText?.length || 0
        console.log('DEBUG Contexto:', { regLength, msgLength: message.length })

        // Se o regulamento for muito grande (ex: > 10k chars), vamos truncar para evitar erro 429 de tokens/min
        const safeRegulation = regLength > 10000
            ? regulationText.substring(0, 10000) + "... (Texto truncado por tamanho)"
            : regulationText

        // Preparar o contexto combinando regulamento e a pergunta atual
        const fullContext = `
      REGULAMENTO ADICIONAL (Manual):
      ${safeRegulation || 'Nenhum regulamento extra fornecido.'}

      PERGUNTA DO ATLETA:
      ${message}
    `

        // Iniciar chat com histórico (se houver)
        const chat = model.startChat({
            history: (history || []).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
        })

        // Lógica de retry para erro 429 (Quota)
        let result;
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
            try {
                result = await chat.sendMessage(fullContext)
                break;
            } catch (err: any) {
                // Se for erro de cota (429), espera e tenta de novo
                if ((err.status === 429 || err.message?.includes('429')) && retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Tentativa ${retryCount} após erro 429...`);
                    await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                    continue;
                }
                throw err;
            }
        }

        if (!result) throw new Error('Falha ao obter resposta da IA após múltiplas tentativas.');

        const response = await result.response
        const text = response.text()

        return NextResponse.json({ reply: text })
    } catch (error: any) {
        console.error('ERRO DETALHADO GEMINI:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText,
            details: error.errorDetails
        })

        const isQuotaError = error.status === 429 || error.message?.includes('429')
        const errorMessage = isQuotaError
            ? 'Limite de uso da IA atingido. Por favor, aguarde 15-30 segundos e tente novamente.'
            : 'Erro ao processar mensagem com a IA. Verifique as configurações e a chave de API.'

        return NextResponse.json(
            { error: errorMessage },
            { status: error.status || 500 }
        )
    }
}
