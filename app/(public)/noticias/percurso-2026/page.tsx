import { Metadata } from 'next'
import { Calendar, Clock, User, ArrowLeft, MapPin, Navigation } from 'lucide-react'
import Link from 'next/link'
import { RACE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Novo Percurso 2026 Divulgado | Corrida de Macuco',
  description: 'Conheça o percurso oficial da 51ª edição com melhorias na segurança e experiência dos corredores.',
  keywords: 'percurso 2026, corrida macuco, rota, mapa',
}

export default function Percurso2026Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Notícia */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/noticias" 
            className="inline-flex items-center gap-2 text-white hover:text-yellow-300 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Voltar às Notícias
          </Link>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              PERCURSO
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Novo Percurso {RACE_CONFIG.year} Divulgado
          </h1>
          
          <div className="flex items-center gap-6 text-primary-100">
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <span>10 de outubro de 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={20} />
              <span>Organização</span>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo da Notícia */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Imagem da Notícia */}
            <div className="h-64 md:h-80 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Navigation size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Percurso Oficial 2026</h2>
                <p className="text-lg opacity-90">Novidades e melhorias</p>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  Após meses de planejamento e estudos, finalmente divulgamos o 
                  <strong> percurso oficial da {RACE_CONFIG.edition}ª Corrida Rústica de Macuco</strong>. 
                  Esta edição traz melhorias significativas na segurança e experiência dos participantes.
                </p>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  🗺️ Principais Mudanças
                </h2>
                
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Largada e chegada na Praça da Matriz (centralizada)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Percurso mais plano, com menos declives acentuados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Postos de hidratação a cada 2km</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Área de apoio médico expandida</span>
                    </li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  📏 Detalhes do Percurso 10K
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-3">Pontos de Referência</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• KM 0: Praça da Matriz</li>
                      <li>• KM 2: Rua das Flores</li>
                      <li>• KM 4: Igreja São João</li>
                      <li>• KM 6: Parque Municipal</li>
                      <li>• KM 8: Escola Municipal</li>
                      <li>• KM 10: Praça da Matriz (chegada)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-3">Postos de Apoio</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• KM 2: Hidratação + Frutas</li>
                      <li>• KM 4: Hidratação + Suporte médico</li>
                      <li>• KM 6: Hidratação + Frutas</li>
                      <li>• KM 8: Hidratação + Suporte médico</li>
                      <li>• KM 10: Chegada com suporte completo</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  👶 Percurso Infantil 2K
                </h2>
                
                <div className="bg-orange-50 rounded-lg p-6 mb-6">
                  <p className="text-gray-700 mb-4">
                    O percurso infantil foi especialmente planejado para ser seguro e divertido 
                    para as crianças participantes:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Largada na Praça da Matriz</li>
                    <li>• Percurso circular pela região central</li>
                    <li>• Postos de hidratação a cada 500m</li>
                    <li>• Acompanhamento de monitores especializados</li>
                    <li>• Chegada na Praça da Matriz</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  🚗 Orientações para Apoio
                </h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Para familiares e torcedores:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Estacionamento disponível na Rua da Paz</li>
                    <li>• Área de torcida na Praça da Matriz</li>
                    <li>• Postos de apoio permitidos apenas em locais específicos</li>
                    <li>• Respeitar as orientações da organização</li>
                  </ul>
                </div>

                <div className="bg-primary-600 rounded-lg p-8 text-center text-white mt-8">
                  <h3 className="text-2xl font-bold mb-4">Explore o Percurso!</h3>
                  <p className="text-primary-100 mb-6">
                    Quer conhecer mais detalhes sobre o percurso? 
                    Acesse nossa página completa com mapa interativo.
                  </p>
                  <Link
                    href="/percursos"
                    className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-lg transition-colors"
                  >
                    <Navigation size={24} />
                    Ver Percurso Completo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}







