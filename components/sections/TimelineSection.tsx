import { CheckCircle2, Trophy } from 'lucide-react'

interface TimelineItem {
  year?: string
  title?: string
  description?: string
  image?: string
  highlight?: boolean | 'gold'
}

interface TimelineContent {
  title?: string
  subtitle?: string
  milestones?: TimelineItem[]
}

interface TimelineSectionProps {
  content?: TimelineContent
}

const FALLBACK_TIMELINE: TimelineItem[] = [
  {
    year: '1972',
    title: 'Primeira edição',
    description: 'Idealizada pela família do Clube União Maravilha, liderada por Altineu Coutinho, nasceu a tradição que marcaria gerações em Macuco.',
    image: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?q=80&w=800',
  },
  {
    year: '2024',
    title: 'Patrimônio Histórico',
    description: 'Declarada Patrimônio Histórico Cultural Imaterial de Macuco pela Lei 1.158/2024.',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800',
  },
  {
    year: '2025',
    title: '50ª edição',
    description: 'Ano dourado, maior premiação da história, com R$ 10 mil para o primeiro colocado.',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=800',
    highlight: 'gold',
  },
  {
    year: '2026',
    title: '51ª edição',
    description: 'Continuando a tradição com inovação e sustentabilidade.',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=800',
  },
]

export default function TimelineSection({ content }: TimelineSectionProps) {
  const title = content?.title || 'Tradição desde 1972'
  const subtitle =
    content?.subtitle || 'Mais de cinco décadas promovendo saúde, esporte e união em Macuco.'
  const milestones = content?.milestones && content.milestones.length > 0 ? content.milestones : FALLBACK_TIMELINE

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container-custom">
        <div className="mb-16 text-center">
          <h2 className="section-title">
            {title}
          </h2>
          <p className="section-subtitle mx-auto max-w-2xl">{subtitle}</p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 hidden h-full w-1 -translate-x-1/2 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-200 lg:block" />

          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <div
                key={`${milestone.year}-${index}`}
                className={`flex flex-col items-center gap-8 lg:flex-row ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                <div className="flex-1 lg:pl-0 lg:pr-12">
                  <div className={index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}>
                    <div
                      className={`mb-3 inline-block rounded-full px-4 py-1 text-sm font-bold text-white ${
                        milestone.highlight === 'gold'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                          : milestone.highlight
                            ? 'bg-gradient-to-r from-primary-600 to-accent-600'
                            : 'bg-primary-600'
                      }`}
                    >
                      {milestone.year}
                    </div>
                    <h3 className="mb-2 font-display text-2xl font-bold text-gray-900">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>

                <div className="relative hidden flex-shrink-0 lg:block">
                  <div
                    className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white shadow-xl ${
                      milestone.highlight === 'gold'
                        ? 'scale-125 bg-gradient-to-br from-amber-500 to-yellow-600'
                        : milestone.highlight
                          ? 'scale-125 bg-gradient-to-br from-primary-600 to-accent-600'
                          : 'bg-primary-600'
                    }`}
                  >
                    {milestone.highlight === 'gold' ? (
                      <Trophy className="text-white" size={28} />
                    ) : (
                      <CheckCircle2 className="text-white" size={28} />
                    )}
                  </div>
                </div>

                <div className="flex-1 lg:pl-12">
                  <div className="group relative overflow-hidden rounded-xl shadow-lg">
                    <div
                      className="h-64 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${milestone.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

