'use client'

import Link from 'next/link'
import { Calendar, MapPin, Trophy } from 'lucide-react'
import { useMemo } from 'react'
import { RACE_CONFIG } from '@/lib/constants'
import { parseLocalDate } from '@/lib/utils/dates'

interface HeroSectionContent {
  headline?: string
  subheadline?: string
  description?: string
  backgroundImage?: { url?: string }
  ctaPrimary?: { href?: string; label?: string }
  ctaSecondary?: { href?: string; label?: string }
  badges?: Array<{ text?: string }>
  stats?: Array<{ value?: string; label?: string }>
}

interface HeroSectionProps {
  eventData?: any
  content?: HeroSectionContent
}

export default function HeroSection({ eventData, content }: HeroSectionProps) {
  const edition = eventData?.edition || RACE_CONFIG.edition
  const year = eventData?.year || RACE_CONFIG.year
  const raceDate = useMemo(() => {
    if (content?.stats?.some((stat) => stat?.label?.toLowerCase().includes('dia'))) {
      return eventData?.race_date ? parseLocalDate(eventData.race_date) : RACE_CONFIG.raceDate
    }
    return eventData?.race_date ? parseLocalDate(eventData.race_date) : RACE_CONFIG.raceDate
  }, [content?.stats, eventData?.race_date])

  const location = eventData?.location || 'Centro'
  const city = eventData?.city || 'Macuco'
  const state = eventData?.state || 'RJ'
  const totalPrize = eventData?.total_prize || 21850
  const registrationsOpen =
    eventData?.registrations_open !== undefined ? eventData.registrations_open : true

  const headline =
    content?.headline || `51ª Corrida Rústica de Macuco`
  const subheadline = content?.subheadline || `Tradição de ${edition} anos`
  const description =
    content?.description || 'Junte-se a milhares de atletas na corrida mais querida da região.'
  const primaryCTA = content?.ctaPrimary || { href: '/inscricao', label: 'Inscrever-se Agora' }
  const secondaryCTA = content?.ctaSecondary || {
    href: '/inscricao/acompanhar',
    label: 'Acompanhar Inscrição',
  }
  const badges =
    content?.badges && content.badges.length > 0
      ? content.badges
      : [{ text: registrationsOpen ? 'Inscrições Abertas' : 'Inscrições Encerradas' }]
  const stats =
    content?.stats && content.stats.length > 0
      ? content.stats
      : [
          { value: `${edition}`, label: 'Edições' },
          { value: '5.000+', label: 'Atletas' },
          { value: '4', label: 'Categorias' },
          { value: '3', label: 'Categorias Gratuitas' },
        ]

  const backgroundImage =
    content?.backgroundImage?.url ||
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2574'

  return (
    <section id="home" className="relative -mt-24 flex min-h-[100dvh] items-center pt-24 md:-mt-28 md:pt-28">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/85 to-black/80" />
      </div>

      <div className="container-custom relative z-10 pt-12 pb-20">
        <div className="max-w-4xl">
          {badges.slice(0, 1).map((badge, index) => (
            <div
              key={index}
              className="mb-8 inline-flex items-center space-x-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-white backdrop-blur-sm animate-fade-in"
            >
              <div className="h-2 w-2 rounded-full bg-sky-300" aria-hidden />
              <span className="text-sm font-semibold">
                {badge.text} - {year}
              </span>
            </div>
          ))}

          <h1 className="animate-slide-up font-display text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            {headline}
          </h1>
          {subheadline && (
            <p className="mt-3 animate-slide-up text-lg text-gray-100">{subheadline}</p>
          )}
          <p className="mt-6 animate-slide-up text-xl leading-relaxed text-gray-200 md:text-2xl">
            {description}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 animate-slide-up sm:grid-cols-3">
            <div className="rounded-xl border border-white/25 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15">
              <Calendar className="mb-2 text-sky-300" size={24} aria-hidden />
              <p className="text-sm text-gray-300">Data</p>
              <p className="font-semibold text-white">
                {raceDate.toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="rounded-xl border border-white/25 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15">
              <MapPin className="mb-2 text-sky-300" size={24} aria-hidden />
              <p className="text-sm text-gray-300">Local</p>
              <p className="font-semibold text-white">
                {location}, {city} - {state}
              </p>
            </div>
            <div className="rounded-xl border border-white/25 bg-white/10 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15">
              <Trophy className="mb-2 text-sky-300" size={24} aria-hidden />
              <p className="text-sm text-gray-300">Premiação</p>
              <p className="font-semibold text-white">
                R$ {totalPrize.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 animate-slide-up sm:flex-row sm:justify-center">
            {primaryCTA.href && primaryCTA.label && (
            <Link
              href={primaryCTA.href}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:from-primary-700 hover:to-primary-800 active:scale-[0.98]"
            >
                {primaryCTA.label}
              </Link>
            )}
            {secondaryCTA.href && secondaryCTA.label && (
            <Link
              href={secondaryCTA.href}
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-[0.98]"
            >
                {secondaryCTA.label}
              </Link>
            )}
          </div>

          <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/20 pt-10 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="mb-1 text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce" aria-hidden>
        <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/30">
          <div className="mt-2 h-3 w-1 rounded-full bg-white/50"></div>
        </div>
      </div>
    </section>
  )
}
