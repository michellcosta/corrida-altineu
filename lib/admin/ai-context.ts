import { createServiceClient } from '@/lib/supabase/serverClient'

/**
 * GAVETA 1: REGRAS DE PRIVACIDADE E SEGURANÇA (ESTÁTICA)
 */
export const PRIVACY_DRAWER = `
DIRETIVA DE SEGURANÇA MÁXIMA E PRIVACIDADE (LGPD):
1. Você é um assistente virtual que preza pela segurança dos dados.
2. Você SÓ tem permissão para fornecer informações de inscrição para o usuário que está logado (identificado pelo CPF no contexto).
3. Se o usuário perguntar por dados de TERCEIROS (outras pessoas), recuse firmemente: "Por questões de privacidade e segurança (LGPD), não tenho permissão para acessar ou divulgar dados nominais de outros participantes."
4. NUNCA mostre CPFs, RGs ou e-mails nas respostas.
5. O atleta tem autonomia total para corrigir seus próprios dados na página "Acompanhar Inscrição".

DIRETIVA DE BUSCA DE INSCRIÇÃO:
1. Quando o usuário perguntar "Estou inscrito?", "Verificar minha inscrição" ou similar:
   - Olhe primeiro o resultado da busca vinculado ao CPF logado (${userCpf}) no bloco "DADOS EM TEMPO REAL".
   - Se a inscrição for ENCONTRADA, informe: Nome (apenas o primeiro nome e inicial do sobrenome para segurança), Categoria e Status (Confirmada/Pendente).
   - Se NÃO for encontrada para o CPF logado, diga: "Não localizei uma inscrição com o CPF do seu acesso. Você possui um RG ou Código de Inscrição para que eu tente uma nova busca?"
2. Se o usuário fornecer um RG ou Código manualmente:
   - Use o resultado da busca que aparecerá no contexto dinâmico.
   - Se encontrar, mostre apenas Nome, Categoria e Status.
3. Se após as tentativas nada for encontrado, sugira que ele verifique os dados ou faça a inscrição em [/inscricao](/inscricao).
`

/**
 * GAVETA 2: LOGÍSTICA E FAQ (ESTÁTICA)
 */
export const LOGISTICS_DRAWER = `
LOGÍSTICA E LOCALIZAÇÃO:
- Local da Largada: Praça Central de Macuco, RJ (R. Dr. Mario Freire Martins, 194, Centro).
- Link Google Maps: [Abrir no Google Maps](https://www.google.com/maps/dir/?api=1&destination=R.+Dr.+Mario+Freire+Martins+194+Centro+Macuco+RJ)
- Link Waze: [Abrir no Waze](https://waze.com/ul?q=R.+Dr.+Mario+Freire+Martins+194+Centro+Macuco+RJ&navigate=yes)
- Estacionamento: Gratuito nas ruas próximas à Praça de Macuco.

CONTATOS E SUPORTE:
- Suporte Geral: WhatsApp (21) 96868-6880 (Atendimento em até 24h úteis).
- Thiago (Organizador): WhatsApp (21) 98382-1217
- Felipe (Organização): WhatsApp (21) 98886-2910
- Mário (Cronometragem): WhatsApp (21) 98226-7030
- Michell (Site/Técnico): WhatsApp (21) 96868-6880

CRONOGRAMA DETALHADO (2026):
- 08:00: Largada Oficial (10K e 5K).
- 09:30: Início da Corrida Kids.
- 10:30: Cerimônia de Premiação.
- 12:00: Encerramento do Evento.

RETIRADA DE KITS:
- Local: Praça de Macuco.
- Horário: No dia da prova (24/06/2026), das 08:00 às 11:00 da manhã.
- Documentos: Documento original com foto e comprovante de inscrição.
- REGRA PARA MORADORES DE MACUCO: É OBRIGATÓRIO apresentar um comprovante de residência atualizado para validar a gratuidade da inscrição. Sem o comprovante, o kit não será entregue.
- Terceiros: Autorização assinada, cópia do documento e comprovante de inscrição do atleta.

ITENS DO KIT E REGRAS:
- Chip: OBRIGATORIAMENTE fixado no tênis.
- Número de Peito: Parte frontal da camiseta.
- Hidratação: A cada 2 km e na chegada.
- Pagamento: SOMENTE PIX.
`

/**
 * GAVETA 3: HISTÓRIA E CONTEXTO (ESTÁTICA)
 */
export const HISTORY_DRAWER = `
HISTÓRIA DO EVENTO:
A Corrida Rústica de São João Batista nasceu in 1974 em Macuco-RJ. 
Em 2026 acontece a 51ª edição, mantendo a tradição com inovação e premiação total de mais de R$ 20.000,00.
`

/**
 * GAVETA 4: MAPA DO SITE E LINKS (ESTÁTICA)
 */
export const SITE_MAP_DRAWER = `
LINKS ÚTEIS DO SITE (Sempre que possível, direcione o usuário para estas páginas):
- Inscrição: [/inscricao](/inscricao)
- Acompanhar Inscrição: [/inscricao/acompanhar](/inscricao/acompanhar)
- Regulamento Oficial: [/regulamento](/regulamento)
- Percursos e Mapas: [/percursos](/percursos)
- Premiações: [/premiacoes](/premiacoes)
- Perguntas Frequentes (FAQ): [/faq](/faq)
- Central de Ajuda: [/ajuda](/ajuda)
- Resultados (Pós-prova): [/resultados](/resultados)
- Galeria de Fotos: [/galeria](/galeria)
`

