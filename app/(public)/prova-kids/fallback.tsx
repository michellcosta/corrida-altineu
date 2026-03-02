import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'
import { Heart, Smile, Gift, Users, Clock, Trophy, MapPin, Shield } from 'lucide-react'
import { getEventConfig } from '@/lib/cms/event'

export const metadata = {
  title: 'Prova Kids | Corrida Infantil 2.5K gratuita',
  description:
    'Percurso seguro de 2,5 km para crianças e adolescentes de 5 a 14 anos. Largada às 10h com chegada na Praça Prof. João Brasil.',
}

export default async function ProvaKidsPage() {
  const config = await getEventConfig(2026)
  const infantilCategory = config?.categories?.find((c) => c.id === 'infantil-2k')
  const vagasText =
    infantilCategory?.spotsAvailable != null
      ? `${infantilCategory.spotsAvailable} de ${infantilCategory.spots} vagas`
      : infantilCategory
        ? `${infantilCategory.spots} vagas`
        : '300 vagas'

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="font-semibold">Para atletas de 5 a 14 anos</span>
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Prova Kids 2.5K
            </h1>
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              A Corrida Infantil oficial da 51ª Corrida de Macuco. Inscrição gratuita, percurso seguro
              de 2,5 km e chegada com festa na Praça Prof. João Brasil.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/inscricao?categoria=infantil-2k"
                className="bg-white text-orange-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-xl"
              >
                Inscrever agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Detalhes principais */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <DetailCard
              icon={<Clock className="text-orange-600 mx-auto mb-4" size={40} />}
              title="Largada às 10h"
              description="Concentração às 9h com aquecimento orientado."
            />
            <DetailCard
              icon={<MapPin className="text-orange-600 mx-auto mb-4" size={40} />}
              title="Percurso 2,5 km"
              description="Saída no bairro Goiabal e chegada na Praça Prof. João Brasil."
            />
            <DetailCard
              icon={<Users className="text-pink-600 mx-auto mb-4" size={40} />}
              title="Faixa etária 5-14"
              description="Baterias por idade para garantir segurança."
            />
            <DetailCard
              icon={<Gift className="text-purple-600 mx-auto mb-4" size={40} />}
              title="Inscrição gratuita"
              description="Número de peito e medalha."
            />
          </div>

          {/* Por que participar */}
          <div className="mb-16">
            <h2 className="section-title text-center mb-12">
              Por que inscrever <span className="text-gradient">seu filho</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Benefit
                icon={Smile}
                title="Diversão garantida"
                description="Atividades recreativas, música e locução animada antes e depois da prova."
                gradient="from-yellow-400 to-orange-500"
              />
              <Benefit
                icon={Heart}
                title="Hábitos saudáveis"
                description="Incentivo ao esporte com acompanhamento profissional e orientação de alongamento."
                gradient="from-pink-400 to-red-500"
              />
              <Benefit
                icon={Trophy}
                title="Sensação de conquista"
                description="Entrega de medalha finisher e pódio até o 5º lugar nas categorias por idade."
                gradient="from-purple-400 to-indigo-500"
              />
              <Benefit
                icon={Users}
                title="Novas amizades"
                description="Turmas divididas por faixa etária para correr ao lado de colegas da mesma idade."
                gradient="from-blue-400 to-cyan-500"
              />
              <Benefit
                icon={Gift}
                title="Kit completo"
                description="Camiseta dry-fit infantil, número, chip descartável, medalha e brindes dos parceiros."
                gradient="from-green-400 to-teal-500"
              />
              <Benefit
                icon={Shield}
                title="Segurança total"
                description="Percurso fechado ao trânsito, monitores a cada 200 m, equipe médica e bombeiros civis."
                gradient="from-red-400 to-pink-500"
              />
            </div>
          </div>

          {/* Kit e inscrição */}
          <div className="mb-16">
            <h2 className="section-title text-center mb-12">
              O que está <span className="text-gradient">incluído</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
              <div className="card bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
                <h3 className="font-display font-bold text-2xl mb-4">Kit Infantil Oficial</h3>
                <ul className="space-y-3 text-gray-700 text-sm">
                  <li>• Número de peito personalizado</li>
                  <li>• Medalha oficial para todos os concluintes</li>
                
                  <li>• Hidratação na chegada</li>

                </ul>
              </div>
              <div className="card text-center">
                <div className="text-5xl mb-4">🎈</div>
                <p className="text-4xl font-bold text-orange-600 mb-2">Gratuito</p>
                <p className="text-gray-600 mb-6">
                  Vagas limitadas. Inscrições até 20/06 ou enquanto houver vagas.
                </p>
                <Link
                  href="/inscricao?categoria=infantil-2k"
                  className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:shadow-xl transition-all"
                >
                  Garantir inscrição gratuita
                </Link>
              </div>
            </div>
          </div>

          {/* Programação */}
          <div className="mb-16">
            <h2 className="section-title text-center mb-12">
              Programação <span className="text-gradient">do evento</span>
            </h2>
            <div className="max-w-3xl mx-auto card">
              <div className="space-y-4">
                <ScheduleItem
                  time="09:00"
                  title="Encerramento das inscrições presenciais"
                  description="Confirmação no balcão ao lado da Praça Prof. João Brasil."
                />
                <ScheduleItem
                  time="09:15"
                  title="Aquecimento guiado"
                  description="Alongamento e brincadeiras coordenadas por educadores físicos."
                />
                <ScheduleItem
                  time="10:00"
                  title="Largada oficial"
                  description="Saída do bairro Goiabal com batedores e staff acompanhando o trajeto."
                />
                <ScheduleItem
                  time="10:30"
                  title="Premiação e medalhas"
                  description="Entrega de medalhas finisher, frutas e hidratação na área kids."
                />
          </div>
        </div>
      </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white">
        <div className="container-custom text-center">
          <h2 className="font-display font-bold text-4xl mb-4">
            Garanta memórias inesquecíveis
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Inscreva sua criança na Prova Kids 2.5K e viva a energia da Corrida de Macuco em família.
          </p>
          <Link
            href="/inscricao?categoria=infantil-2k"
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-lg transition-all shadow-2xl hover:shadow-white/20 inline-block"
          >
            Inscrição gratuita
          </Link>
          <p className="mt-6 text-white/90">{vagasText} disponíveis · Até 14 anos</p>
        </div>
      </section>
    </div>
  )
}

interface DetailCardProps {
  icon: ReactNode
  title: string
  description: string
}

function DetailCard({ icon, title, description }: DetailCardProps) {
  return (
    <div className="card text-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      {icon}
      <h3 className="font-display font-bold text-xl mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

interface BenefitProps {
  icon: ComponentType<any>
  title: string
  description: string
  gradient: string
}

function Benefit({ icon: Icon, title, description, gradient }: BenefitProps) {
  return (
    <div className="card group hover:shadow-2xl transition-shadow">
      <div
        className={`w-14 h-14 bg-gradient-to-br ${gradient} text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
      >
        <Icon size={30} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

interface ScheduleItemProps {
  time: string
  title: string
  description: string
}

function ScheduleItem({ time, title, description }: ScheduleItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="bg-primary-600 text-white font-bold px-3 py-1 rounded-lg text-sm">{time}</div>
      <div className="flex-1">
        <h4 className="font-bold mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  )
}

