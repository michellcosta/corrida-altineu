// lib/constants.ts - Configurações principais do evento

export const CONTACT_EMAIL = 'corridarusticamacuco@gmail.com'

export const RACE_CONFIG = {
  year: 2026,
  // Datas em fuso local (meses 0-based)
  raceDate: new Date(2026, 5, 24), // 24 de junho de 2026
  registrationOpenDate: '15 de outubro de 2025',
  registrationCloseDate: '20 de junho de 2026',
  edition: 51,
  name: 'Corrida Rústica de Macuco',
  get raceDateFormatted() {
    return this.raceDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  },
}

export const CATEGORIES = {
  geral: {
    id: 'geral',
    name: 'Geral 10K',
    slug: 'geral-10k',
    distance: '10 quilômetros',
    price: 20,
    isFree: false,
    ageRule: `Quem completa 15 anos até 31/12/${RACE_CONFIG.year}`,
    color: 'from-blue-600 to-cyan-600',
    description: 'Categoria principal para atletas a partir de 15 anos.',
    requirements: [
      'RG ou CPF',
      'Nome da equipe (opcional)',
      'WhatsApp',
      'Sexo e data de nascimento',
      'Nacionalidade',
    ],
  },
  morador: {
    id: 'morador',
    name: 'Morador de Macuco 10K',
    slug: 'morador-10k',
    distance: '10 quilômetros',
    price: 0,
    isFree: true,
    ageRule: `Quem completa 15 anos até 31/12/${RACE_CONFIG.year}`,
    color: 'from-green-600 to-emerald-600',
    description: 'Categoria gratuita exclusiva para moradores da cidade.',
    requirements: [
      'RG ou CPF',
      'Comprovante de residência em Macuco',
      'Documento com foto',
      'Contato de WhatsApp',
    ],
  },
  sessenta: {
    id: 'sessenta',
    name: '60+ 10K',
    slug: '60-mais-10k',
    distance: '10 quilômetros',
    price: 0,
    isFree: true,
    ageRule: `60 anos ou mais até 31/12/${RACE_CONFIG.year}`,
    color: 'from-purple-600 to-pink-600',
    description: 'Categoria gratuita para atletas com 60 anos ou mais.',
    requirements: [
      'RG ou CPF',
      'Atestado médico recomendado',
      'Contato de WhatsApp',
    ],
  },
  infantil: {
    id: 'infantil',
    name: 'Infantil 2.5K',
    slug: 'infantil-2k',
    distance: '2,5 quilômetros',
    price: 0,
    isFree: true,
    ageRule: `Atletas de 5 a 14 anos em ${RACE_CONFIG.year}`,
    color: 'from-yellow-500 to-orange-500',
    description: 'Percurso seguro de 2,5 km para crianças e adolescentes.',
    requirements: [
      'RG ou certidão de nascimento',
      'Autorização assinada pelo responsável',
      'Contato do responsável',
    ],
  },
} as const
