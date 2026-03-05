import { config } from 'dotenv'

config({ path: '.env.local' })

async function testDeepSeek() {
    try {
        const key = process.env.DEEPSEEK_API_KEY
        console.log('--- INICIO TESTE DEEPSEEK ---')
        console.log('Chave encontrada:', key ? 'SIM (tamanho: ' + key.length + ')' : 'NAO')

        if (!key) {
            console.log('ERRO: DEEPSEEK_API_KEY nula ou vazia')
            return
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key.trim()}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: 'Oi' }],
                stream: false
            })
        })

        console.log('Status HTTP:', response.status)
        const text = await response.text()
        console.log('Conteudo Resposta:', text)
        console.log('--- FIM TESTE DEEPSEEK ---')
    } catch (e: any) {
        console.log('EXCEPTION:', e.message)
    }
}

testDeepSeek()
