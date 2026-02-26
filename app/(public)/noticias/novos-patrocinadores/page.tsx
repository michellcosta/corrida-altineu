import { Metadata } from 'next'
import { Calendar, Clock, User, ArrowLeft, Heart, Star } from 'lucide-react'
import Link from 'next/link'
import { RACE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Novos Patrocinadores Confirmados | Corrida de Macuco',
  description: 'Grandes empresas se juntam à Corrida de Macuco para tornar esta edição ainda mais especial.',
  keywords: 'patrocinadores, corrida macuco, apoio, parceiros',
}

export default function NovosPatrocinadoresPage() {
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
            <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
              PATROCÍNIO
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Novos Patrocinadores Confirmados
          </h1>
          
          <div className="flex items-center gap-6 text-primary-100">
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <span>5 de outubro de 2025</span>
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
            <div className="h-64 md:h-80 bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Apoio dos Parceiros</h2>
                <p className="text-lg opacity-90">Tornando a corrida ainda melhor</p>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  É com grande satisfação que anunciamos a confirmação de 
                  <strong> novos patrocinadores para a {RACE_CONFIG.edition}ª Corrida Rústica de Macuco</strong>. 
                  Estas parcerias fortalecem nosso compromisso em oferecer uma experiência única aos participantes.
                </p>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  🌟 Patrocinadores Master
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900">Academia FitLife</h3>
                        <p className="text-blue-700 text-sm">Patrocinador Master</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Apoio completo com estrutura de aquecimento, alongamento e 
                      suporte técnico durante toda a prova.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900">Farmácia Saúde Total</h3>
                        <p className="text-green-700 text-sm">Patrocinador Master</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Suporte médico completo com equipe especializada e 
                      postos de atendimento ao longo do percurso.
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  💪 Patrocinadores Oficiais
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200 text-center">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-purple-900 mb-2">Restaurante Sabor & Vida</h3>
                    <p className="text-gray-700 text-sm">Alimentação pós-prova</p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-200 text-center">
                    <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-orange-900 mb-2">Loja Esportiva Corrida+</h3>
                    <p className="text-gray-700 text-sm">Equipamentos e acessórios</p>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-6 border border-red-200 text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-red-900 mb-2">Hotel Pousada Macuco</h3>
                    <p className="text-gray-700 text-sm">Hospedagem especial</p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  🎁 Benefícios para os Participantes
                </h2>
                
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6 mb-6">
                  <p className="text-gray-700 mb-4">
                    Graças ao apoio dos nossos patrocinadores, os participantes terão acesso a:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700">Desconto de 20% na Academia FitLife</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700">Kit de primeiros socorros personalizado</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700">Refeição pós-prova gratuita</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700">Desconto de 15% em equipamentos</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700">Tarifa especial de hospedagem</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-primary-600" />
                      <span className="text-gray-700">Consultoria nutricional gratuita</span>
                    </li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  🤝 Como Aproveitar os Benefícios
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <div>
                        <p className="font-semibold text-gray-900">Faça sua inscrição</p>
                        <p className="text-gray-600 text-sm">Complete sua inscrição na corrida</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <div>
                        <p className="font-semibold text-gray-900">Receba seu kit</p>
                        <p className="text-gray-600 text-sm">No kit estará incluído cupons de desconto</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <div>
                        <p className="font-semibold text-gray-900">Aproveite os benefícios</p>
                        <p className="text-gray-600 text-sm">Use os cupons nos estabelecimentos parceiros</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-primary-600 rounded-lg p-8 text-center text-white mt-8">
                  <h3 className="text-2xl font-bold mb-4">Agradecemos nossos parceiros!</h3>
                  <p className="text-primary-100 mb-6">
                    Sem o apoio dos nossos patrocinadores, não seria possível oferecer 
                    uma experiência tão completa aos participantes da corrida.
                  </p>
                  <Link
                    href="/inscricao"
                    className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-lg transition-colors"
                  >
                    <Heart size={24} />
                    Inscrever-se e Aproveitar
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







