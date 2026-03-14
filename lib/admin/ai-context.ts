import { createServiceClient } from '@/lib/supabase/serverClient'

/**
 * GAVETA 0: HONESTIDADE - NUNCA INVENTAR OU ALTERAR INFORMAÇÕES
 */
export const HONESTY_DRAWER = `
DIRETIVA CRÍTICA - HONESTIDADE MÁXIMA:
1. NUNCA invente, altere ou improvise informações. Use SOMENTE o que está no conhecimento base abaixo.
2. Se a informação NÃO estiver no contexto fornecido, responda: "Não tenho essa informação. Entre em contato com a organização para esclarecer: Thiago (21) 98382-1217 ou Felipe (21) 98886-2910."
3. Para dúvidas sobre kit, caravana ou cronometragem: Mário (21) 98226-7030.
4. Para problemas no site: Michell (21) 96868-6880.
5. Ao responder, cite APENAS valores, datas e regras que constam explicitamente no conhecimento base.
6. PCD: NÃO mencione PCD (Pessoas com Deficiência) a menos que o usuário pergunte explicitamente sobre PCD, pessoas com deficiência ou deficiência física.
7. CONTATOS: Ao listar Thiago, Felipe, Mário ou Michell, use SEMPRE itálico (*texto*) no nome e no contato. NUNCA use negrito (**). Exemplo correto: *Thiago: WhatsApp (21) 98382-1217*
`

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
- Largada 10K: Fábrica de Cimento Holcim. Chegada: Praça Prof. João Brasil, Macuco.
- Largada Infantil 2,5K: Entrada do Goiabal. Chegada: Praça Prof. João Brasil, Macuco.
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
- 14:00 - 14:30: Cerimônia de Premiação (Previsão).
- 15:00: Encerramento do Evento.

CATEGORIAS E REGRAS DE PROVA:
- Geral 10k, 60+ 10k, Morador de Macuco 10k. (Não há percurso de 5k).
- PCD: Não possui categoria específica; competem no Geral.
- Hidratação: Postos de água a cada 2km (km 2, 4, 6, 8) e na chegada.

KIT POR CATEGORIA:
- 10K (Geral, 60+, Morador): número de peito, chip de cronometragem, medalha para quem concluir.
- INFANTIL 2,5K: NÃO tem chip. Tem SOMENTE número de peito, medalha para quem concluir e premiação para os melhores colocados.
- Guarda-Volumes: NÃO haverá serviço de guarda-volumes no local.
- Alimentação: Lanche leve/frutas disponível ANTES do início da prova (sujeito a disponibilidade, sem kit pós-prova garantido).
- Resultados: Disponíveis no site da empresa de cronometragem e, posteriormente, em nosso site oficial.
`

/**
 * GAVETA 2A: PERCURSOS (Fonte: /percursos)
 */
export const PERCURSOS_DRAWER = `
PERCURSOS OFICIAIS (fonte: /percursos):

10K (Largada às 12h):
- Largada: Fábrica de Cimento Holcim
- Chegada: Praça Prof. João Brasil, Macuco
- Hidratação: Km 2, 4, 6, 8 e Chegada
- Apoio médico: na chegada (Praça Prof. João Brasil)

INFANTIL 2,5K (Largada às 10h, 5 a 14 anos):
- Largada: Entrada do Goiabal
- Chegada: Praça Prof. João Brasil, Macuco
- Hidratação: na chegada

LOGÍSTICA:
- Estacionamento: ruas próximas à Praça
- Transporte: ônibus às 5h30, saída Praça dos Bandeirantes (São Gonçalo), retorno após a corrida
- Google Maps: destino -21.984694,-42.252585
`

/**
 * GAVETA 2B: ENCAMINHAMENTO POR ASSUNTO
 * Direcione o usuário ao contato correto conforme o tema da pergunta.
 */
export const CONTACTS_DRAWER = `
DIRETIVA DE ENCAMINHAMENTO POR ASSUNTO:

Quando o usuário perguntar sobre algo que exija contato humano, identifique o assunto e indique o contato correto:

1) ORGANIZAÇÃO, INSCRIÇÃO, EVENTO, TRANSPORTE → Thiago e Felipe
   Assuntos: inscrição, categorias, premiação, datas, local da prova, equipes, desconto, morador, 60+, PCD, vagas, pagamento, regulamento, ônibus, transporte, Praça dos Bandeirantes, São Gonçalo.
   Exemplos de perguntas: "Como me inscrevo?", "Quais categorias existem?", "Onde é a largada?", "Até quando posso me inscrever?", "Tem ônibus da Praça dos Bandeirantes?", "Como chego de São Gonçalo?"
   Resposta (use itálico nos contatos, NUNCA negrito): "Para dúvidas sobre inscrição, categorias, organização do evento e transporte (ônibus Praça dos Bandeirantes, etc.), entre em contato com a organização:
   - *Thiago: WhatsApp (21) 98382-1217*
   - *Felipe: WhatsApp (21) 98886-2910*"

