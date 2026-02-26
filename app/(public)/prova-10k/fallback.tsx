import Link from 'next/link'
import { MapPin, Clock, Users, Trophy, Calendar, ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Prova 10K | 51ª Corrida de Macuco',
  description:
    'Categoria principal da Corrida de Macuco com largada às 12h, inscrição a partir de R$ 20 e premiação oficial para os 10 primeiros colocados.',
}

const PRICING_OPTIONS = [
  {
    id: 'geral-10k',
    title: 'Prova Geral 10K',
    price: 'R$ 20,00',
    description: 'Categoria paga para atletas que completam 15 anos até 31/12/2026.',
    spots: '500 vagas',
    highlight: true,
  },
  {
    id: 'morador-10k',
    title: 'Morador de Macuco 10K',
    price: 'Gratuita',
    description: 'Isenção para residentes com comprovante emitido nos últimos 90 dias.',
    spots: '200 vagas',
  },
  {
    id: 'sessenta-10k',
    title: 'Categoria 60+ 10K',
    price: 'Gratuita',
    description: 'Inscrição sem custo para atletas que completam 60 anos até 31/12/2026.',
    spots: '100 vagas',
  },
]

const GENERAL_PRIZES = [
  { pos: '1º', value: 'R$ 5.000,00' },
  { pos: '2º', value: 'R$ 2.000,00' },
  { pos: '3º', value: 'R$ 1.500,00' },
  { pos: '4º', value: 'R$ 800,00' },
  { pos: '5º', value: 'R$ 600,00' },
  { pos: '6º', value: 'R$ 500,00' },
  { pos: '7º', value: 'R$ 400,00' },
  { pos: '8º', value: 'R$ 300,00' },
  { pos: '9º', value: 'R$ 200,00' },
  { pos: '10º', value: 'R$ 200,00' },
]

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

const AGE_GROUPS = [
  '15/19 anos',
  '20/24 anos',
  '25/29 anos',
  '30/34 anos',
  '35/39 anos',
  '40/44 anos',
  '45/49 anos',
  '50/54 anos',
  '55/59 anos',
  '60/64 anos',
  '65/69 anos',
  '70/74 anos',
  '75/79 anos',
  '80+ anos',
]

const KIT_ITEMS = [
  { title: 'Camiseta Dry-Fit', desc: 'Modelo oficial da 51ª edição' },
  { title: 'Medalha Finisher', desc: 'Para todos que concluírem' },
  { title: 'Chip de Cronometragem', desc: 'Descartável, aplicado no número' },
  { title: 'Brindes de Parceiros', desc: 'Entregues na retirada do kit' },
  { title: 'Hidratação', desc: 'Pontos na largada, km 3, km 6, km 8,5 e chegada' },
  { title: 'Frutas na Chegada', desc: 'Banana e laranja na área de dispersão' },
  { title: 'Resultados Oficiais', desc: 'Publicados em até 48h' },
  { title: 'Seguro Atleta', desc: 'Cobertura durante toda a prova' },
]

