// lib/cms/sample-data.ts - Dados de exemplo da home atual convertidos para JSON

import { z } from 'zod'
import { Page, GlobalConfigSchema } from './schemas'

export const HOME_PAGE_DATA: Page = {
  id: 'home-2026',
  slug: '',
  title: '51ª Grande Corrida Rústica de São João Batista | Inscrições Abertas',
  metaDescription: 'Participe da 51ª edição da tradicional Corrida Rústica de São João Batista. 4 categorias: Geral 10K (R$ 22), Morador 10K, 60+ e Infantil 2.5K (gratuitas). Inscreva-se já!',
  ogImage: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2574',
  status: 'published',
  publishedAt: new Date().toISOString(),
  createdBy: 'system',
  updatedAt: new Date().toISOString(),
  sections: [
    // Hero
    {
      type: 'hero',
      headline: '51ª Grande Corrida Rústica de São João Batista',
      subheadline: '51ª edição • Tradição desde 1972',
      description: 'Junte-se a milhares de atletas na corrida mais querida da região.',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2574',
        alt: 'Corrida de rua'
      },
      ctaPrimary: {
        label: 'Inscrever-se Agora',
        href: '/inscricao',
        variant: 'primary',
        target: '_self',
      },
      ctaSecondary: {
        label: 'Acompanhar Inscrição',
        href: '/inscricao/acompanhar',
        variant: 'secondary',
        target: '_self',
      },
      badges: [
        { text: 'Inscrições Abertas - 2026', color: 'blue' },
      ],
      stats: [
        { value: '51', label: 'Edições' },
        { value: '5.000+', label: 'Atletas Esperados' },
        { value: '4', label: 'Categorias' },
        { value: '3', label: 'Categorias Gratuitas' },
      ],
    },
    
    // Countdown
    {
      type: 'countdown',
      title: 'Faltam Apenas',
      subtitle: 'Para a largada da 51ª Grande Corrida Rústica de São João Batista',
      targetDate: '2026-06-24T11:00:00.000Z',
      backgroundColor: 'gradient-primary',
    },
    
    // Categories
    {
      type: 'cards',
      title: 'Escolha Sua Categoria',
      subtitle: 'Temos opções para todos os perfis: do atleta competitivo às famílias que querem se divertir juntas',
      layout: 'grid-4',
      cards: [
        {
          id: 'geral',
          icon: '🏃',
          title: 'Geral 10K',
          description: 'Categoria principal para atletas a partir de 15 anos',
          badge: { text: 'Mais Popular', color: 'blue' },
          price: 'R$ 22,00',
          isFree: false,
          details: [
            '10 quilômetros',
            'Quem completa 15 anos até 31/12/2026',
            '500 vagas',
          ],
          cta: {
            label: 'Inscrever-se',
            href: '/inscricao?categoria=geral',
            variant: 'primary',
            target: '_self',
          },
        },
        {
          id: 'morador',
          icon: '🏘️',
          title: 'Morador de Macuco 10K',
          description: 'Categoria GRATUITA para moradores de Macuco',
          badge: { text: 'Gratuito', color: 'green' },
          price: 'GRATUITO',
          isFree: true,
          details: [
            '10 quilômetros',
            'Mesma idade do Geral',
            '200 vagas',
            'Comprovante de residência',
          ],
          cta: {
            label: 'Inscrever-se',
            href: '/inscricao?categoria=morador',
            variant: 'primary',
            target: '_self',
          },
        },
        {
          id: 'sessenta',
          icon: '👴',
          title: '60+ 10K',
          description: 'Categoria GRATUITA para atletas 60+',
          badge: { text: 'Gratuito', color: 'purple' },
          price: 'GRATUITO',
          isFree: true,
          details: [
            '10 quilômetros',
            '60 anos ou mais até 31/12/2026',
            '100 vagas',
          ],
          cta: {
            label: 'Inscrever-se',
            href: '/inscricao?categoria=sessenta',
            variant: 'primary',
            target: '_self',
          },
        },
        {
          id: 'infantil',
          icon: '👶',
          title: 'Infantil 2.5K',
          description: 'Categoria GRATUITA para crianças de 5 a 14 anos',
          badge: { text: 'Família', color: 'yellow' },
          price: 'GRATUITO',
          isFree: true,
          details: [
            '2,5 quilômetros',
            'Até 14 anos completos em 2026',
            '300 vagas',
          ],
          cta: {
            label: 'Inscrever-se',
            href: '/inscricao?categoria=infantil',
            variant: 'primary',
            target: '_self',
          },
        },
      ],
    },
    
    // Timeline (História)
    {
      type: 'timeline',
      title: 'Tradição desde 1972',
      subtitle: 'Mais de cinco décadas promovendo saúde, esporte e união em Macuco',
      milestones: [
        {
          year: '1972',
          title: 'Primeira Edição',
          description: 'Idealizada pela família do Clube União Maravilha, liderada por Altineu Coutinho, nasceu a tradição que marcaria gerações em Macuco',
          image: { url: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?q=80&w=800' },
          highlight: false,
        },
        {
          year: '2024',
          title: 'Patrimônio Histórico',
          description: 'Declarada Patrimônio Histórico Cultural Imaterial de Macuco pela Lei 1.158/2024',
          image: { url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800' },
          highlight: false,
        },
        {
          year: '2025',
          title: '50ª Edição',
          description: 'Ano dourado, maior premiação da história, com R$ 10 mil para o primeiro colocado',
          image: { url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=800' },
          highlight: true,
        },
        {
          year: '2026',
          title: '51ª Edição',
          description: 'Continuando a tradição com inovação e sustentabilidade',
          image: { url: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=800' },
          highlight: false,
        },
      ],
    },
    
    // CTA Final
    {
      type: 'cta',
      title: 'Garanta Sua Vaga na 51ª Edição',
      subtitle: 'Não perca a chance de fazer parte dessa tradição. Inscreva-se agora antes que o lote atual esgote!',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=2070',
        alt: 'Atletas correndo',
      },
      ctaPrimary: {
        label: 'Inscrever-se Agora',
        href: '/inscricao',
        variant: 'primary',
        target: '_self',
      },
      ctaSecondary: {
        label: 'Acompanhar Inscrição',
        href: '/inscricao/acompanhar',
        variant: 'secondary',
        target: '_self',
      },
      features: [
        { icon: '✅', text: 'Inscrição 100% Online' },
        { icon: '✅', text: 'Confirmação Imediata' },
        { icon: '✅', text: 'Pagamento Seguro' },
      ],
    },
  ],
}

// Exemplo de config global
export const GLOBAL_CONFIG_DATA: z.infer<typeof GlobalConfigSchema> = {
  siteName: 'Corrida Rústica de Macuco',
  siteTagline: 'Tradição desde 1974',
  contactEmail: 'contato@corridamacuco.com.br',
  contactPhone: '(22) 3267-8000',
  contactWhatsApp: '(22) 99999-9999',
  address: 'Prefeitura Municipal de Macuco, Centro, Macuco - RJ',
  socialMedia: {
    instagram: 'https://www.instagram.com/corridademacuco/',
  },
  footer: {
    copyrightText: 'Corrida Rústica de São João Batista. Todos os direitos reservados.',
    links: [
      { label: 'Termos', href: '/termos' },
      { label: 'Privacidade', href: '/privacidade' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
}








