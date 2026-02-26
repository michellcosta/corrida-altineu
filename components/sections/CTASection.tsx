import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'

interface CTAFeature {
  icon?: string
  text?: string
}

interface CTAContent {
  title?: string
  subtitle?: string
  backgroundImage?: { url?: string }
  ctaPrimary?: { href?: string; label?: string }
  ctaSecondary?: { href?: string; label?: string }
  features?: CTAFeature[]
  badge?: string
}

interface CTASectionProps {
  content?: CTAContent
}

const FALLBACK_FEATURES: CTAFeature[] = [
  { text: 'Inscricao 100% online' },
  { text: 'Confirmacao imediata' },
  { text: 'Pagamento seguro' },
]

export default function CTASection({ content }: CTASectionProps) {
  const title = content?.title || 'Garanta sua vaga na 51ª edicao'
  const subtitle =
    content?.subtitle ||
    'Nao perca a chance de fazer parte dessa tradicao. Inscreva-se agora antes que o lote atual esgote.'
  const primaryCTA = content?.ctaPrimary || { href: '/inscricao', label: 'Inscrever-se agora' }
  const secondaryCTA = content?.ctaSecondary || {
    href: '/inscricao/acompanhar',
    label: 'Acompanhar inscricao',
  }
  const features = content?.features && content.features.length > 0 ? content.features : FALLBACK_FEATURES
  const badge = content?.badge || 'Vagas limitadas'
  const backgroundImage =
    content?.backgroundImage?.url ||
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2070'

  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-800/90 to-primary-900/95" />
      </div>

      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center space-x-2 rounded-full border border-accent-400/50 bg-accent-500/25 px-4 py-2 text-white backdrop-blur-sm">
            <Clock size={20} aria-hidden />
            <span className="font-semibold">{badge}</span>
          </div>

          <h2 className="font-display text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {title}
          </h2>

          <p className="mt-6 text-xl leading-relaxed text-gray-200 md:text-2xl">{subtitle}</p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur-md"
              >
                <p className="text-lg font-semibold">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {primaryCTA.href && primaryCTA.label && (
              <Link
                href={primaryCTA.href}
                className="group inline-flex items-center rounded-lg bg-white px-10 py-4 text-lg font-bold text-primary-600 shadow-2xl transition duration-200 hover:-translate-y-1 hover:bg-gray-100 hover:shadow-white/20"
              >
                {primaryCTA.label}
                <ArrowRight size={22} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            {secondaryCTA.href && secondaryCTA.label && (
              <Link
                href={secondaryCTA.href}
                className="inline-flex items-center rounded-lg border-2 border-white px-10 py-4 text-lg font-semibold text-white transition duration-200 hover:bg-white/10"
              >
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}







