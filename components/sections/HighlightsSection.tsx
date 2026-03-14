'use client'

import { Award, MapPin, Gift, Users, TrendingUp, Heart, Mountain } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'

const highlights = [
  {
    icon: Heart,
    title: 'Corrida raiz',
    description: 'A mais antiga do Rio de Janeiro e uma das mais tradicionais do Brasil. Uma prova que valoriza o corredor e sua essência.',
    color: 'from-red-400 to-rose-600',
  },
  {
    icon: Users,
    title: 'Para toda a família',
    description: 'Tem corrida para as crianças na categoria Infantil 2.5K. Diversão e esporte para todas as idades.',
    color: 'from-pink-400 to-pink-600',
  },
  {
    icon: Award,
    title: 'Premiação em dinheiro',
    description: 'R$ 21.850 distribuídos entre todas as categorias e faixas etárias — uma das maiores premiações em dinheiro do estado.',
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    icon: Mountain,
    title: 'Na região da serra',
    description: 'Macuco fica na região serrana fluminense, com ar puro e clima ameno para correr.',
    color: 'from-green-400 to-green-600',
  },
  {
    icon: Gift,
    title: 'Kit Premium',
    description: 'Número de peito, chip de cronometragem e medalha finisher.',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: TrendingUp,
    title: 'Resultados Oficiais',
    description: 'Veja sua classificação e tempo final aqui no site em até 48 horas após a prova.',
    color: 'from-cyan-400 to-cyan-600',
  },
]

export default function HighlightsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="section-title">
              Por Que Participar da <span className="text-gradient">51ª Edição</span>
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Tradição, premiação e acolhimento em uma das corridas mais queridas do Brasil
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon
            return (
              <ScrollReveal key={highlight.title} delay={index * 0.08} className="h-full">
                <div
                  className="group relative h-full overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} aria-hidden />

                  <div className="relative">
                    <div className={`w-14 h-14 bg-gradient-to-br ${highlight.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="text-white" size={28} aria-hidden />
                    </div>

                    <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                      {highlight.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Garanta sua vaga antes que o lote atual esgote
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/inscricao"
              className="btn-primary inline-flex items-center justify-center"
            >
              Inscrever-se Agora
            </a>
            <a
              href="/percursos"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Ver Percurso Completo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}


