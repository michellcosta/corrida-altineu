import { createServiceClient } from '@/lib/supabase/serverClient'

/**
 * Helper para gerar o contexto do site para a IA.
 * Combina dados dinâmicos do banco de dados (Supabase) com informações estáticas do site.
 */
export async function getSiteContext() {
    try {
        const supabase = createServiceClient()

        // 1. Buscar dados do Evento (Ano, Local, Edição)
        const { data: event } = await supabase
            .from('events')
            .select('*')
            .eq('year', 2026)
            .single()

        // 2. Buscar Categorias, Preços e Vagas
        const { data: categories } = await supabase
            .from('categories')
            .select('*')
            .eq('event_id', event?.id)
            .eq('is_active', true)

        // 3. Informações Estáticas (História, Kit, Patrocinadores)
        const staticContext = `
HISTÓRIA DO EVENTO:
A Corrida Rústica de São João Batista nasceu em 1974 em Macuco-RJ. 
Em 1985 ultrapassou 1.000 atletas. Em 2000 recebeu reconhecimento nacional.
Em 2025 celebrou sua 50ª edição (Jubileu de Ouro).
Em 2026 acontece a 51ª edição, mantendo a tradição com inovação.

SOBRE O KIT DO ATLETA:
O kit geralmente contém: Camiseta oficial do evento, número de peito com chip de cronometragem, medalha de finisher (entregue após a prova) e eventuais brindes de patrocinadores.
A retirada do kit acontece em local e horário a serem confirmados (geralmente na véspera da prova na sede da prefeitura ou ginásio local).

PATROCINADORES PRINCIPAIS:
O evento conta com o apoio da Prefeitura Municipal de Macuco e diversos patrocinadores locais e regionais que viabilizam a premiação total de mais de R$ 20.000,00.
`

        // 4. Formatar os dados dinâmicos do banco
        let dynamicContext = "DADOS ATUAIS DO EVENTO (BANCO DE DADOS):\n"
        if (event) {
            dynamicContext += `- Edição: ${event.edition}ª edição\n`
            dynamicContext += `- Data da Prova: ${event.race_date}\n`
            dynamicContext += `- Local: ${event.location}, ${event.city} - ${event.state}\n`
            dynamicContext += `- Premiação Total: R$ ${event.total_prize?.toLocaleString('pt-BR')}\n`
            dynamicContext += `- Status das Inscrições: ${event.registrations_open ? 'ABERTAS' : 'FECHADAS'}\n`
        }

        if (categories && categories.length > 0) {
            dynamicContext += "\nCATEGORIAS E REGRAS:\n"
            categories.forEach(cat => {
                dynamicContext += `- ${cat.name}: Price R$ ${cat.price}. `
                dynamicContext += `${cat.is_free ? 'GRATUITA. ' : ''}`
                dynamicContext += `Idade: ${cat.min_age}${cat.max_age ? ' a ' + cat.max_age : '+'} anos. `
                dynamicContext += `Descrição: ${cat.description}\n`
            })
        }

        return `
VOCÊ É O ASSISTENTE VIRTUAL DA 51ª CORRIDA RÚSTICA DE SÃO JOÃO BATISTA (MACUCO-RJ).
Use as informações abaixo para responder aos atletas de forma amigável, concisa e precisa.

${dynamicContext}

${staticContext}
`
    } catch (error) {
        console.error('Erro ao gerar contexto da IA:', error)
        return "Você é o assistente virtual da Corrida de Macuco. No momento, não conseguimos carregar todos os detalhes dinâmicos, mas responda o melhor que puder sobre o evento de 2026."
    }
}
