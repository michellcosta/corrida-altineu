'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import { CATEGORIES, RACE_CONFIG } from '@/lib/constants'
import ScrollReveal from '@/components/ui/ScrollReveal'

interface CardContent {
  id?: string
  icon?: string
  title?: string
  description?: string
  badge?: { text?: string; color?: string }
  price?: string
  isFree?: boolean
  details?: string[]
  cta?: { href?: string; label?: string }
}

interface CardsSectionContent {
  title?: string
  subtitle?: string
  layout?: 'grid-2' | 'grid-3' | 'grid-4'
  cards?: CardContent[]
}

interface CategoriesSectionProps {
  content?: CardsSectionContent
}

const FALLBACK_CARDS: CardContent[] = [
  {
    id: 'geral',
    icon: 'G',
    title: CATEGORIES.geral.name,
    description: CATEGORIES.geral.description,
    badge: { text: 'Mais Popular', color: 'blue' },
    price: `R$ ${CATEGORIES.geral.price.toFixed(2)}`,
    isFree: CATEGORIES.geral.isFree,
    details: [CATEGORIES.geral.distance, CATEGORIES.geral.ageRule, '500 vagas'],
    cta: { href: '/prova-10k', label: 'Inscrever-se' },
  },
  {
    id: 'morador',
    icon: 'M',
    title: CATEGORIES.morador.name,
    description: CATEGORIES.morador.description,
    badge: { text: 'Gratuito', color: 'green' },
    price: 'GRATUITO',
    isFree: true,
    details: [CATEGORIES.morador.distance, CATEGORIES.morador.ageRule, 'Comprovante de residencia'],
    cta: { href: '/morador-10k', label: 'Inscrever-se' },
  },
  {
    id: 'sessenta',
    icon: '60+',
    title: CATEGORIES.sessenta.name,
    description: CATEGORIES.sessenta.description,
    badge: { text: 'Gratuito', color: 'purple' },
    price: 'GRATUITO',
    isFree: true,
    details: [CATEGORIES.sessenta.distance, CATEGORIES.sessenta.ageRule, '100 vagas'],
    cta: { href: '/60-mais-10k', label: 'Inscrever-se' },
  },
  {
    id: 'infantil',
    icon: 'Kids',
    title: CATEGORIES.infantil.name,
    description: CATEGORIES.infantil.description,
    badge: { text: 'Familia', color: 'yellow' },
    price: 'GRATUITO',
    isFree: true,
    details: [CATEGORIES.infantil.distance, CATEGORIES.infantil.ageRule, '300 vagas'],
    cta: { href: '/prova-kids', label: 'Inscrever-se' },
  },
]

const BADGE_COLOR_CLASS: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
}

export default function CategoriesSection({ content }: CategoriesSectionProps) {
  const layout = content?.layout || 'grid-4'
  const cards = content?.cards && content.cards.length > 0 ? content.cards : FALLBACK_CARDS
  const title = content?.title || 'Escolha sua Categoria'
  const subtitle =
    content?.subtitle ||
    'Temos opcoes para todos os perfis: do atleta competitivo as familias que querem se divertir juntas.'

  const gridClass =
    layout === 'grid-2'
      ? 'grid-cols-1 md:grid-cols-2'
      : layout === 'grid-3'
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'

  const titleWords = title.split(' ')
  const leadingWords = titleWords.slice(0, -1).join(' ')
  const trailingWord = titleWords.slice(-1).join('')

  return (
    <section id="provas" className="bg-gray-50 py-20">
      <div className="container-custom">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <h2 className="section-title">
              {leadingWords}{' '}
              <span className="text-gradient">{trailingWord}</span>
            </h2>
            <p className="section-subtitle mx-auto max-w-2xl">{subtitle}</p>
          </div>
        </ScrollReveal>

        <div className={`grid gap-6 ${gridClass}`}>
          {cards.map((card, index) => {
            const badgeColor = card.badge?.color ? BADGE_COLOR_CLASS[card.badge.color] ?? 'bg-primary-600' : ''
            return (
              <ScrollReveal key={card.id || card.title} delay={index * 0.1}>
              <div
                className="card group relative border-2 border-transparent transition-all duration-300 hover:-translate-y-1 hover:border-primary-600/30 hover:shadow-lg"
              >
                {card.badge?.text && (
                  <div
                    className={`absolute -top-3 -right-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg ${badgeColor}`}
                  >
                    {card.badge.text}
                  </div>
                )}

                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-accent-50 text-xl font-bold group-hover:scale-110 transition-transform">
                  {card.icon || 'X'}
                </div>

                <h3 className="mb-2 font-display text-2xl font-bold text-gray-900">{card.title}</h3>
                <p className="mb-4 text-gray-600">{card.description}</p>

                <div className="mb-4 space-y-2">
                  {card.details?.map((detail, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <Clock size={16} className="mr-2 text-primary-600" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4 border-t border-gray-200 pt-4">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span
                      className={`text-3xl font-bold ${card.isFree ? 'text-accent-600' : 'text-primary-600'}`}
                    >
                      {card.price || 'R$ 0,00'}
                    </span>
                    {!card.isFree && (
                      <span className="text-sm text-gray-500">Inscricao {RACE_CONFIG.year}</span>
                    )}
                  </div>
                </div>

                {card.cta?.href && card.cta.label && (
                  <Link
                    href={card.cta.href}
                    className="block w-full rounded-lg bg-primary-600 py-3 text-center font-semibold text-white transition hover:bg-primary-700"
                  >
                    {card.cta.label}
                  </Link>
                )}
              </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

