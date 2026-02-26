'use client'

import { Award, MapPin, Calendar, Gift, Users, TrendingUp } from 'lucide-react'
import ScrollReveal from '@/components/ui/ScrollReveal'

const highlights = [
  {
    icon: Award,
    title: 'R$ 21.850 em Premiação',
    description: 'Distribuídos entre categorias gerais, faixas etárias, atletas locais e corrida infanto-juvenil',
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    icon: MapPin,
    title: 'Percurso Certificado',
    description: 'Medição oficial e altimetria favorável para melhores tempos',
    color: 'from-green-400 to-green-600',
  },
  {
    icon: Gift,
    title: 'Kit Premium',
    description: 'Camiseta dry-fit, medalha finisher, chip de cronometragem e brindes',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: Calendar,
    title: 'Programação Completa',
    description: 'Retirada de kits, briefing técnico, warm-up e festa pós-prova',
    color: 'from-purple-400 to-purple-600',
  },
  {
    icon: Users,
    title: 'Estrutura de Apoio',
    description: 'Postos de hidratação, frutas, apoio médico e vestiários',
    color: 'from-pink-400 to-pink-600',
  },
  {
    icon: TrendingUp,
    title: 'Resultados ao Vivo',
    description: 'Acompanhamento em tempo real e resultados oficiais publicados em até 48h',
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
              Uma experiência completa que vai muito além da corrida
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon
            return (
              <ScrollReveal key={highlight.title} delay={index * 0.08}>
                <div
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl"
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