export default function Prova10KPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="font-semibold">Categoria Principal</span>
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Prova 10K
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed mb-8">
              Largada às 12h na Fábrica de Cimento Holcim, chegada na Praça Prof. João Brasil e
              premiação em dinheiro para os 10 primeiros colocados no masculino e no feminino.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/inscricao?categoria=geral-10k"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
              >
                Inscrever-se
              </Link>
              <Link
                href="/percursos#10k"
                className="bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Ver Percurso
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Detalhes da Prova */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="card text-center">
              <MapPin className="text-primary-600 mx-auto mb-4" size={40} />
              <h3 className="font-display font-bold text-xl mb-2">Distância</h3>
              <p className="text-gray-600">10km oficiais</p>
            </div>
            <div className="card text-center">
              <Clock className="text-primary-600 mx-auto mb-4" size={40} />
              <h3 className="font-display font-bold text-xl mb-2">Horário</h3>
              <p className="text-gray-600">Largada às 12h</p>
            </div>
            <div className="card text-center">
              <Users className="text-primary-600 mx-auto mb-4" size={40} />
              <h3 className="font-display font-bold text-xl mb-2">Idade</h3>
              <p className="text-gray-600">A partir de 15 anos</p>
            </div>
            <div className="card text-center">
              <Trophy className="text-primary-600 mx-auto mb-4" size={40} />
              <h3 className="font-display font-bold text-xl mb-2">Premiação</h3>
              <p className="text-gray-600">1º lugar recebe R$ 5.000,00</p>
            </div>
          </div>

          {/* Valores e Categorias */}
          <div className="mb-16">
            <h2 className="section-title text-center mb-12">
              Valores e <span className="text-gradient">Categorias</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PRICING_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className={`card text-center ${option.highlight ? 'border-4 border-primary-500 relative' : ''}`}
                >
                  {option.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Categoria Paga
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wide">
                    {option.title}
                  </div>
                  <div className="text-4xl font-bold text-primary-600 mb-4">{option.price}</div>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <p className="text-sm text-gray-500 mb-6">{option.spots}</p>
                  <Link
                    href={`/inscricao?categoria=${option.id}`}
                    className="block w-full text-center py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Fazer inscrição
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Cronograma Resumido */}
          <div className="mb-16">
            <h2 className="section-title text-center mb-12">
              Dia da <span className="text-gradient">Prova</span>
            </h2>
            <div className="max-w-4xl mx-auto card bg-gradient-to-br from-primary-50 to-accent-50">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-primary-600" size={32} />
                <div>
                  <p className="text-sm text-primary-600 uppercase tracking-wide">24 de junho</p>
                  <h3 className="font-display font-bold text-2xl text-gray-900">
                    Cronograma essencial
                  </h3>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold text-primary-600">09h</span> · Encerramento das
                  inscrições presenciais da corrida 2K
                </li>
                <li>
                  <span className="font-semibold text-primary-600">10h</span> · Largada da Corrida
                  Infanto-Juvenil 2K
                </li>
                <li>
                  <span className="font-semibold text-primary-600">11h15</span> · Traslado oficial
                  para a largada do 10K
                </li>
                <li>
                  <span className="font-semibold text-primary-600">12h</span> · Largada da Prova 10K
                  na Fábrica de Cimento Holcim
                </li>
                <li>
                  <span className="font-semibold text-primary-600">13h30</span> · Início da
                  premiação geral, local e por faixas etárias
                </li>
              </ul>
              <Link
                href="/programacao"
                className="inline-flex items-center text-primary-700 font-semibold mt-6 hover:text-primary-800"
              >
                Ver programação completa
                <ChevronRight size={20} className="ml-1" />
              </Link>
            </div>
          </div>

          {/* Premiação Detalhada */}
          <div className="mb-16">
            <h2 className="section-title text-center mb-12">
              <span className="text-gradient">Premiação</span>
            </h2>
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="card">
                <h3 className="font-display font-bold text-2xl mb-6">
                  Geral Masculino e Feminino
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GENERAL_PRIZES.map((item) => (
                    <div
                      key={item.pos}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <span className="font-semibold text-gray-800">{item.pos} lugar</span>
                      <span className="font-bold text-primary-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-gradient-to-br from-amber-50 to-yellow-100">
                  <h3 className="font-display font-bold text-2xl mb-6">Atletas de Macuco</h3>
                  <p className="text-gray-700 mb-4">
                    Premiação exclusiva para os 10 primeiros moradores que concluírem a prova.
                  </p>
                  <div className="space-y-3">
                    {LOCAL_PRIZES.map((item) => (
                      <div
                        key={item.pos}
                        className="flex justify-between items-center p-4 bg-white rounded-lg border border-amber-100"
                      >
                        <span className="font-semibold text-gray-800">{item.pos} lugar</span>
                        <span className="font-bold text-amber-600">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-blue-50 to-indigo-100">
                  <h3 className="font-display font-bold text-2xl mb-4">
                    Faixas Etárias (M/F)
                  </h3>
                  <p className="text-gray-700 mb-4">
                    1º Troféu + R$ 200,00 · 2º R$ 150,00 · 3º R$ 100,00
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AGE_GROUPS.map((group) => (
                      <div key={group} className="p-3 bg-white rounded-lg border border-indigo-100">
                        <p className="font-semibold text-gray-800">{group}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card bg-gray-50 border border-gray-100">
                <h3 className="font-display font-bold text-2xl mb-4">Premiação por Equipes</h3>
                <p className="text-gray-700 mb-2">
                  As três equipes com maior número de atletas concluintes recebem troféus especiais.
                </p>
                <p className="text-sm text-gray-500">
                  Consulte o regulamento para saber como validar a pontuação da equipe.
                </p>
                <Link
                  href="/premiacoes"
                  className="inline-flex items-center text-primary-700 font-semibold mt-4 hover:text-primary-800"
                >
                  Ver premiação completa
                  <ChevronRight size={20} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Kit */}
          <div className="mb-16">
            <h2 className="section-title text-center mb-12">
              O Que Está <span className="text-gradient">Incluído</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {KIT_ITEMS.map((item) => (
                <div key={item.title} className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ChevronRight className="text-primary-600" />
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Regulamento */}
          <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
            <h2 className="font-display font-bold text-2xl mb-6">
              Informações Importantes
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <ChevronRight className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                <span>Idade mínima: 15 anos completos até 31/12/2026</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                <span>Menores de 18 anos precisam de autorização dos responsáveis</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                <span>Atestado médico obrigatório para atletas a partir de 60 anos</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                <span>Percurso medido oficialmente pela organização</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                <span>Cronometragem eletrônica com chip descartável</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                <span>Política de cancelamento conforme regulamento oficial</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/regulamento"
                className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center"
              >
                Ver Regulamento Completo
                <ChevronRight size={20} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h2 className="font-display font-bold text-4xl mb-4">
            Pronto para o Desafio?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Garanta sua vaga na categoria principal da Corrida de Macuco.
          </p>
          <Link
            href="/inscricao?categoria=geral-10k"
            className="btn-primary bg-white text-primary-600 hover:bg-gray-100 inline-block"
          >
            Inscrever-se na Prova 10K
          </Link>
        </div>
      </section>
    </div>
  )
}