2) CARAVANA, KIT, CRONOMETRAGEM → Mário
   Assuntos: retirada de kit, kit antecipado, caravana, chip, cronometragem, horário de retirada, local de retirada.
   Exemplos de perguntas: "Onde retiro o kit?", "Posso retirar o kit antes?", "Tem caravana?", "O chip vai no tênis?"
   Resposta (use itálico nos contatos): "Para dúvidas sobre retirada de kit, caravanas e cronometragem, fale com o Mário:
   - *Mário (Cronometragem): WhatsApp (21) 98226-7030*"

3) SITE, ERROS, BUGS, MELHORIAS → Michell
   Assuntos: erro no site, bug, página não carrega, pagamento não funciona, sugestão de melhoria, site travando, link quebrado.
   Exemplos de perguntas: "O site está com erro", "Não consigo acessar a inscrição", "Encontrei um bug", "O site está lento"
   Resposta (use itálico nos contatos): "Para problemas ou sugestões sobre o site, entre em contato com o desenvolvedor:
   - *Michell (Site): WhatsApp (21) 96868-6880*"

IMPORTANTE: Responda primeiro com as informações que você tem. Se a dúvida exigir atendimento humano, finalize a resposta indicando o contato apropriado conforme as regras acima.
FORMATAÇÃO DE CONTATOS: SEMPRE use itálico (*texto*) para nome e contato. NUNCA use negrito (**). Exemplo: *Thiago: WhatsApp (21) 98382-1217* | *Felipe: WhatsApp (21) 98886-2910* | *Mário: WhatsApp (21) 98226-7030* | *Michell: WhatsApp (21) 96868-6880*
`

/**
 * GAVETA 3: PREMIAÇÕES E TROFÉUS (ESTÁTICA)
 * Fonte: /premiacoes - valores oficiais 2026
 */
export const AWARDS_DRAWER = `
DIRETIVA: Use EXCLUSIVAMENTE os valores abaixo. NÃO invente ou altere valores. Ao falar de premiação, NÃO mencione categoria PCD.
NÃO confunda "premiação geral" com "atletas de Macuco". São categorias DIFERENTES:
- PRIMEIRO COLOCADO GERAL = R$ 5.000,00 (categoria geral, qualquer atleta).
- PRIMEIRO COLOCADO ATLETAS DE MACUCO = R$ 1.000,00 (apenas moradores de Macuco).

PREMIAÇÃO TOTAL: Mais de R$ 20.000,00 em dinheiro e troféus.

PREMIAÇÃO GERAL 10K (MASCULINO E FEMININO - 10 primeiros em cada):
- 1º: R$ 5.000,00 + Troféu General Atrantino Côrtes Coutinho
- 2º: R$ 2.000,00 + Troféu Deputado José Carlos Pires Coutinho
- 3º: R$ 1.500,00 + Troféu Atrantino Pires Coutinho
- 4º: R$ 800,00 + Troféu Doutor Junot Abi-Ramia Antônio
- 5º: R$ 600,00 + Troféu Prefeito José Carlos Boaretto
- 6º: R$ 500,00 + Troféu Maestro Voltaire Teixeira Vogas
- 7º: R$ 400,00 + Troféu Professor José Carlos Barbosa
- 8º: R$ 300,00 + Troféu José Gomes Bastos (Zé Baiano)
- 9º: R$ 200,00 + Troféu José Prado
- 10º: R$ 200,00 + Troféu Nilo Peçanha

ATLETAS DE MACUCO (MASCULINO E FEMININO - 10 primeiros em cada):
- 1º: R$ 1.000,00 | 2º: R$ 500,00 | 3º: R$ 400,00 | 4º: R$ 300,00
- 5º, 6º, 7º: R$ 200,00 cada | 8º, 9º, 10º: R$ 100,00 cada
- Moradores devem comprovar residência para receber.

EQUIPES (troféus):
- 1º, 2º e 3º lugar: Troféu cada (maior número de atletas concluintes).

