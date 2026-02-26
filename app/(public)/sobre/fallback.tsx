import { Metadata } from 'next'
import { Calendar, Users, MapPin, Trophy, Heart, Target } from 'lucide-react'
import { RACE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Sobre a Corrida | Corrida de Macuco',
  description: 'Conheça a história da Corrida Rústica de Macuco, uma tradição de mais de 50 anos que une esporte, comunidade e superação.',
  keywords: 'história, corrida macuco, tradição, esporte, comunidade',
}

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-display font-bold text-white mb-6">
            Sobre a <span className="text-yellow-300">Corrida</span>
          </h1>
          
          <p className="text-xl text-primary-100 mb-8 max-w-4xl mx-auto">
            A Corrida Rústica de Macuco é mais do que um evento esportivo. 
            É uma tradição que une gerações, fortalece a comunidade e celebra 
            o espírito de superação há mais de 50 anos.
          </p>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Calendar className="w-8 h-8 text-white mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">{RACE_CONFIG.edition}ª</p>
              <p className="text-primary-100 text-sm">Edição</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Users className="w-8 h-8 text-white mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">1000+</p>
              <p className="text-primary-100 text-sm">Participantes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <MapPin className="w-8 h-8 text-white mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">Macuco</p>
              <p className="text-primary-100 text-sm">Sede</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <Trophy className="w-8 h-8 text-white mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">1975</p>
              <p className="text-primary-100 text-sm">Início</p>
            </div>
          </div>
        </div>
      </section>

      {/* História Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Nossa História
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma jornada de mais de cinco décadas promovendo esporte, 
              saúde e integração social em Macuco.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1975</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Primeira Edição</h3>
                    <p className="text-gray-600">
                      Nasce a Corrida Rústica de Macuco com apenas 50 participantes, 
                      idealizada por um grupo de entusiastas do esporte local.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1990</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Expansão</h3>
                    <p className="text-gray-600">
                      A corrida ganha reconhecimento regional e passa a atrair 
                      participantes de outras cidades do estado do Rio de Janeiro.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2010</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Modernização</h3>
                    <p className="text-gray-600">
                      Implementação de cronometragem eletrônica e melhorias 
                      na infraestrutura para proporcionar melhor experiência aos corredores.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2026</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Categorias Especiais</h3>
                    <p className="text-gray-600">
                      Introdução de categorias gratuitas para moradores, 
                      idosos e crianças, democratizando ainda mais o acesso ao esporte.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-8 text-white">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">
                  Tradição e Inovação
                </h3>
                <p className="text-primary-100 leading-relaxed">
                  Ao longo de mais de 50 anos, a Corrida Rústica de Macuco tem evoluído 
                  mantendo sempre o foco no esporte como ferramenta de transformação social, 
                  promovendo saúde, integração e desenvolvimento da comunidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missão e Valores */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Missão e Valores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nossa Missão</h3>
              <p className="text-gray-600 leading-relaxed">
                Promover o esporte como ferramenta de transformação social, 
                incentivando hábitos saudáveis e fortalecendo os laços 
                comunitários em Macuco e região.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nossos Valores</h3>
              <ul className="text-gray-600 space-y-2 text-left">
                <li>• Inclusão e acessibilidade</li>
                <li>• Tradição e inovação</li>
                <li>• Responsabilidade social</li>
                <li>• Excelência no atendimento</li>
                <li>• Sustentabilidade</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nosso Impacto</h3>
              <p className="text-gray-600 leading-relaxed">
                Mais de 50 anos promovendo saúde, integração social e 
                desenvolvimento local, impactando positivamente milhares 
                de vidas em nossa comunidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Organização */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Organização
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A Corrida Rústica de Macuco é organizada por uma equipe dedicada 
              de voluntários e profissionais comprometidos com o sucesso do evento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Comissão Organizadora</h3>
              <p className="text-gray-600 text-sm">
                Grupo de voluntários que planeja e executa todas as atividades do evento.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
              <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Suporte Médico</h3>
              <p className="text-gray-600 text-sm">
                Equipe médica especializada garantindo a segurança de todos os participantes.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
              <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Cronometragem</h3>
              <p className="text-gray-600 text-sm">
                Sistema profissional de cronometragem eletrônica com resultados precisos.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 text-center">
              <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Logística</h3>
              <p className="text-gray-600 text-sm">
                Equipe responsável pela estrutura, segurança e funcionamento do evento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Faça parte desta história!
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Participe da {RACE_CONFIG.edition}ª edição e viva uma experiência única 
            de superação, comunidade e tradição esportiva.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/inscricao"
              className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-lg transition-colors"
            >
              <Users size={24} />
              Inscrever-se Agora
            </a>
            <a
              href="/contato"
              className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-lg transition-colors backdrop-blur-sm"
            >
              <Heart size={24} />
              Ser Voluntário
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

