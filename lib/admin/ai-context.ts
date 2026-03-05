import { createServiceClient } from '@/lib/supabase/serverClient'

/**
 * GAVETA 1: REGRAS DE PRIVACIDADE E SEGURANÇA (ESTÁTICA)
 */
export const PRIVACY_DRAWER = `
DIRETIVA DE SEGURANÇA MÁXIMA E PRIVACIDADE (LGPD):
1. Você é um assistente virtual que preza pela segurança dos dados.
2. Dados Nominais Sensíveis: Você NUNCA deve mostrar CPFs, RGs ou e-mails nas respostas.
3. Consulta Individual: Para ver dados detalhados ou corrigir informações, direcione o usuário para a página de [Acompanhar Inscrição](/inscricao/acompanhar).
4. Lista Pública de Inscritos: É PERMITIDO informar que existe uma lista pública de confirmados na página [Lista de Inscritos](/inscricao/lista). 
5. Respeite sempre a privacidade: Não divulgue dados privados de terceiros, apenas aponte para as páginas oficiais onde as informações públicas estão disponíveis.
`

/**
 * GAVETA 2: LOGÍSTICA, REGRAS E CATEGORIAS (2026)
 */
export const LOGISTICS_DRAWER = `
LOGÍSTICA E REGRAS:
- Local da Largada/Chegada: Praça Central de Macuco, RJ.
- Inscrições: Até o dia anterior à prova (sujeito a alteração).
- Cancelamento/Transferência: Não é permitido reembolso ou transferência de inscrição.
- PCD (Pessoas com Deficiência): Inscrição GRATUITA. O atleta deve entrar em contato com os organizadores para receber seu ingresso.

VALORES E PAGAMENTO:
- Categoria 10K: R$ 22,00 (Pagamento SOMENTE via PIX).
- Categorias Gratuitas: Infantil, Morador de Macuco (conforme regra abaixo), 60+ e PCD.

CRONOGRAMA OFICIAL (2026):
- 08:00: Início da Concentração na Arena.
- 10:00: Largada da Corrida Infantil (Percurso de 2,5km).
- 12:00: Largada Oficial 10K (Atletas a partir de 15 anos).
- 13:30: Cerimônia de Premiação (Previsão).
- 15:00: Encerramento do Evento.

CATEGORIAS E REGRAS DE PROVA:
- Geral 10k, 60+ 10k, Morador de Macuco 10k. (Não há percurso de 5k).
- PCD: Não possui categoria específica; competem no Geral.
- Hidratação: Postos de água a cada 2km (km 2, 4, 6, 8) e na chegada.
- Guarda-Volumes: NÃO haverá serviço de guarda-volumes no local.
- Alimentação: Lanche leve/frutas disponível ANTES do início da prova (sujeito a disponibilidade, sem kit pós-prova garantido).
- Resultados: Disponíveis no site da empresa de cronometragem e, posteriormente, em nosso site oficial.

CONTATOS PARA DÚVIDAS E PCD:
- Suporte/Michell: WhatsApp (21) 96868-6880.
- Thiago (Organizador): WhatsApp (21) 98382-1217.
`

/**
 * GAVETA 3: PREMIAÇÕES E TROFÉUS (ESTÁTICA)
 */
export const AWARDS_DRAWER = `
PREMIAÇÃO TOTAL: Mais de R$ 20.000,00 em dinheiro e troféus.

PREMIAÇÃO GERAL 10K (MASCULINO E FEMININO):
- 1º: R$ 5.000,00 + Troféu General Atrantino Côrtes Coutinho
- 2º: R$ 2.000,00 + Troféu Deputado José Carlos Pires Coutinho
- 3º: R$ 1.500,00 + Troféu Atrantino Pires Coutinho
- 4º: R$ 800,00 + Troféu Doutor Junot Abi-Ramia Antônio
- 5º: R$ 600,00 + Troféu Prefeito José Carlos Boaretto
- 6º ao 7º: R$ 500,00 (6º) e R$ 400,00 (7º) + Troféus
- 8º ao 10º: R$ 300,00 (8º) e R$ 200,00 (9º/10º) + Troféus

ATLETAS DE MACUCO (MASCULINO E FEMININO):
- Premiação do 1º (R$ 1.000,00) ao 10º colocado (R$ 100,00).

FAIXAS ETÁRIAS (A partir de 15 anos):
- 1º: Troféu + R$ 200,00 | 2º: R$ 150,00 | 3º: R$ 100,00.

CATEGORIA INFANTIL (2,5 KM):
- Premiação do 1º (R$ 250,00) até o 10º colocado.

MEDALHAS: Entregues a TODOS os atletas que terminarem a prova.
`

