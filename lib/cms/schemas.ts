// lib/cms/schemas.ts - Schemas de conteúdo para o CMS

import { z } from 'zod'

// ========================================
// COMPONENTES BASE
// ========================================

export const CTASchema = z.object({
  label: z.string(),
  href: z.string(),
  target: z.enum(['_self', '_blank']).default('_self'),
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
  icon: z.string().optional(),
})

export const MediaAssetSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
})

export const BadgeSchema = z.object({
  text: z.string(),
  color: z.enum(['blue', 'green', 'red', 'yellow', 'purple', 'gray']).default('blue'),
  icon: z.string().optional(),
})

// ========================================
// SEÇÕES (SECTIONS)
// ========================================

// Hero Section
export const HeroSectionSchema = z.object({
  type: z.literal('hero'),
  headline: z.string(),
  subheadline: z.string().optional(),
  description: z.string().optional(),
  backgroundImage: MediaAssetSchema.optional(),
  backgroundVideo: z.string().optional(),
  ctaPrimary: CTASchema.optional(),
  ctaSecondary: CTASchema.optional(),
  badges: z.array(BadgeSchema).optional(),
  stats: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
})

// Countdown Section
export const CountdownSectionSchema = z.object({
  type: z.literal('countdown'),
  title: z.string(),
  subtitle: z.string().optional(),
  targetDate: z.string(), // ISO date
  backgroundColor: z.string().default('gradient-primary'),
})

// Cards/Categories Section
export const CardsSectionSchema = z.object({
  type: z.literal('cards'),
  title: z.string(),
  subtitle: z.string().optional(),
  cards: z.array(z.object({
    id: z.string(),
    icon: z.string(),
    title: z.string(),
    description: z.string(),
    badge: BadgeSchema.optional(),
    price: z.string(),
    isFree: z.boolean().default(false),
    details: z.array(z.string()).optional(),
    cta: CTASchema.optional(),
  })),
  layout: z.enum(['grid-2', 'grid-3', 'grid-4']).default('grid-4'),
})

// Timeline Section
export const TimelineSectionSchema = z.object({
  type: z.literal('timeline'),
  title: z.string(),
  subtitle: z.string().optional(),
  milestones: z.array(z.object({
    year: z.string(),
    title: z.string(),
    description: z.string(),
    image: MediaAssetSchema.optional(),
    highlight: z.boolean().default(false),
  })),
})

// Testimonials Section
export const TestimonialsSectionSchema = z.object({
  type: z.literal('testimonials'),
  title: z.string(),
  subtitle: z.string().optional(),
  testimonials: z.array(z.object({
    name: z.string(),
    role: z.string(),
    city: z.string(),
    image: MediaAssetSchema,
    rating: z.number().min(1).max(5),
    text: z.string(),
    badge: z.string().optional(),
  })),
})

// News/Posts Section
export const NewsSectionSchema = z.object({
  type: z.literal('news'),
  title: z.string(),
  subtitle: z.string().optional(),
  showCount: z.number().default(3),
  category: z.string().optional(),
  viewAllLink: z.string().default('/noticias'),
})

// Sponsors Section
export const SponsorsSectionSchema = z.object({
  type: z.literal('sponsors'),
  title: z.string(),
  subtitle: z.string().optional(),
  tiers: z.array(z.object({
    name: z.string(),
    sponsors: z.array(z.object({
      name: z.string(),
      logo: MediaAssetSchema,
      website: z.string().optional(),
    })),
  })),
})

// CTA Section
export const CTASectionSchema = z.object({
  type: z.literal('cta'),
  title: z.string(),
  subtitle: z.string().optional(),
  backgroundImage: MediaAssetSchema.optional(),
  ctaPrimary: CTASchema,
  ctaSecondary: CTASchema.optional(),
  features: z.array(z.object({
    icon: z.string(),
    text: z.string(),
  })).optional(),
})

// FAQ Section
export const FAQSectionSchema = z.object({
  type: z.literal('faq'),
  title: z.string(),
  subtitle: z.string().optional(),
  questions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string().optional(),
  })),
})

// Stats Section
export const StatsSectionSchema = z.object({
  type: z.literal('stats'),
  title: z.string().optional(),
  stats: z.array(z.object({
    value: z.string(),
    label: z.string(),
    icon: z.string().optional(),
    change: z.string().optional(),
  })),
  layout: z.enum(['horizontal', 'grid']).default('grid'),
})

