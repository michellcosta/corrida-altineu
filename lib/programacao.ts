// lib/programacao.ts - Dados da programação oficial (fonte única para /programacao e cards)

export const CRONOGRAMA_DIA_PROVA = [
  {
    horario: '09:00',
    horarioCard: '09h',
    titulo: 'Encerramento das inscrições da Corrida Infanto-Juvenil',
    tituloCard: 'Encerramento das inscrições presenciais da corrida 2,5K',
    local: 'Praça Prof. João Brasil (Secretaria da Prova)',
    descricao:
      'Último horário para confirmar participação presencialmente na prova de 2,5 km.',
    importante: true,
    destaque: false as boolean,
  },
  {
    horario: '10:00',
    horarioCard: '10h',
    titulo: 'Largada Corrida Infanto-Juvenil - 2,5 KM',
    tituloCard: 'Largada da Corrida Infanto-Juvenil 2,5K',
    local: 'Entrada do Goiabal',
    descricao:
      'Percurso até a Praça Prof. João Brasil, com chegada pelo portal oficial do evento.',
    destaque: true,
    importante: false as boolean,
  },
  {
    horario: '11:00',
    horarioCard: '11h',
    titulo: 'Concentração Geral e Aquecimento Guiado',
    tituloCard: 'Concentração geral e aquecimento guiado',
    local: 'Praça Prof. João Brasil',
    descricao:
      'Ponto de encontro dos atletas da prova principal com alongamento coletivo e orientações finais.',
    importante: false as boolean,
    destaque: false as boolean,
  },
  {
    horario: '11:15',
    horarioCard: '11h15',
    titulo: 'Traslado oficial para a largada do 10K',
    tituloCard: 'Traslado oficial para a largada do 10K',
    local: 'Praça Prof. João Brasil',
    descricao:
      'Condução oficial partindo da Praça Prof. João Brasil para os atletas inscritos na prova de 10 km.',
    importante: false as boolean,
    destaque: false as boolean,
  },
  {
    horario: '12:00',
    horarioCard: '12h',
    titulo: 'Largada Corrida de 10 KM',
    tituloCard: 'Largada da Prova 10K na Fábrica de Cimento Holcim',
    local: 'Fábrica de Cimento Holcim',
    descricao:
      'Saída oficial rumo à Praça Prof. João Brasil, em Macuco, com apoio logístico completo ao longo do trajeto.',
    destaque: true,
    importante: false as boolean,
  },
  {
    horario: '13:30',
    horarioCard: '13h30',
    titulo: 'Início da Premiação Geral, Local e por Faixas Etárias',
    tituloCard: 'Início da premiação geral, local e por faixas etárias',
    local: 'Palco Principal - Praça Prof. João Brasil',
    descricao:
      'Entrega de troféus, valores em dinheiro e reconhecimento às equipes com maior número de atletas.',
    importante: false as boolean,
    destaque: false as boolean,
  },
] as const

/** Itens essenciais para o card resumido (prova-10k, etc.) - exclui Concentração 11h para manter 5 itens principais */
export const CRONOGRAMA_ESSENCIAL_CARD = [
  { horario: '09h', titulo: 'Encerramento das inscrições presenciais da corrida 2,5K' },
  { horario: '10h', titulo: 'Largada da Corrida Infanto-Juvenil 2,5K' },
  { horario: '11h15', titulo: 'Traslado oficial para a largada do 10K' },
  { horario: '12h', titulo: 'Largada da Prova 10K na Fábrica de Cimento Holcim' },
  { horario: '13h30', titulo: 'Início da premiação geral, local e por faixas etárias' },
] as const