/**
 * GAVETA 4: HISTÓRIA E CONTEXTO (ESTÁTICA)
 */
export const HISTORY_DRAWER = `
HISTÓRIA DO EVENTO:
A Corrida Rústica de São João Batista nasceu em 1974 em Macuco-RJ. 
Em 2026 acontece a 51ª edição, consolidada como uma das mais tradicionais do estado.

ORGANIZAÇÃO:
O evento é organizado pela Comissão Organizadora da Corrida Rústica de Macuco, com apoio total da Prefeitura Municipal e patrocinadores oficiais.
NÃO existe vínculo de organização com a "Associação Atlética Macuco (AAM)". Esta informação está INCORRETA se mencionada.
`

/**
 * GAVETA 5: MAPA DO SITE E LINKS
 */
export const SITE_MAP_DRAWER = `
LINKS ÚTEIS:
- Inscrição (Fazer Nova): [/inscricao](/inscricao)
- Lista de Inscritos (Consulta Pública): [/inscricao/lista](/inscricao/lista)
- Acompanhar / Ver Minha Inscrição: [/inscricao/acompanhar](/inscricao/acompanhar)
- Premiações Detalhadas: [/premiacoes](/premiacoes)
- Regulamento: [/regulamento](/regulamento)
- Percursos: [/percursos](/percursos)
`

/**
 * Busca ou cria registro de uso da IA para um CPF
 */
export async function getAiUsage(cpf: string, fullName?: string) {
    try {
        const supabase = createServiceClient()
        const cleanCpf = cpf.replace(/\D/g, '')

        const { data: usageData, error: usageError } = await supabase
            .from('ai_usage')
            .select('*')
            .eq('cpf', cleanCpf)
            .limit(1)

        const usage = usageData?.[0]

        if (usageError) {
            console.error('Erro ao buscar uso da IA:', usageError)
            return { cpf: cleanCpf, full_name: fullName || 'Visitante', message_count: 0, isAdmin: cleanCpf === process.env.ADMIN_CHAT_CPF }
        }

        const now = new Date()
        const isAdmin = cleanCpf === process.env.ADMIN_CHAT_CPF

        if (!usage) {
            const { data: newUsage } = await supabase
                .from('ai_usage')
                .insert({
                    cpf: cleanCpf,
                    full_name: fullName || 'Visitante',
                    message_count: 0,
                    last_message_at: now.toISOString()
                })
                .select()
                .single()
            return { ...newUsage, isAdmin }
        }

        const lastMessage = new Date(usage.last_message_at)
        const today = now.toISOString().split('T')[0]
        const lastDay = lastMessage.toISOString().split('T')[0]

        if (today !== lastDay) {
            const { data: resetUsage } = await supabase
                .from('ai_usage')
                .update({ message_count: 0, last_message_at: now.toISOString() })
                .eq('cpf', cleanCpf)
                .select()
                .single()
            return { ...resetUsage, isAdmin }
        }

        return { ...usage, isAdmin }
    } catch (error) {
        console.error('Erro ao buscar uso da IA:', error)
        return null
    }
}

/**
 * Incrementa o contador de mensagens
 */
