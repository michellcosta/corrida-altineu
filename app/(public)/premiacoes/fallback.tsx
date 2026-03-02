'use client'

import { Trophy, Award, Users, Medal, Flag, Clock, MapPin } from 'lucide-react'

const PREMIACAO_GERAL = [
  {
    pos: '1º',
    descricao: 'Troféu General Atrantino Côrtes Coutinho',
    valor: 'R$ 5.000,00',
  },
  {
    pos: '2º',
    descricao: 'Troféu Deputado José Carlos Pires Coutinho',
    valor: 'R$ 2.000,00',
  },
  {
    pos: '3º',
    descricao: 'Troféu Atrantino Pires Coutinho',
    valor: 'R$ 1.500,00',
  },
  {
    pos: '4º',
    descricao: 'Troféu Doutor Junot Abi-Ramia Antônio',
    valor: 'R$ 800,00',
  },
  {
    pos: '5º',
    descricao: 'Troféu Prefeito José Carlos Boaretto',
    valor: 'R$ 600,00',
  },
  {
    pos: '6º',
    descricao: 'Troféu Maestro Voltaire Teixeira Vogas',
    valor: 'R$ 500,00',
  },
  {
    pos: '7º',
    descricao: 'Troféu Professor José Carlos Barbosa',
    valor: 'R$ 400,00',
  },
  {
    pos: '8º',
    descricao: 'Troféu José Gomes Bastos (Zé Baiano)',
    valor: 'R$ 300,00',
  },
  {
    pos: '9º',
    descricao: 'Troféu José Prado',
    valor: 'R$ 200,00',
  },
  {
    pos: '10º',
    descricao: 'Troféu Nilo Peçanha',
    valor: 'R$ 200,00',
  },
]

const PREMIACAO_MACUCO = [
  { pos: '1º', valor: 'R$ 1.000,00' },
  { pos: '2º', valor: 'R$ 500,00' },
  { pos: '3º', valor: 'R$ 400,00' },
  { pos: '4º', valor: 'R$ 300,00' },
  { pos: '5º', valor: 'R$ 200,00' },
  { pos: '6º', valor: 'R$ 200,00' },
  { pos: '7º', valor: 'R$ 200,00' },
  { pos: '8º', valor: 'R$ 100,00' },
  { pos: '9º', valor: 'R$ 100,00' },
  { pos: '10º', valor: 'R$ 100,00' },
]

const PREMIACAO_EQUIPES = [
  { pos: '1º Lugar', premio: 'Troféu' },
  { pos: '2º Lugar', premio: 'Troféu' },
  { pos: '3º Lugar', premio: 'Troféu' },
]

const FAIXAS_ETARIAS = [
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
  '80 anos ou mais',
]

const PREMIO_FAIXA = '1º Troféu + R$ 200,00 • 2º R$ 150,00 • 3º R$ 100,00'

const CORRIDA_INFANTO_JUVENIL = {
  distancia: '2,5 KM (masculino e feminino)',
  faixaEtaria: '11 a 14 anos',
  inscricoes: 'Inscrições se encerram às 9h',
  largada: 'Largada às 10h - Da entrada do Goiabal até Macuco',
  premios: [
    { pos: '1º', valor: 'R$ 250,00' },
    { pos: '2º', valor: 'R$ 200,00' },
    { pos: '3º', valor: 'R$ 100,00' },
    { pos: '4º', valor: 'R$ 100,00' },
    { pos: '5º ao 10º', valor: 'R$ 50,00' },
  ],
}

const NOTAS = [
  'Premiação geral válida para as categorias masculina e feminina.',
  'Medalhas de participação para todos os atletas que concluírem o percurso dentro do tempo previsto.',
  'Os valores em dinheiro serão pagos mediante apresentação de documento oficial com foto.',
  'Atletas de Macuco devem comprovar residência para receber a premiação local.',
]

