import { Calendar, Clock, MapPin, Flag, Users, Trophy } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Programação | Corrida de Macuco',
  description:
    'Cronograma oficial da Corrida de Macuco: horários de largada, encerramento de inscrições e cerimônias de premiação.',
}

const CRONOGRAMA_DIA_PROVA = [
  {
    horario: '09:00',
    titulo: 'Encerramento das inscrições da Corrida Infanto-Juvenil',
    local: 'Praça Prof. João Brasil (Secretaria da Prova)',
    descricao:
      'Último horário para confirmar participação presencialmente na prova de 2 km.',
    importante: true,
  },
  {
    horario: '10:00',
    titulo: 'Largada Corrida Infanto-Juvenil - 2 KM',
    local: 'Entrada do Goiabal',
    descricao:
      'Percurso até a Praça Prof. João Brasil, com chegada pelo portal oficial do evento.',
    destaque: true,
  },
  {
    horario: '11:00',
    titulo: 'Concentração Geral e Aquecimento Guiado',
    local: 'Praça Prof. João Brasil',
    descricao:
      'Ponto de encontro dos atletas da prova principal com alongamento coletivo e orientações finais.',
  },
  {
    horario: '12:00',
    titulo: 'Largada Corrida de 10 KM',
    local: 'Fábrica de Cimento Holcim',
    descricao:
      'Saída oficial rumo à Praça Prof. João Brasil, em Macuco, com apoio logístico completo ao longo do trajeto.',
    destaque: true,
  },
  {
    horario: '13:30',
    titulo: 'Início da Premiação Geral, Local e por Faixas Etárias',
    local: 'Palco Principal - Praça Prof. João Brasil',
    descricao:
      'Entrega de troféus, valores em dinheiro e reconhecimento às equipes com maior número de atletas.',
  },
]

const DADOS_PROVA = [
  {
    icone: <Clock size={20} className="text-red-600" />,
    titulo: 'Horário oficial da largada do 10 KM',
    descricao: '12h em ponto, com deslocamento assistido até a linha de partida.',
  },
  {
    icone: <MapPin size={20} className="text-red-600" />,
    titulo: 'Chegada',
    descricao: 'Praça Prof. João Brasil, centro de Macuco, com estrutura de som e hidratação.',
  },
  {
    icone: <Flag size={20} className="text-red-600" />,
    titulo: 'Percurso principal',
    descricao: '10 km entre a Fábrica de Cimento Holcim e a Praça Prof. João Brasil.',
  },
  {
    icone: <Users size={20} className="text-red-600" />,
    titulo: 'Equipes',
    descricao:
      'As três equipes com maior número de atletas concluintes recebem troféus especiais.',
  },
]

export default function ProgramacaoPage() {
  return (
    <div className="pt-24">
      <section className="bg-gradient-to-r from-red-700 to-red-500 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl space-y-6">
            <Calendar size={64} className="text-white" />
            <h1 className="font-display font-bold text-5xl md:text-6xl">
              Programação Oficial
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Fique atento aos horários-chave da Corrida de Macuco: encerramento
              das inscrições, largadas e cerimônia de premiação.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom space-y-16">
          <div className="card">
            <h2 className="font-display font-bold text-3xl mb-8">
              Dia da Prova — 24 de Junho
            </h2>
            <div className="space-y-6">
              {CRONOGRAMA_DIA_PROVA.map((item) => (
                <div
                  key={item.horario + item.titulo}
                  className="border-l-4 border-red-600/70 pl-6 py-4 bg-red-50/40 rounded-r-xl"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="text-red-600" size={20} />
                    <span className="font-semibold text-red-700 text-lg">
                      {item.horario}
                    </span>
                    {item.destaque && (
                      <span className="inline-flex items-center rounded-full bg-red-600 text-white text-xs font-semibold px-3 py-1">
                        Largada
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-xl text-gray-900">
                    {item.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold text-gray-700">Local:</span>{' '}
                    {item.local}
                  </p>
                  <p className="text-gray-700">{item.descricao}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
            <div className="card">
              <div className="flex items-start gap-3 mb-6">
                <Trophy className="text-red-600 mt-1" size={28} />
                <div>
                  <h2 className="font-display font-bold text-3xl">
                    Informações da Prova de 10 KM
                  </h2>
                  <p className="text-gray-600">
                    Confira os principais detalhes logísticos para alinhar sua
                    chegada e deslocamento até a largada.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {DADOS_PROVA.map((info) => (
                  <div
                    key={info.titulo}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {info.icone}
                      <h3 className="font-semibold text-gray-900">
                        {info.titulo}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700">{info.descricao}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 via-teal-50 to-green-100">
              <div className="flex items-start gap-3 mb-4">
                <Flag className="text-teal-600 mt-1" size={24} />
                <div>
                  <h2 className="font-display font-bold text-2xl">
                    Corrida Infanto-Juvenil
                  </h2>
                  <p className="text-gray-600">
                    Distância oficial de 2 km, válida para atletas de 11 a 14
                    anos.
                  </p>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li>
                  <strong>Inscrições presenciais:</strong> encerram às 9h na
                  Praça Prof. João Brasil.
                </li>
                <li>
                  <strong>Largada:</strong> 10h, na entrada do Goiabal, com
                  chegada na Praça Prof. João Brasil.
                </li>
                <li>
                  <strong>Premiação:</strong> valores em dinheiro do 1º ao 10º
                  lugar, conforme regulamento.
                </li>
              </ul>
              <Link
                href="/premiacoes#corrida-infanto-juvenil"
                className="inline-block mt-6 text-teal-700 font-semibold hover:text-teal-800"
              >
                Ver detalhes de premiação →
              </Link>
            </div>
          </div>

          <div className="card bg-gray-50">
            <h2 className="font-display font-bold text-2xl mb-4">
              Recomendações Gerais
            </h2>
            <ul className="space-y-3 text-gray-700 text-sm">
              <li>
                <strong>Traslado até a largada:</strong> haverá condução oficial
                partindo da Praça Prof. João Brasil às 11h15 para os atletas
                inscritos na prova de 10 km.
              </li>
              <li>
                <strong>Hidratação e kit pós-prova:</strong> disponíveis na área
                de dispersão logo após a chegada.
              </li>
              <li>
                <strong>Medalhas:</strong> todos os concluintes recebem medalha
                de participação, conforme regulamento.
              </li>
              <li>
                <strong>Premiação:</strong> apresente documento com foto para
                recebimento de troféus e valores em dinheiro.
              </li>
            </ul>
          </div>

          <section className="py-12 text-center bg-gradient-to-r from-red-700 to-red-500 text-white rounded-3xl">
            <h2 className="font-display font-bold text-4xl mb-4">
              Ainda não garantiu sua inscrição?
            </h2>
            <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
              Não deixe para a última hora. As inscrições presenciais encerram-se
              às 9h do dia da prova para a categoria infanto-juvenil.
            </p>
            <Link
              href="/inscricao"
              className="inline-flex items-center bg-white text-red-600 font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-all"
            >
              Fazer minha inscrição agora
            </Link>
          </section>
        </div>
      </section>
    </div>
  )
}