export async function incrementAiUsage(cpf: string) {
    try {
        const supabase = createServiceClient()
        const cleanCpf = cpf.replace(/\D/g, '')

        if (cleanCpf === process.env.ADMIN_CHAT_CPF) return

        const { data: current } = await supabase.from('ai_usage').select('message_count').eq('cpf', cleanCpf).single();
        await supabase.from('ai_usage').update({
            message_count: (current?.message_count || 0) + 1,
            last_message_at: new Date().toISOString()
        }).eq('cpf', cleanCpf);
    } catch (error) {
        console.error('Erro ao incrementar uso:', error)
    }
}

/**
 * Função para buscar dados dinâmicos que NÃO devem ser cacheados por muito tempo
 * (Vagas, contagem de inscritos, resultados de busca)
 */
export async function getDynamicContext(searchQuery?: string) {
    try {
        const supabase = createServiceClient()

        // 1. Buscar dados do Evento
        const { data: event } = await supabase
            .from('events')
            .select('*')
            .eq('year', 2026)
            .single()

        if (!event) {
            console.log(`DEBUG DYNAMIC CONTEXT: Evento 2026 não encontrado no ano 2026.`)
            return "Informação: Evento de 2026 em planejamento."
        }
        console.log(`DEBUG DYNAMIC CONTEXT: Evento = ${event.id}, query = ${searchQuery}`)

        // 2. Contagem de Atletas (Dinâmico)
        const { count: totalInscritos } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .in('status', ['confirmed', 'paid'])

        // Buscar ocupação por categoria
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, max_slots')
            .eq('event_id', event.id)
            .eq('is_active', true)

        let categoryStats = ""
        if (categories) {
            for (const cat of categories) {
                const { count } = await supabase
                    .from('registrations')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', cat.id)
                    .in('status', ['confirmed', 'paid'])

                const remaining = (cat.max_slots || 0) - (count || 0)
                categoryStats += `- ${cat.name}: ${remaining} vagas restantes.\n`
            }
        }

        // 3. Busca de Inscrição (Altamente Volátil)
        let searchResult = ""
        if (searchQuery) {
            const cleanQuery = searchQuery.replace(/[^\w]/g, '')

            // Tentativa 1: Busca direta na tabela de inscrições
            const { data: regByCodeData } = await supabase
                .from('registrations')
                .select('id, status, confirmation_code, registration_number, categories(name), athletes(full_name, document_number)')
                .eq('event_id', event.id)
                .or(`confirmation_code.eq.${searchQuery.toUpperCase()}, registration_number.eq.${searchQuery.toUpperCase()}, confirmation_code.eq.${searchQuery}, registration_number.eq.${searchQuery}`)
                .limit(1)

            let finalReg = regByCodeData?.[0]

            // Tentativa 2: Se não encontrou por código, busca por documento do atleta
            if (!finalReg && cleanQuery) {
                const { data: athletes } = await supabase
                    .from('athletes')
                    .select('id, full_name, document_number')
                    .eq('document_number', cleanQuery)

                if (athletes && athletes.length > 0) {
                    const athleteIds = athletes.map(a => a.id)
                    const { data: regByAthlete } = await supabase
                        .from('registrations')
                        .select('id, status, confirmation_code, registration_number, categories(name), athletes(full_name, document_number)')
                        .eq('event_id', event.id)
                        .in('athlete_id', athleteIds)
                        .limit(1)

                    finalReg = regByAthlete?.[0]
                    console.log(`DEBUG DYNAMIC CONTEXT: Tentativa 2 Result = ${finalReg ? 'Encontrada ✅' : 'Não encontrada ❌'}`)
                }
            }

            if (finalReg) {
                // Acesso resiliente a objeto ou array (Supabase joins)
                const athletesData = Array.isArray(finalReg.athletes) ? finalReg.athletes[0] : finalReg.athletes
                const categoriesData = Array.isArray(finalReg.categories) ? finalReg.categories[0] : finalReg.categories

                const athleteName = (athletesData as any)?.full_name || 'Atleta'
                const categoryName = (categoriesData as any)?.name || 'Geral'
                const regDoc = (athletesData as any)?.document_number
                const isConfirmed = ['confirmed', 'paid'].includes(finalReg.status)

                searchResult = `\nRESULTADO DA BUSCA DE INSCRIÇÃO: ENCONTRADA ✅\n - Atleta: ${athleteName}\n - CPF do Atleta: ${regDoc}\n - Status: ${isConfirmed ? 'CONFIRMADA ✅' : 'PENDENTE ⏳'} \n - Categoria: ${categoryName} \n - Código: ${finalReg.confirmation_code || finalReg.registration_number} \n - CPF / Código consultado: ${searchQuery} \n`
                console.log(`DEBUG DYNAMIC CONTEXT: Search Success for ${athleteName}`)
            } else {
                searchResult = `\nRESULTADO DA BUSCA DE INSCRIÇÃO: NÃO ENCONTRADA ❌\n - CPF / Código consultado: ${searchQuery} \n - Motivo: Nenhum registro vinculado ao evento de 2026 foi localizado para este documento.\n`
                console.log(`DEBUG DYNAMIC CONTEXT: Search Failed for ${searchQuery}`)
            }
        }

        return `
DADOS EM TEMPO REAL:
- Data da Prova: 24 /06 / 2026 às 08:00h.
- Status das Inscrições: ${event.registrations_open ? 'ABERTAS' : 'FECHADAS'}.
- Total de Atletas Confirmados: ${totalInscritos || 0}.
VAGAS POR CATEGORIA:
${categoryStats}
${searchResult}
`
    } catch (error) {
        return "Nota: O sistema de consulta em tempo real está em manutenção."
    }
}

