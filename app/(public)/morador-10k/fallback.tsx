import type { ReactNode } from 'react'
import { Metadata } from 'next'
import { Calendar, MapPin, Users, Clock, FileText, CheckCircle, Gift, Trophy } from 'lucide-react'
import Link from 'next/link'
import { RACE_CONFIG } from '@/lib/constants'
import { getEventConfig } from '@/lib/cms/event'

const LOCAL_PRIZES = [
  { pos: '1º', value: 'R$ 1.000,00' },
  { pos: '2º', value: 'R$ 500,00' },
  { pos: '3º', value: 'R$ 400,00' },
  { pos: '4º', value: 'R$ 300,00' },
  { pos: '5º', value: 'R$ 200,00' },
  { pos: '6º', value: 'R$ 200,00' },
  { pos: '7º', value: 'R$ 200,00' },
  { pos: '8º', value: 'R$ 100,00' },
  { pos: '9º', value: 'R$ 100,00' },
  { pos: '10º', value: 'R$ 100,00' },
]

export const metadata: Metadata = {
  title: 'Morador de Macuco 10K - Categoria gratuita',
  description:
    'Largada às 12h, chegada na Praça Prof. João Brasil e inscrição sem custo para moradores com comprovante recente.',
}

export default async function Morador10KPage() {
  const config = await getEventConfig(2026)
  const moradorCategory = config?.categories?.find((c) => c.id === 'morador-10k')
  const vagasText =
    moradorCategory?.spotsAvailable != null
      ? `${moradorCategory.spotsAvailable} de ${moradorCategory.spots} vagas`
      : moradorCategory
        ? `${moradorCategory.spots} vagas`
        : '200 vagas'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-lg">
            <Gift size={24} />
            Categoria gratuita
          </div>
          <h1 className="text-5xl font-display font-bold text-gray-900 mb-6">
            Morador de Macuco 10K
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Corrida de 10 km exclusiva para quem mora em Macuco. A prova segue o mesmo percurso
            oficial da categoria geral, com largada às 12h na Fábrica de Cimento Holcim e chegada na
            Praça Prof. João Brasil.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">{RACE_CONFIG.raceDateFormatted}</p>
              <p className="text-sm text-gray-600">Data da prova</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Holcim → Praça Prof. João Brasil</p>
              <p className="text-sm text-gray-600">Percurso oficial 10K</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">{vagasText}</p>
              <p className="text-sm text-gray-600">Categoria exclusiva</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-900">Largada às 12h</p>
              <p className="text-sm text-gray-600">Traslado oficial às 11h15</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/inscricao?categoria=morador-10k"
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-lg transition-colors shadow-lg"
            >
              <CheckCircle size={24} />
              Fazer inscrição gratuita
            </Link>
            <p className="text-sm text-gray-600">Documentos conferidos na retirada do kit.</p>
          </div>
        </div>
      </section>

      {/* Requisitos */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Requisitos principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Requirement
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                title="Idade mínima"
                description={`Ter 15 anos completos até 31/12/${RACE_CONFIG.year}.`}
              />
              <Requirement
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                title="Residência comprovada"
                description="Conta de serviço essencial ou documento oficial emitido nos últimos 90 dias."
              />
              <Requirement
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                title="Documento com foto"
                description="Apresente RG, CNH ou outro documento oficial válido."
              />
            </div>
            <div className="space-y-6">
              <Requirement
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                title="Percurso completo"
                description="Prepare-se para os 10 km com ganho acumulado de 92 m."
              />
              <Requirement
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                title="Horário da prova"
                description="Retire o kit até 10h30 e dirija-se ao transporte oficial às 11h15."
              />
              <Requirement
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                title="Kit e regulamento"
                description="Assine o termo de participação e retire camiseta, número, chip e medalha finisher."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Documentos necessários */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Documentos aceitos</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm border border-green-200">
            <div className="flex items-center gap-4 mb-6">
              <FileText className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Comprovante de residência</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Documentos aceitos</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Conta de energia, água ou telefone (últimos 90 dias)</li>
                  <li>• Contrato de locação reconhecido em cartório</li>
                  <li>• Escritura do imóvel com endereço atualizado</li>
                  <li>• Declaração escolar ou bancária emitida em Macuco</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Como será feita a validação</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Traga original e cópia simples para conferência</li>
                  <li>• O titular do documento deve ser o atleta inscrito</li>
                  <li>• Endereço precisa constar no município de Macuco-RJ</li>
                  <li>• A análise ocorre na retirada do kit (até 10h30)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Por que vale participar?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Benefit
              icon={<Gift className="w-12 h-12 text-green-600 mx-auto mb-4" />}
              title="Inscrição gratuita"
              description="Economia de R$ 22,00 em relação à categoria geral, com o mesmo kit e estrutura."
            />
            <Benefit
              icon={<Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />}
              title="Premiação exclusiva"
              description="Moradores concorrem a premiação local: R$ 1.000,00 para o campeão e bônus até o 10º lugar."
            />
            <Benefit
              icon={<Users className="w-12 h-12 text-green-600 mx-auto mb-4" />}
              title="Ambiente da cidade"
              description="Corra ao lado de vizinhos, familiares e equipes locais em um evento tradicional da cidade."
            />
          </div>
        </div>
      </section>

      {/* Premiação */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Premiação</h2>
          <div className="bg-white rounded-lg p-8 shadow-sm border border-green-200">
            <div className="flex items-center gap-4 mb-6">
              <Trophy className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Atletas de Macuco</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Premiação exclusiva para os 10 primeiros moradores que concluírem a prova.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LOCAL_PRIZES.map((item) => (
                <div
                  key={item.pos}
                  className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100"
                >
                  <span className="font-semibold text-gray-800">{item.pos} lugar</span>
                  <span className="font-bold text-green-600">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Garanta sua vaga sem custo</h2>
          <p className="text-lg text-white/80 mb-8">
            As inscrições estão abertas até {RACE_CONFIG.registrationCloseDate} ou enquanto houver
            vagas.
          </p>
          <Link
            href="/inscricao?categoria=morador-10k"
            className="inline-flex items-center gap-3 bg-white text-green-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-lg transition-colors shadow-lg"
          >
            <CheckCircle size={24} />
            Inscrever-se agora
          </Link>
        </div>
      </section>
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
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  )
}

interface BenefitProps {
  icon: ReactNode
  title: string
  description: string
}

function Benefit({ icon, title, description }: BenefitProps) {
  return (
    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
      {icon}
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
