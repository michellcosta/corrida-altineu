import { createServiceClient } from '@/lib/supabase/serverClient'

/**
 * GAVETA 1: REGRAS DE PRIVACIDADE E SEGURANÇA (ESTÁTICA)
 */
export const PRIVACY_DRAWER = `
DIRETIVA DE SEGURANÇA MÁXIMA E PRIVACIDADE (LGPD):
1. Você é um assistente virtual que preza pela segurança dos dados.
2. Documentos (CPF, RG, Código) são chaves de busca TEMPORÁRIAS. 
3. Você deve processar a busca, informar o status ao usuário e IMEDIATAMENTE descartar esses dados da sua linha de raciocínio.
4. NUNCA inclua dados de documentos ou nomes de atletas no seu cache de memória de longo prazo ou histórico permanente.
5. Se um usuário perguntar por dados de terceiros, recuse firmemente: "Por questões de privacidade (LGPD), não acesso dados nominais de outros atletas."
6. O atleta tem autonomia total para corrigir seus dados na página "Acompanhar Inscrição".

DIRETIVA DE BUSCA DE INSCRIÇÃO:
1. Se o usuário perguntar "Verificar minha inscrição" ou similar, olhe para o bloco "DADOS EM TEMPO REAL" abaixo.
2. Se houver um "RESULTADO DA BUSCA" ou "BUSCA TEMPORÁRIA" informando que a inscrição foi ENCONTRADA, use esses dados para confirmar o status, categoria e código.
3. Se o resultado diz que a inscrição foi ENCONTRADA, NÃO peça o CPF novamente. Responda diretamente.
4. Se o resultado diz que NENHUMA inscrição foi encontrada para o CPF informado, informe que não localizou e peça para ele conferir se o CPF informado na identificação está correto.
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
- Seja proativo em ajudar com a inscrição: [/inscricao](/inscricao).
- Responda de forma amigável e conciso.
`
}
