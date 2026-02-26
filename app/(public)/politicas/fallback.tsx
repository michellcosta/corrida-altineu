import { Metadata } from 'next'
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Política de Cancelamento | Corrida de Macuco',
  description: 'Política de cancelamento e reembolso da Corrida Rústica de Macuco. Conheça as condições para cancelamento de inscrições.',
  keywords: 'política cancelamento, reembolso, corrida macuco',
}

export default function PoliticasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FileText className="w-12 h-12 text-white" />
            <h1 className="text-4xl font-display font-bold text-white">
              Política de <span className="text-yellow-300">Cancelamento</span>
            </h1>
          </div>
          
          <p className="text-xl text-primary-100 mb-8 max-w-4xl mx-auto">
            Conheça nossa política de cancelamento e reembolso. 
            Entendemos que imprevistos podem acontecer e queremos ser transparentes 
            sobre as condições para cancelamento de inscrições.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12">
              
              {/* Cancelamento por Solicitação */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  Cancelamento por Solicitação do Participante
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-4">Prazos para Reembolso</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                        <div>
                          <p className="font-medium text-gray-900">Até 30 dias antes da prova</p>
                          <p className="text-gray-600 text-sm">Reembolso de 100% do valor pago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                        <div>
                          <p className="font-medium text-gray-900">Entre 15 e 30 dias antes da prova</p>
                          <p className="text-gray-600 text-sm">Reembolso de 50% do valor pago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                        <div>
                          <p className="font-medium text-gray-900">Menos de 15 dias antes da prova</p>
                          <p className="text-gray-600 text-sm">Não há reembolso disponível</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Como Solicitar Cancelamento</h3>
                    <ol className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <span>Entre em contato via e-mail: {CONTACT_EMAIL}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <span>Informe o número da inscrição e motivo do cancelamento</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <span>Forneça os dados bancários para reembolso (se aplicável)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                        <span>Aguarde o processamento em até 7 dias úteis</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Cancelamento por Força Maior */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                  Cancelamento por Força Maior
                </h2>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="font-semibold text-orange-900 mb-4">Situações de Força Maior</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Condições climáticas adversas que impossibilitem a realização da prova</li>
                    <li>• Emergências de saúde pública (pandemia, epidemias)</li>
                    <li>• Problemas de infraestrutura ou segurança</li>
                    <li>• Decisões governamentais que impeçam a realização do evento</li>
                    <li>• Outros eventos imprevisíveis e inevitáveis</li>
                  </ul>
                  
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Em caso de cancelamento por força maior:</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• Não haverá reembolso monetário</li>
                      <li>• O valor pago será convertido em crédito para a próxima edição</li>
                      <li>• O crédito terá validade de 12 meses</li>
                      <li>• A organização comunicará o cancelamento com antecedência mínima de 24h</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Categorias Gratuitas */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                  Categorias Gratuitas
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    Para as categorias gratuitas (Morador de Macuco, 60+ e Infantil), 
                    não há taxa de inscrição, portanto não se aplica política de reembolso.
                  </p>
                  
                  <h3 className="font-semibold text-blue-900 mb-3">Para cancelar inscrição gratuita:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Entre em contato via e-mail informando o cancelamento</li>
                    <li>• A vaga será liberada para outros interessados</li>
                    <li>• Não há penalidades por cancelamento</li>
                    <li>• Recomendamos avisar com antecedência para liberar a vaga</li>
                  </ul>
                </div>
              </section>

              {/* Transferência de Inscrição */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                  Transferência de Inscrição
                </h2>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    Em casos especiais, é possível transferir a inscrição para outra pessoa.
                  </p>
                  
                  <h3 className="font-semibold text-purple-900 mb-3">Condições para Transferência:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Solicitação deve ser feita com pelo menos 7 dias de antecedência</li>
                    <li>• Taxa de transferência: R$ 5,00</li>
                    <li>• Nova pessoa deve atender aos requisitos da categoria</li>
                    <li>• Documentos devem ser atualizados</li>
                    <li>• Transferência é permitida apenas uma vez por inscrição</li>
                  </ul>
                </div>
              </section>

              {/* Contato */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Dúvidas sobre Cancelamento?</h3>
                <p className="text-gray-700 mb-4">
                  Nossa equipe está pronta para esclarecer qualquer dúvida sobre nossa 
                  política de cancelamento e reembolso.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">E-mail</h4>
                    <p className="text-primary-600">contato@corridamacuco.com.br</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">WhatsApp</h4>
                    <p className="text-primary-600">(22) 99999-9999</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