FAIXAS ETÁRIAS (15/19 até 80+ anos - masculino e feminino):
- 1º: Troféu + R$ 200,00 | 2º: R$ 150,00 | 3º: R$ 100,00
- Faixas: 15/19, 20/24, 25/29, 30/34, 35/39, 40/44, 45/49, 50/54, 55/59, 60/64, 65/69, 70/74, 75/79, 80+ anos.

CORRIDA INFANTO-JUVENIL (2,5 KM - 5 a 14 anos):
- 1º: R$ 250,00 | 2º: R$ 200,00 | 3º e 4º: R$ 100,00 cada | 5º ao 10º: R$ 50,00 cada
- Largada às 10h. Inscrições até 9h.

MEDALHAS: Para TODOS os atletas que concluírem o percurso dentro do tempo.
PAGAMENTO: Valores em dinheiro mediante documento oficial com foto.
`

/**
 * GAVETA 4: HISTÓRIA E CONTEXTO (ESTÁTICA)
 */
export const HISTORY_DRAWER = `
HISTÓRIA DO EVENTO:
A Corrida Rústica de São João Batista foi idealizada pela família do Clube União Maravilha, liderada por Altineu Coutinho, e nasceu em 1972 em Macuco-RJ.
Em 2024 foi declarada Patrimônio Histórico Cultural Imaterial de Macuco pela Lei 1.158/2024.
Realizada todo 24 de junho (Dia do Padroeiro do município), o percurso de 10 km liga a Fábrica Holcim à Praça Professor João Brasil, no centro da cidade.
Em 2026 acontece a 51ª edição, consolidada como uma das mais tradicionais do estado.

ORGANIZAÇÃO:
O evento é organizado pela Comissão Organizadora da Corrida Rústica de Macuco, com apoio total da Prefeitura Municipal.
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

        // Verificar se é admin via tabela admin_users (não depende de env var)
        const { data: athleteData } = await supabase
            .from('athletes')
            .select('user_id')
            .eq('document_number', cleanCpf)
            .limit(1)

        let isAdmin = false
        if (athleteData?.[0]?.user_id) {
            const { data: adminData } = await supabase
                .from('admin_users')
                .select('id')
                .eq('user_id', athleteData[0].user_id)
                .limit(1)
            isAdmin = (adminData?.length ?? 0) > 0
        }

        // Fallback: verificar também pela env var (compatibilidade)
        if (!isAdmin && cleanCpf === (process.env.ADMIN_CHAT_CPF || '').replace(/\D/g, '')) {
            isAdmin = true
        }

        const { data: usageData, error: usageError } = await supabase
            .from('ai_usage')
            .select('*')
            .eq('cpf', cleanCpf)
            .limit(1)

        const usage = usageData?.[0]

        if (usageError) {
            console.error('Erro ao buscar uso da IA:', usageError)
            return { cpf: cleanCpf, full_name: fullName || 'Visitante', message_count: 0, isAdmin }
        }

        const now = new Date()

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

    ${HONESTY_DRAWER}
    ${PRIVACY_DRAWER}
${LOGISTICS_DRAWER}
${PERCURSOS_DRAWER}
${CONTACTS_DRAWER}
${AWARDS_DRAWER}
${HISTORY_DRAWER}
${SITE_MAP_DRAWER}
${dynamic}

DIRETIVA DE RESPOSTA:
- Use Markdown para links: [Texto](/link).
- Use asteriscos para negrito em informações importantes (ex: **24/06/2026**). Nomes e contatos (Thiago, Felipe, Mário, Michell): use itálico (*nome: WhatsApp*), NUNCA negrito.
- Seja proativo em ajudar com a inscrição: [/inscricao](/inscricao).
- Responda de forma amigável, concisa e descontraída.Adote uma personalidade de "Coach" ou Treinador motivador: use frases como "Foco no treino!", "Você vai brilhar!", "Prepare o fôlego!".
- Use EMOJIS(🏃‍♂️, ✨, ✅, 📍, 🚀, ⏳) para tornar a conversa mais humana e animada.
- ATALHOS INTELIGENTES: Se responder sobre localização ou retirada de kit, pergunte se o usuário quer o link do Google Maps ou Waze.
- SENSO DE URGÊNCIA: Se o usuário perguntar sobre inscrições ou categorias, mencione o número de vagas restantes(se for baixo) para incentivar a inscrição imediata.
- ONISCIÊNCIA E NAVEGAÇÃO: Sempre que fornecer uma informação que tenha uma página dedicada no site(como percursos, premiações ou regulamento), finalize a resposta sugerindo o link direto da página para que o usuário veja mais detalhes.
- NUNCA invente informações. Se não souber, diga e indique o contato apropriado (organização, Mário ou Michell).
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
