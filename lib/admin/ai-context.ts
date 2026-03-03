import { createServiceClient } from '@/lib/supabase/serverClient'

/**
 * Helper para gerar o contexto do site para a IA.
 * Combina dados dinâmicos do banco de dados (Supabase) com informações estáticas do site.
 * Focado em segurança (sem dados pessoais) e senso de urgência (estatísticas).
 */
export async function getSiteContext(searchQuery?: string) {
    try {
        const supabase = createServiceClient()

        // 1. Buscar dados do Evento (Ano, Local, Edição)
        const { data: event } = await supabase
            .from('events')
            .select('*')
            .eq('year', 2026)
            .single()

        if (!event) throw new Error('Evento de 2026 não encontrado.')

        // 2. Buscar Categorias, Preços e Vagas
        const { data: categories } = await supabase
            .from('categories')
            .select('*')
            .eq('event_id', event.id)
            .eq('is_active', true)

        // 3. ESTATÍSTICAS GERAIS (Seguro: Apenas contagem, sem nomes ou dados pessoais)
        const { count: totalInscritos } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'confirmed')

        // 4. BUSCA DE INSCRIÇÃO (Se houver um documento/código fornecido)
        let searchResult = ""
        if (searchQuery) {
            // Limpar a query para evitar caracteres extras (ex: pontos e traços de CPF)
            const cleanQuery = searchQuery.replace(/[^\w]/g, '')
            
            // Tentativa 1: Busca direta na tabela de inscrições por código de confirmação ou número de inscrição
            const { data: regByCode } = await supabase
                .from('registrations')
                .select('id, status, confirmation_code, registration_number, categories(name), athletes(full_name)')
                .eq('event_id', event.id)
                .or(`confirmation_code.eq.${searchQuery.toUpperCase()},registration_number.eq.${searchQuery.toUpperCase()},confirmation_code.eq.${searchQuery},registration_number.eq.${searchQuery}`)
                .maybeSingle()

            let finalReg = regByCode

            // Tentativa 2: Se não encontrou por código, busca por documento do atleta
            if (!finalReg && cleanQuery) {
                // Buscamos atletas que tenham esse documento (pode haver mais de um atleta com o mesmo documento em diferentes eventos)
                const { data: athletes } = await supabase
                    .from('athletes')
                    .select('id, full_name')
                    .eq('document_number', cleanQuery)

                if (athletes && athletes.length > 0) {
                    const athleteIds = athletes.map(a => a.id)
                    
                    // Buscamos a inscrição para este evento específica para qualquer um desses atletas
                    const { data: regByAthlete } = await supabase
                        .from('registrations')
                        .select('id, status, confirmation_code, registration_number, categories(name), athletes(full_name)')
                        .eq('event_id', event.id)
                        .in('athlete_id', athleteIds)
                        .maybeSingle()
                    
                    finalReg = regByAthlete
                }
            }

            if (finalReg) {
                const athleteName = (finalReg.athletes as any)?.full_name || 'Atleta'
                const categoryName = Array.isArray(finalReg.categories) 
                    ? (finalReg.categories[0] as any)?.name 
                    : (finalReg.categories as any)?.name
                
                searchResult = `\nRESULTADO DA BUSCA DE INSCRIÇÃO PARA "${searchQuery}":\n- Atleta: ${athleteName}\n- Status: ${finalReg.status === 'confirmed' ? 'CONFIRMADA ✅' : 'PENDENTE ⏳'}\n- Categoria: ${categoryName || 'Não informada'}\n- Número de Inscrição: ${finalReg.registration_number}\n- Código de Confirmação: ${finalReg.confirmation_code || 'Não gerado'}\n`
            } else {
                searchResult = `\nRESULTADO DA BUSCA DE INSCRIÇÃO PARA "${searchQuery}":\n- Nenhuma inscrição encontrada com este documento ou código.\n`
            }
        }

        // 5. Informações de Logística e FAQ (Estáticas e Detalhadas)
        const logisticsContext = `
LOGÍSTICA E LOCALIZAÇÃO:
- Local da Largada: Praça Central de Macuco, RJ (R. Dr. Mario Freire Martins, 194, Centro).
- Link Google Maps: [Abrir no Google Maps](https://www.google.com/maps/dir/?api=1&destination=R.+Dr.+Mario+Freire+Martins+194+Centro+Macuco+RJ)
- Link Waze: [Abrir no Waze](https://waze.com/ul?q=R.+Dr.+Mario+Freire+Martins+194+Centro+Macuco+RJ&navigate=yes)
- Estacionamento: Gratuito nas ruas próximas à Praça de Macuco.

CRONOGRAMA DETALHADO (2026):
- 06:00: Abertura da Arena e Guarda-volumes.
- 07:00: Largada Oficial (10K e 5K).
- 08:30: Início da Corrida Kids.
- 09:30: Cerimônia de Premiação.
- 11:00: Encerramento do Evento.

RETIRADA DE KITS (FAQ):
- Local: Sede da Prefeitura Municipal de Macuco.
- Horário: Sábado (véspera) das 09h às 17h. Não haverá entrega no dia da prova para atletas locais.
- Documentos Necessários: Documento original com foto (RG/CNH) e comprovante de inscrição (digital ou impresso).
- Retirada por Terceiros: Apenas com autorização assinada e cópia do documento do atleta.

ITENS OBRIGATÓRIOS E RECOMENDADOS:
- Obrigatório: Número de peito visível e chip de cronometragem.
- Recomendado: Uso de protetor solar, hidratação prévia e tênis adequado para asfalto/paralelepípedo.
`

        const historyContext = `
HISTÓRIA DO EVENTO:
A Corrida Rústica de São João Batista nasceu em 1974 em Macuco-RJ. 
Em 2026 acontece a 51ª edição, mantendo a tradição com inovação e premiação total de mais de R$ 20.000,00.
`

        // 6. Formatar os dados dinâmicos do banco
        let dynamicContext = "DADOS ATUAIS DO EVENTO (BANCO DE DADOS):\n"
        dynamicContext += `- Edição: ${event.edition}ª edição\n`
        dynamicContext += `- Data da Prova: ${event.race_date}\n`
        dynamicContext += `- Local: ${event.location}, ${event.city} - ${event.state}\n`
        dynamicContext += `- Status das Inscrições: ${event.registrations_open ? 'ABERTAS' : 'FECHADAS'}\n`
        dynamicContext += `- Link de Inscrição: /inscricao\n`
        dynamicContext += `- TOTAL DE ATLETAS CONFIRMADOS ATÉ AGORA: ${totalInscritos || 0} atletas.\n`
        
        if (searchResult) {
            dynamicContext += searchResult
        }

        if (categories && categories.length > 0) {
            dynamicContext += "\nCATEGORIAS DISPONÍVEIS:\n"
            categories.forEach(cat => {
                dynamicContext += `- ${cat.name}: R$ ${cat.price}. `
                dynamicContext += `Idade: ${cat.min_age}${cat.max_age ? ' a ' + cat.max_age : '+'} anos. `
                dynamicContext += `Vagas Totais: ${cat.max_slots}. `
                dynamicContext += `Descrição: ${cat.description}\n`
            })
        }

        return `
VOCÊ É O ASSISTENTE VIRTUAL DA 51ª CORRIDA RÚSTICA DE SÃO JOÃO BATISTA (MACUCO-RJ).

DIRETIVA DE RESPOSTA E LINKS:
1. Você TEM PERMISSÃO TOTAL para fornecer links internos do site.
2. Quando alguém quiser se inscrever, forneça o link direto: [/inscricao](/inscricao).
3. SEMPRE que mencionar o link de inscrição, use o formato Markdown [Texto do Link](/inscricao) para que ele seja clicável.
4. NUNCA diga que não pode fornecer links ou fazer redirecionamentos. Você deve ser proativo em ajudar o atleta a se inscrever.

DIRETIVA DE BUSCA DE INSCRIÇÃO:
1. Se o usuário perguntar se está inscrito, PEÇA o CPF, RG ou Código de Inscrição.
2. Se o usuário fornecer um número ou código, use o resultado da busca fornecido no contexto abaixo para confirmar.
3. NUNCA mostre o nome completo do atleta, apenas confirme o status e a categoria.

DIRETIVA DE SEGURANÇA CRÍTICA:
1. Você NÃO tem acesso a nomes, CPFs, e-mails ou telefones de inscritos de forma aberta.
2. Se alguém perguntar se uma pessoa específica está inscrita sem fornecer o documento, responda: "Por questões de segurança e privacidade (LGPD), não tenho acesso à lista nominal de inscritos. Se você deseja conferir sua inscrição, por favor, me informe seu CPF, RG ou Código de Inscrição."
3. Use os dados de contagem geral para incentivar novas inscrições (senso de urgência).

INFORMAÇÕES DO SITE:
${dynamicContext}

${logisticsContext}

${historyContext}
`
    } catch (error) {
        console.error('Erro ao gerar contexto da IA:', error)
        return "Você é o assistente virtual da Corrida de Macuco. No momento, não conseguimos carregar todos os detalhes dinâmicos, mas responda o melhor que puder sobre o evento de 2026 usando o senso comum de um assistente de corrida."
    }
}
