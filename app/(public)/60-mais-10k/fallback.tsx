import type { ReactNode } from 'react'
import { Metadata } from 'next'
import { Calendar, MapPin, Users, Clock, Heart, Shield, Trophy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { RACE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: '60+ 10K - Categoria gratuita para atletas sênior',
  description:
    'Prova de 10 km com largada às 12h, transporte oficial e apoio médico completo para corredores com 60 anos ou mais.',
}

export default function SessentaMais10KPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-lg">
            <Trophy size={24} />
            Categoria gratuita 60+
          </div>
          <h1 className="text-5xl font-display font-bold text-gray-900 mb-6">60+ 10K</h1>
          <p className="text-xl text-gray-600 mb-10">
            A categoria sênior da Corrida de Macuco garante inscrição gratuita, o mesmo percurso oficial
            de 10 km e suporte médico em todos os pontos de hidratação. Largada às 12h na Fábrica de
            Cimento Holcim com chegada na Praça Prof. João Brasil.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <InfoCard
              icon={<Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />}
              title={RACE_CONFIG.raceDateFormatted}
              subtitle="Data da prova"
            />
            <InfoCard
              icon={<MapPin className="w-8 h-8 text-purple-600 mx-auto mb-3" />}
              title="Holcim → Praça Prof. João Brasil"
              subtitle="Percurso oficial 10K"
            />
            <InfoCard
              icon={<Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />}
              title="100 vagas"
              subtitle="Categoria exclusiva"
            />
            <InfoCard
              icon={<Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />}
              title="Largada às 12h"
              subtitle="Traslado oficial às 11h15"
            />
          </div>

          <div className="space-y-4">
            <Link
              href="/inscricao?categoria=sessenta-10k"
              className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-4 rounded-lg transition-colors shadow-lg"
            >
              <CheckCircle size={24} />
              Inscrever-se gratuitamente
            </Link>
            <p className="text-sm text-gray-600">
              Válido para atletas que completam 60 anos até 31/12/{RACE_CONFIG.year}.
            </p>
          </div>
        </div>
      </section>

      {/* Requisitos */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Requisitos principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Requirement
              icon={<Calendar className="w-5 h-5 text-purple-600" />}
              title="Idade mínima"
              description={`Ter 60 anos completos até 31/12/${RACE_CONFIG.year}.`}
            />
            <Requirement
              icon={<Shield className="w-5 h-5 text-purple-600" />}
              title="Documento oficial"
              description="Apresente RG, CNH ou outro documento com foto para validar a idade."
            />
            <Requirement
              icon={<Heart className="w-5 h-5 text-purple-600" />}
              title="Atestado médico recomendado"
              description="Traga laudo médico atualizado para facilitar a liberação na retirada do kit."
            />
            <Requirement
              icon={<Users className="w-5 h-5 text-purple-600" />}
              title="Retirada antecipada do kit"
              description="Kit disponível até 10h30 no dia da prova. Transporte oficial sai às 11h15."
            />
          </div>
        </div>
      </section>

      {/* Estrutura de apoio */}
      <section className="py-16 px-4 bg-purple-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Estrutura para 60+</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BenefitCard
              icon={<Heart className="w-8 h-8 text-purple-600" />}
              title="Apoio médico permanente"
              items={[
                'Equipe de saúde posicionada nos km 2,5 / 5 / 8 e chegada',
                'Ambulância e UTI móvel acompanhando a prova',
                'Área de recuperação com fisioterapeutas na dispersão',
              ]}
            />
            <BenefitCard
              icon={<Shield className="w-8 h-8 text-purple-600" />}
              title="Logística pensada para o conforto"
              items={[
                'Transporte oficial da praça até a largada às 11h15',
                'Postos de hidratação na largada, km 3, km 6, km 8,5 e chegada',
                'Kit completo com camiseta dry-fit, chip descartável e medalha',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Dicas de preparação */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Dicas de preparação</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PrepTip
              icon={<Heart className="w-8 h-8 text-purple-600" />}
              title="Avaliação médica"
              description="Realize check-up para receber orientações específicas antes da prova."
            />
            <PrepTip
              icon={<Clock className="w-8 h-8 text-purple-600" />}
              title="Treino progressivo"
              description="Combine caminhadas e trotes leves três vezes por semana, aumentando gradualmente o volume."
            />
            <PrepTip
              icon={<Trophy className="w-8 h-8 text-purple-600" />}
              title="Nutrição e hidratação"
              description="Mantenha alimentação equilibrada, hidrate-se bem e chegue com antecedência."
            />
          </div>
        </div>
      </section>

      {/* Premiação */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-6">Premiação sênior</h2>
          <p className="text-lg text-white/80 mb-8">
            Além da medalha finisher, os três primeiros colocados no masculino e feminino recebem troféu
            especial no palco principal às 13h30.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Trophy className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">1º lugar M/F</h3>
              <p className="text-sm text-purple-100">Troféu + kit premium dos patrocinadores</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Users className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">2º e 3º lugar M/F</h3>
              <p className="text-sm text-purple-100">Troféu personalizado + brinde oficial</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Heart className="w-12 h-12 text-white mx-auto mb-4" />
              <h3 className="font-semibold text-white mb-2">Demais concluintes</h3>
              <p className="text-sm text-purple-100">Medalha finisher e certificado digital</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Mostre que idade não é limite</h2>
          <p className="text-lg text-gray-600 mb-8">
            Vagas limitadas e prioridade para atletas residentes em Macuco e região serrana.
          </p>
          <Link
            href="/inscricao?categoria=sessenta-10k"
            className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-4 rounded-lg transition-colors shadow-lg"
          >
            <CheckCircle size={24} />
            Garantir minha inscrição
          </Link>
        </div>
      </section>
    </div>
  )
}

interface InfoCardProps {
  icon: ReactNode
  title: string
  subtitle: string
}

function InfoCard({ icon, title, subtitle }: InfoCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-200 text-center">
      {icon}
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  )
}

interface RequirementProps {
  icon: ReactNode
  title: string
  description: string
}

function Requirement({ icon, title, description }: RequirementProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  )
}

interface BenefitCardProps {
  icon: ReactNode
  title: string
  items: string[]
}

function BenefitCard({ icon, title, items }: BenefitCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-purple-200">
      <div className="flex items-center gap-4 mb-4">
        {icon}
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2 text-gray-600 text-sm">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}

interface PrepTipProps {
  icon: ReactNode
  title: string
  description: string
}

function PrepTip({ icon, title, description }: PrepTipProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