// ========================================
// UNIÃO DE TODOS OS TIPOS
// ========================================

export const SectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  CountdownSectionSchema,
  CardsSectionSchema,
  TimelineSectionSchema,
  TestimonialsSectionSchema,
  NewsSectionSchema,
  SponsorsSectionSchema,
  CTASectionSchema,
  FAQSectionSchema,
  StatsSectionSchema,
])

export type Section = z.infer<typeof SectionSchema>
export type HeroSection = z.infer<typeof HeroSectionSchema>
export type CountdownSection = z.infer<typeof CountdownSectionSchema>
export type CardsSection = z.infer<typeof CardsSectionSchema>
export type TimelineSection = z.infer<typeof TimelineSectionSchema>
export type TestimonialsSection = z.infer<typeof TestimonialsSectionSchema>
export type NewsSection = z.infer<typeof NewsSectionSchema>
export type SponsorsSection = z.infer<typeof SponsorsSectionSchema>
export type CTASection = z.infer<typeof CTASectionSchema>
export type FAQSection = z.infer<typeof FAQSectionSchema>
export type StatsSection = z.infer<typeof StatsSectionSchema>

// ========================================
// PÁGINA COMPLETA
// ========================================

export const PageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  sections: z.array(SectionSchema),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.string().optional(),
  createdBy: z.string(),
  updatedAt: z.string(),
})

export type Page = z.infer<typeof PageSchema>

// ========================================
// CONFIGURAÇÕES GLOBAIS
// ========================================

export const GlobalConfigSchema = z.object({
  siteName: z.string(),
  siteTagline: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  contactWhatsApp: z.string(),
  address: z.string(),
  socialMedia: z.object({
    instagram: z.string().optional(),
  }),
  footer: z.object({
    copyrightText: z.string(),
    links: z.array(z.object({
      label: z.string(),
      href: z.string(),
    })),
  }),
})

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>

// ========================================
// METADADOS DOS TIPOS DE SEÇÃO
// ========================================

export interface SectionMetadata {
  type: string
  name: string
  description: string
  icon: string
  category: 'hero' | 'content' | 'interactive' | 'testimonial' | 'cta'
  schema: z.ZodType<any>
}

export const SECTION_TYPES: SectionMetadata[] = [
  {
    type: 'hero',
    name: 'Hero',
    description: 'Seção principal com título, subtítulo e CTAs',
    icon: 'Layout',
    category: 'hero',
    schema: HeroSectionSchema,
  },
  {
    type: 'countdown',
    name: 'Contagem Regressiva',
    description: 'Timer até a data do evento',
    icon: 'Clock',
    category: 'interactive',
    schema: CountdownSectionSchema,
  },
  {
    type: 'cards',
    name: 'Cards',
    description: 'Grid de cards (categorias, features, etc)',
    icon: 'Grid3x3',
    category: 'content',
    schema: CardsSectionSchema,
  },
  {
    type: 'timeline',
    name: 'Linha do Tempo',
    description: 'História com marcos temporais',
    icon: 'GitBranch',
    category: 'content',
    schema: TimelineSectionSchema,
  },
  {
    type: 'testimonials',
    name: 'Depoimentos',
    description: 'Avaliações de atletas',
    icon: 'Quote',
    category: 'testimonial',
    schema: TestimonialsSectionSchema,
  },
  {
    type: 'news',
    name: 'Notícias',
    description: 'Últimos posts do blog',
    icon: 'Newspaper',
    category: 'content',
    schema: NewsSectionSchema,
  },
  {
    type: 'sponsors',
    name: 'Patrocinadores',
    description: 'Logos de parceiros',
    icon: 'Award',
    category: 'content',
    schema: SponsorsSectionSchema,
  },
  {
    type: 'cta',
    name: 'Call to Action',
    description: 'Seção de conversão',
    icon: 'Target',
    category: 'cta',
    schema: CTASectionSchema,
  },
  {
    type: 'faq',
    name: 'FAQ',
    description: 'Perguntas frequentes',
    icon: 'HelpCircle',
    category: 'content',
    schema: FAQSectionSchema,
  },
  {
    type: 'stats',
    name: 'Estatísticas',
    description: 'Números e métricas',
    icon: 'BarChart',
    category: 'content',
    schema: StatsSectionSchema,
  },
]