export default function PremiacoesPage() {
  return (
    <div className="pt-24">
      <section className="bg-gradient-to-r from-red-700 to-red-500 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl space-y-6">
            <Trophy size={64} className="text-white" />
            <h1 className="font-display font-bold text-5xl md:text-6xl">
              Premiações Oficiais
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Premiação da corrida de 10 km com largada na Fábrica de Cimento
              Holcim e chegada na Praça Prof. João Brasil em Macuco. Valores e
              troféus conforme regulamento oficial.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom space-y-16">
          <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div className="card">
              <div className="flex items-start gap-3 mb-6">
                <Award className="text-red-600 mt-1" size={28} />
                <div>
                  <h2 className="font-display font-bold text-3xl">
                    Premiação Geral (Masculino e Feminino)
                  </h2>
                  <p className="text-gray-600">
                    Troféus personalizados e premiação em dinheiro para os 10
                    primeiros colocados em cada categoria.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {PREMIACAO_GERAL.map((item) => (
                  <div
                    key={item.pos}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div>
                      <p className="text-sm text-gray-500">{item.pos} Lugar</p>
                      <p className="font-semibold text-gray-900">
                        {item.descricao}
                      </p>
                    </div>
                    <p className="font-bold text-xl text-red-600 mt-2 md:mt-0">
                      {item.valor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-50 to-orange-50">
              <h3 className="font-display font-bold text-xl mb-4">
                Dados da Prova 10 KM
              </h3>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-start gap-2">
                  <Clock className="text-red-600 mt-1" size={20} />
                  <span>
                    <strong>Largada:</strong> 12h (Fábrica de Cimento Holcim)
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="text-red-600 mt-1" size={20} />
                  <span>
                    <strong>Chegada:</strong> Praça Prof. João Brasil, Macuco
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Flag className="text-red-600 mt-1" size={20} />
                  <span>Distância oficial: 10 km</span>
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-amber-50 to-yellow-100">
            <div className="flex items-start gap-3 mb-6">
              <Users className="text-amber-600 mt-1" size={28} />
              <div>
                <h2 className="font-display font-bold text-3xl">
                  Premiação Atletas de Macuco
                </h2>
                <p className="text-gray-600">
                  Reconhecimento especial para os dez primeiros moradores de
                  Macuco, nas categorias masculina e feminina.
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {PREMIACAO_MACUCO.map((item) => (
                <div
                  key={item.pos}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-100"
                >
                  <span className="font-semibold text-gray-800">
                    {item.pos} Lugar
                  </span>
                  <span className="font-bold text-lg text-amber-600">
                    {item.valor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="card">
              <h2 className="font-display font-bold text-3xl mb-4">
                Premiação por Equipes
              </h2>
              <p className="text-gray-600 mb-6">
                As três equipes com o maior número de atletas concluintes
                recebem troféus especiais.
              </p>
              <div className="space-y-3">
                {PREMIACAO_EQUIPES.map((item) => (
                  <div
                    key={item.pos}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <span className="font-semibold text-gray-800">
                      {item.pos}
                    </span>
                    <span className="font-bold text-lg text-gray-700">
                      {item.premio}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-start gap-3 mb-6">
                <Medal className="text-indigo-600 mt-1" size={28} />
                <div>
                  <h2 className="font-display font-bold text-3xl">
                    Faixas Etárias (Masculino e Feminino)
                  </h2>
                  <p className="text-gray-600">
                    Premiação para os três primeiros colocados de cada faixa.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {FAIXAS_ETARIAS.map((faixa) => (
                  <div
                    key={faixa}
                    className="p-4 bg-white rounded-lg border border-indigo-100"
                  >
                    <p className="font-semibold text-gray-900">{faixa}</p>
                    <p className="mt-2 text-sm text-gray-600">{PREMIO_FAIXA}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            id="corrida-infanto-juvenil"
            className="card bg-gradient-to-br from-teal-50 to-green-100"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              <div className="flex items-start gap-3">
                <Flag className="text-teal-600 mt-1" size={28} />
                <div>
                  <h2 className="font-display font-bold text-3xl">
                    Corrida Infanto-Juvenil
                  </h2>
                  <p className="text-gray-600">
                    {CORRIDA_INFANTO_JUVENIL.distancia} • Faixa etária:{' '}
                    {CORRIDA_INFANTO_JUVENIL.faixaEtaria}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <p>{CORRIDA_INFANTO_JUVENIL.inscricoes}</p>
                <p>{CORRIDA_INFANTO_JUVENIL.largada}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {CORRIDA_INFANTO_JUVENIL.premios.map((item) => (
                <div
                  key={item.pos}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-100"
                >
                  <span className="font-semibold text-gray-800">
                    {item.pos} Lugar
                  </span>
                  <span className="font-bold text-lg text-green-600">
                    {item.valor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gray-50">
            <h2 className="font-display font-bold text-2xl mb-6">
              Informações Importantes
            </h2>
            <ul className="space-y-3 text-gray-700">
              {NOTAS.map((nota) => (
                <li key={nota} className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span>{nota}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
