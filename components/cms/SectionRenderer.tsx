import dynamic from 'next/dynamic'
import HeroSection from '@/components/sections/HeroSection'
import CountdownSection from '@/components/sections/CountdownSection'
import TimelineSection from '@/components/sections/TimelineSection'
import CTASection from '@/components/sections/CTASection'

const CategoriesSection = dynamic(
  () => import('@/components/sections/CategoriesSection'),
  { ssr: true }
)

interface SectionRendererProps {
  section: {
    component_type: string
    content: Record<string, any>
  }
  eventData?: any
}

function TestimonialsSectionDynamic({ content }: { content: any }) {
  const testimonials = Array.isArray(content?.testimonials) ? content.testimonials : []
  if (testimonials.length === 0) return null

  return (
    <section className="bg-gray-50 py-20">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="section-title">{content?.title || 'Depoimentos'}</h2>
          {content?.subtitle && (
            <p className="section-subtitle mx-auto max-w-2xl">{content.subtitle}</p>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="mb-4 text-sm text-gray-600">{testimonial.text}</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-xs text-gray-500">
                  {testimonial.role} {testimonial.city ? `• ${testimonial.city}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsSectionDynamic({ content }: { content: any }) {
  const posts = Array.isArray(content?.items) ? content.items : []
  if (posts.length === 0) return null

  return (
    <section className="py-20">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="section-title">{content?.title || 'Noticias recentes'}</h2>
          {content?.subtitle && (
            <p className="section-subtitle mx-auto max-w-2xl">{content.subtitle}</p>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post: any, index: number) => (
            <article key={index} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function SponsorsSectionDynamic({ content }: { content: any }) {
  const tiers = Array.isArray(content?.tiers) ? content.tiers : []
  if (tiers.length === 0) return null

  return (
    <section className="bg-gray-900 py-20">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="section-title text-white">{content?.title || 'Patrocinadores'}</h2>
          {content?.subtitle && (
            <p className="section-subtitle mx-auto max-w-2xl text-gray-300">{content.subtitle}</p>
          )}
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {tiers.map((tier: any, index: number) => (
            <div key={index} className="rounded-2xl border border-gray-700 bg-gray-800 p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-300">
                {tier.name}
              </p>
              <div className="mt-4 space-y-3">
                {tier.sponsors?.map((sponsor: any, sIndex: number) => (
                  <div key={sIndex} className="rounded-lg border border-gray-700 px-4 py-3 text-gray-100">
                    {sponsor.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSectionDynamic({ content }: { content: any }) {
  const items = Array.isArray(content?.items) ? content.items : []
  if (items.length === 0) return null

  return (
    <section className="bg-white py-20">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="section-title">{content?.title || 'Perguntas frequentes'}</h2>
          {content?.subtitle && (
            <p className="section-subtitle mx-auto max-w-2xl">{content.subtitle}</p>
          )}
        </div>
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <details
              key={index}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
            >
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">
                {item.question}
              </summary>
              <p className="mt-3 text-sm text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSectionDynamic({ content }: { content: any }) {
  const stats = Array.isArray(content?.stats) ? content.stats : []
  if (stats.length === 0) return null

  return (
    <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-16">
      <div className="container-custom">
        <div className="mb-10 text-center">
          <h2 className="section-title text-white">{content?.title || 'Resultados em destaque'}</h2>
          {content?.subtitle && (
            <p className="section-subtitle mx-auto max-w-2xl text-primary-100">
              {content.subtitle}
            </p>
          )}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat: any, index: number) => (
            <div key={index} className="rounded-2xl border border-primary-400/40 bg-white/10 p-6 text-center backdrop-blur-sm">
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-primary-100">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function SectionRenderer({ section, eventData }: SectionRendererProps) {
  const { component_type: type, content } = section

  switch (type) {
    case 'hero':
      return <HeroSection eventData={eventData} content={content} />
    case 'countdown':
      return <CountdownSection eventData={eventData} content={content} />
    case 'cards':
      return <CategoriesSection content={content} />
    case 'timeline':
      return <TimelineSection content={content} />
    case 'cta':
      return <CTASection content={content} />
    case 'testimonials':
      return <TestimonialsSectionDynamic content={content} />
    case 'news':
      return <NewsSectionDynamic content={content} />
    case 'sponsors':
      return <SponsorsSectionDynamic content={content} />
    case 'faq':
      return <FAQSectionDynamic content={content} />
    case 'stats':
      return <StatsSectionDynamic content={content} />
    default:
      return null
  }
}

