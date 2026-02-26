import { Metadata } from 'next'
import { Calendar, Clock, User, ArrowLeft, CheckCircle, Gift } from 'lucide-react'
import Link from 'next/link'
import { RACE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Inscrições Abertas para a 51ª Edição | Corrida de Macuco',
  description: 'As inscrições para a 51ª Corrida Rústica de Macuco estão oficialmente abertas. Não perca esta oportunidade!',
  keywords: 'inscrições abertas, corrida macuco, 51ª edição, 2026',
}

export default function InscricoesAbertasPage() {
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
              INSCRIÇÕES
            </span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
              DESTAQUE
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Inscrições Abertas para a {RACE_CONFIG.edition}ª Edição!
          </h1>
          
          <div className="flex items-center gap-6 text-primary-100">
            <div className="flex items-center gap-2">
              <Calendar size={20} />
              <span>15 de outubro de 2025</span>
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
            <div className="h-64 md:h-80 bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gift size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Inscrições Oficialmente Abertas!</h2>
                <p className="text-lg opacity-90">51ª Corrida Rústica de Macuco</p>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-gray-700 leading-relaxed mb-6">
                  É com grande alegria que anunciamos a abertura oficial das inscrições para a 
                  <strong> {RACE_CONFIG.edition}ª Corrida Rústica de Macuco</strong>, 
                  que acontecerá no dia <strong>{RACE_CONFIG.raceDateFormatted}</strong>.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  Esta edição promete ser ainda mais especial, com novidades que vão tornar 
                  a experiência dos participantes inesquecível. Não perca a oportunidade de 
                  fazer parte desta tradição que já dura mais de 50 anos!
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  🎯 Categorias Disponíveis
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-2">Geral 10K</h3>
                    <p className="text-blue-700 text-sm mb-2">R$ 20,00</p>
                    <p className="text-gray-600 text-sm">Para corredores a partir de 15 anos</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="font-bold text-green-900 mb-2">Morador de Macuco 10K</h3>
                    <p className="text-green-700 text-sm mb-2">GRATUITO</p>
                    <p className="text-gray-600 text-sm">Para residentes de Macuco</p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <h3 className="font-bold text-purple-900 mb-2">60+ 10K</h3>
                    <p className="text-purple-700 text-sm mb-2">GRATUITO</p>
                    <p className="text-gray-600 text-sm">Para corredores de 60+ anos</p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                    <h3 className="font-bold text-orange-900 mb-2">Infantil 2K</h3>
                    <p className="text-orange-700 text-sm mb-2">GRATUITO</p>
                    <p className="text-gray-600 text-sm">Para crianças até 14 anos</p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  📋 Como se Inscrever
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <div>
                        <p className="font-semibold text-gray-900">Acesse o sistema de inscrições</p>
                        <p className="text-gray-600 text-sm">Clique no botão &quot;Inscrever-se&quot; no site</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <div>
                        <p className="font-semibold text-gray-900">Escolha sua categoria</p>
                        <p className="text-gray-600 text-sm">Selecione a categoria que melhor se adequa ao seu perfil</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <div>
                        <p className="font-semibold text-gray-900">Preencha seus dados</p>
                        <p className="text-gray-600 text-sm">Informe seus dados pessoais e de contato</p>
                      </div>
                    </li>
                    
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                      <div>
                        <p className="font-semibold text-gray-900">Finalize o pagamento</p>
                        <p className="text-gray-600 text-sm">Para categorias pagas, complete o pagamento online</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  ⚠️ Informações Importantes
                </h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">As inscrições são limitadas por categoria</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Documentos de comprovação devem ser apresentados no dia da prova</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Kit de corrida será retirado no dia 23/06/2026</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Inscrições encerram em {RACE_CONFIG.registrationCloseDate}</span>
                    </li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
                  🎁 O que está Incluído
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Camiseta oficial da prova</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Número de peito</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Chip de cronometragem</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Medalha de participação</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Certificado digital</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Seguro durante a prova</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-600 rounded-lg p-8 text-center text-white mt-8">
                  <h3 className="text-2xl font-bold mb-4">Não perca esta oportunidade!</h3>
                  <p className="text-primary-100 mb-6">
                    Faça parte da história da Corrida Rústica de Macuco. 
                    Inscreva-se agora e garante sua vaga na {RACE_CONFIG.edition}ª edição.
                  </p>
                  <Link
                    href="/inscricao"
                    className="inline-flex items-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-lg transition-colors"
                  >
                    <Gift size={24} />
                    Inscrever-se Agora
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