/**
 * Busca ou cria registro de uso da IA para um CPF
 */
export async function getAiUsage(cpf: string, fullName?: string) {
    try {
        const supabase = createServiceClient()
        const cleanCpf = cpf.replace(/\D/g, '')

        // 1. Tentar buscar uso existente
        const { data: usage, error: usageError } = await supabase
            .from('ai_usage')
            .select('*')
            .eq('cpf', cleanCpf)
            .maybeSingle()

        if (usageError) {
            console.error('Erro ao buscar uso da IA:', usageError)
            return { cpf: cleanCpf, full_name: fullName || 'Visitante', message_count: 0, isAdmin: cleanCpf === process.env.ADMIN_CHAT_CPF }
        }

        const now = new Date()
        const isAdmin = cleanCpf === process.env.ADMIN_CHAT_CPF

        // 2. Se não existe, criar
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

        // 3. Verificar se precisa resetar o contador (24h)
        const lastMessage = new Date(usage.last_message_at)
        const diffHours = (now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60)

        if (diffHours >= 24) {
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

        if (!event) return "Informação: Evento de 2026 em planejamento."

        // 2. Contagem de Atletas (Dinâmico)
        const { count: totalInscritos } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'confirmed')

        // Buscar ocupação por categoria
        const { data: categories } = await supabase
            .from('categories')
            .select('name, max_slots')
            .eq('event_id', event.id)
            .eq('is_active', true)

        let categoryStats = ""
        if (categories) {
            for (const cat of categories) {
                const { count } = await supabase
                    .from('registrations')
                    .select('*', { count: 'exact', head: true })
                    .eq('category_id', (cat as any).id)
                    .eq('status', 'confirmed')
                
                const remaining = (cat.max_slots || 0) - (count || 0)
                categoryStats += `- ${cat.name}: ${remaining} vagas restantes.\n`
            }
        }

        // 3. Busca de Inscrição (Altamente Volátil)
        let searchResult = ""
        if (searchQuery) {
            const cleanQuery = searchQuery.replace(/[^\w]/g, '')
            
            // Tentativa 1: Busca direta na tabela de inscrições
            const { data: regByCode } = await supabase
                .from('registrations')
                .select('id, status, confirmation_code, registration_number, categories(name), athletes(full_name, document_number)')
                .eq('event_id', event.id)
                .or(`confirmation_code.eq.${searchQuery.toUpperCase()},registration_number.eq.${searchQuery.toUpperCase()},confirmation_code.eq.${searchQuery},registration_number.eq.${searchQuery}`)
                .maybeSingle()

            let finalReg = regByCode

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
                        .maybeSingle()
                    
                    finalReg = regByAthlete
                }
            }

            if (finalReg) {
                const athleteName = (finalReg.athletes as any)?.full_name || 'Atleta'
                const categoryName = Array.isArray(finalReg.categories) ? (finalReg.categories[0] as any)?.name : (finalReg.categories as any)?.name
                const regDoc = (finalReg.athletes as any)?.document_number
                searchResult = `\nRESULTADO DA BUSCA DE INSCRIÇÃO: ENCONTRADA ✅\n- Atleta: ${athleteName}\n- CPF do Atleta: ${regDoc}\n- Status: ${finalReg.status === 'confirmed' ? 'CONFIRMADA ✅' : 'PENDENTE ⏳'}\n- Categoria: ${categoryName || 'Geral'}\n- Código: ${finalReg.confirmation_code || finalReg.registration_number}\n- CPF/Código consultado: ${searchQuery}\n`
            } else {
                searchResult = `\nRESULTADO DA BUSCA DE INSCRIÇÃO: NÃO ENCONTRADA ❌\n- CPF/Código consultado: ${searchQuery}\n- Motivo: Nenhum registro vinculado ao evento de 2026 foi localizado para este documento.\n`
            }
        }

        return `
DADOS EM TEMPO REAL:
- Data da Prova: 24/06/2026 às 08:00h.
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
${HISTORY_DRAWER}
${dynamic}

DIRETIVA DE RESPOSTA:
- Use Markdown para links: [Texto](/link).
- Use asteriscos para negrito em informações importantes (ex: *24/06/2026*).
- Seja proativo em ajudar com a inscrição: [/inscricao](/inscricao).
- Responda de forma amigável, concisa e descontraída. Adote uma personalidade de "Coach" ou Treinador motivador: use frases como "Foco no treino!", "Você vai brilhar!", "Prepare o fôlego!".
- Use EMOJIS (🏃‍♂️, ✨, ✅, 📍, 🚀, ⏳) para tornar a conversa mais humana e animada.
- ATALHOS INTELIGENTES: Se responder sobre localização ou retirada de kit, pergunte se o usuário quer o link do Google Maps ou Waze.
- SENSO DE URGÊNCIA: Se o usuário perguntar sobre inscrições ou categorias, mencione o número de vagas restantes (se for baixo) para incentivar a inscrição imediata.
- ONISCIÊNCIA E NAVEGAÇÃO: Sempre que fornecer uma informação que tenha uma página dedicada no site (como percursos, premiações ou regulamento), finalize a resposta sugerindo o link direto da página para que o usuário veja mais detalhes.
`
}