/**
 * Helper para montar o prompt completo (usado como fallback ou base para o cache)
 */
export async function getFullContext(searchQuery?: string) {
    const dynamic = await getDynamicContext(searchQuery)
    return `
VOCÊ É O ASSISTENTE VIRTUAL DA 51ª CORRIDA DE MACUCO.

    ${PRIVACY_DRAWER}
${LOGISTICS_DRAWER}
${AWARDS_DRAWER}
${HISTORY_DRAWER}
${SITE_MAP_DRAWER}
${dynamic}

DIRETIVA DE RESPOSTA:
- Use Markdown para links: [Texto](/link).
- Use asteriscos para negrito em informações importantes(ex: * 24 /06 / 2026 *).
- Seja proativo em ajudar com a inscrição: [/inscricao](/inscricao).
- Responda de forma amigável, concisa e descontraída.Adote uma personalidade de "Coach" ou Treinador motivador: use frases como "Foco no treino!", "Você vai brilhar!", "Prepare o fôlego!".
- Use EMOJIS(🏃‍♂️, ✨, ✅, 📍, 🚀, ⏳) para tornar a conversa mais humana e animada.
- ATALHOS INTELIGENTES: Se responder sobre localização ou retirada de kit, pergunte se o usuário quer o link do Google Maps ou Waze.
- SENSO DE URGÊNCIA: Se o usuário perguntar sobre inscrições ou categorias, mencione o número de vagas restantes(se for baixo) para incentivar a inscrição imediata.
- ONISCIÊNCIA E NAVEGAÇÃO: Sempre que fornecer uma informação que tenha uma página dedicada no site(como percursos, premiações ou regulamento), finalize a resposta sugerindo o link direto da página para que o usuário veja mais detalhes.
`
}

/**
 * Busca a configuração global da IA (Provedor, Regulamento, Prompt)
 */
export async function getAiConfig() {
    try {
        const supabase = createServiceClient()

        // 1. Buscar evento de 2026
        const { data: event } = await supabase
            .from('events')
            .select('id')
            .eq('year', 2026)
            .single()

        if (!event) return null

        // 2. Buscar config vinculada ao evento
        const { data: config } = await supabase
            .from('ai_config')
            .select('ai_provider, regulation_text, system_prompt')
            .eq('event_id', event.id)
            .single()

        return config
    } catch (error) {
        console.error('Erro ao buscar configuração da IA:', error)
        return null
    }
}
