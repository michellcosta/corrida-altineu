import { config } from 'dotenv'

config({ path: '.env.local' })

async function testDeepSeek() {
    const key = process.env.DEEPSEEK_API_KEY
    console.log('Testando chave DeepSeek:', key?.substring(0, 8) + '...')

    if (!key) {
        console.error('DEEPSEEK_API_KEY não encontrada no .env.local')
        return
    }

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'user', content: 'Oi!' }
                ],
                stream: false
            })
        })

        console.log('Status HTTP:', response.status)
        const data: any = await response.json()
        console.log('Resposta da API:', JSON.stringify(data, null, 2))

        if (response.status === 401) {
            console.error('\nErro 401: Chave de API inválida ou expirada.')
        } else if (response.status === 402) {
            console.error('\nErro 402: Insufficient Balance (Saldo insuficiente).')
        }
    } catch (error) {
        console.error('Erro na requisição:', error)
    }
}

testDeepSeek()
