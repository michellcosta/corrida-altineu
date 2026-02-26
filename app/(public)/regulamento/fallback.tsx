import { Metadata } from 'next'
import { FileText, Calendar, Users, Award, AlertTriangle, CheckCircle, Shield } from 'lucide-react'
import { RACE_CONFIG, CONTACT_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Regulamento | Corrida de Macuco',
  description: 'Regulamento oficial da 51ª Corrida Rústica de Macuco. Conheça todas as regras, categorias e procedimentos do evento.',
  keywords: 'regulamento, corrida macuco, regras, categorias, procedimentos',
}

export default function RegulamentoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FileText className="w-12 h-12 text-white" />
            <h1 className="text-4xl font-display font-bold text-white">
              Regulamento <span className="text-yellow-300">Oficial</span>
            </h1>
          </div>
          
          <p className="text-xl text-primary-100 mb-8 max-w-4xl mx-auto">
            Regulamento oficial da {RACE_CONFIG.edition}ª Corrida Rústica de Macuco. 
            Leia atentamente todas as regras e procedimentos antes de se inscrever.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 text-white">
              <Calendar className="w-6 h-6" />
              <span className="font-semibold">Data da Prova: {RACE_CONFIG.raceDateFormatted}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Índice */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Índice do Regulamento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="#geral" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <FileText className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">1. Disposições Gerais</span>
            </a>
            <a href="#categorias" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Users className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">2. Categorias</span>
            </a>
            <a href="#inscricoes" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <CheckCircle className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">3. Inscrições</span>
            </a>
            <a href="#premiacao" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Award className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">4. Premiação</span>
            </a>
            <a href="#obrigacoes" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <AlertTriangle className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">5. Obrigações</span>
            </a>
            <a href="#penalidades" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <AlertTriangle className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">6. Penalidades</span>
            </a>
            <a href="#saude" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Shield className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-900">7. Saúde e Isenção de Responsabilidade</span>
            </a>
          </div>
        </div>
      </section>

      {/* Conteúdo do Regulamento */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12">
              
              {/* 1. Disposições Gerais */}
              <section id="geral" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Disposições Gerais
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">1.1 Objetivo</h3>
                    <p className="text-gray-700 leading-relaxed">
                      A {RACE_CONFIG.edition}ª Corrida Rústica de Macuco é um evento esportivo que tem por objetivo 
                      promover a prática de corrida de rua, estimular hábitos saudáveis e integrar a comunidade 
                      de Macuco e região através do esporte.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">1.2 Data e Local</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Data:</strong> {RACE_CONFIG.raceDateFormatted}</li>
                      <li>• <strong>Local:</strong> Praça da Matriz, Macuco-RJ</li>
                      <li>• <strong>Horário de Largada:</strong> 07:00 (10K) | 08:30 (2K)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">1.3 Organização</h3>
                    <p className="text-gray-700 leading-relaxed">
                      O evento é organizado pela Comissão Organizadora da Corrida Rústica de Macuco, 
                      com apoio da Prefeitura Municipal e patrocinadores oficiais.
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. Categorias */}
              <section id="categorias" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Categorias
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">2.1 Geral 10K</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Distância:</strong> 10 quilômetros</li>
                      <li>• <strong>Valor:</strong> R$ 20,00</li>
                      <li>• <strong>Idade:</strong> A partir de 15 anos completos até 31/12/{RACE_CONFIG.year}</li>
                      <li>• <strong>Vagas:</strong> 500 participantes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-3">2.2 Morador de Macuco 10K</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Distância:</strong> 10 quilômetros</li>
                      <li>• <strong>Valor:</strong> GRATUITO</li>
                      <li>• <strong>Idade:</strong> A partir de 15 anos completos até 31/12/{RACE_CONFIG.year}</li>
                      <li>• <strong>Requisito:</strong> Comprovante de residência em Macuco</li>
                      <li>• <strong>Vagas:</strong> 200 participantes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-3">2.3 60+ 10K</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Distância:</strong> 10 quilômetros</li>
                      <li>• <strong>Valor:</strong> GRATUITO</li>
                      <li>• <strong>Idade:</strong> 60 anos ou mais completos até 31/12/{RACE_CONFIG.year}</li>
                      <li>• <strong>Vagas:</strong> 100 participantes</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                    <h3 className="font-semibold text-orange-900 mb-3">2.4 Infantil 2K</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Distância:</strong> 2 quilômetros</li>
                      <li>• <strong>Valor:</strong> GRATUITO</li>
                      <li>• <strong>Idade:</strong> Até 14 anos completos até 31/12/{RACE_CONFIG.year}</li>
                      <li>• <strong>Requisito:</strong> Autorização do responsável legal</li>
                      <li>• <strong>Vagas:</strong> 300 participantes</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 3. Inscrições */}
              <section id="inscricoes" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Inscrições
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">3.1 Período de Inscrições</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Abertura:</strong> {RACE_CONFIG.registrationOpenDate}</li>
                      <li>• <strong>Encerramento:</strong> {RACE_CONFIG.registrationCloseDate}</li>
                      <li>• <strong>Forma:</strong> Exclusivamente online através do site oficial</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">3.2 Documentos Necessários</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• RG ou CPF válido</li>
                      <li>• <strong>Estrangeiros:</strong> Documento de responsável brasileiro</li>
                      <li>• <strong>Morador de Macuco:</strong> Comprovante de residência</li>
                      <li>• <strong>Infantil:</strong> Autorização do responsável legal</li>
                      <li>• <strong>60+:</strong> Documento comprovando idade (recomendado atestado médico)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">3.3 Pagamento</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Categoria Geral:</strong> Pagamento online via PIX, cartão ou boleto</li>
                      <li>• <strong>Categorias Gratuitas:</strong> Sem cobrança de taxa</li>
                      <li>• Confirmação da inscrição sujeita à aprovação dos documentos</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 4. Premiação */}
              <section id="premiacao" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Premiação
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">4.1 Premiação Geral 10K</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Masculino</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>1º lugar: R$ 500,00</li>
                            <li>2º lugar: R$ 300,00</li>
                            <li>3º lugar: R$ 200,00</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Feminino</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>1º lugar: R$ 500,00</li>
                            <li>2º lugar: R$ 300,00</li>
                            <li>3º lugar: R$ 200,00</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">4.2 Premiação Especial</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Morador de Macuco:</strong> Troféus para os 3 primeiros colocados</li>
                      <li>• <strong>60+:</strong> Premiação especial para todos os participantes</li>
                      <li>• <strong>Infantil:</strong> Medalhas de participação para todos</li>
                      <li>• <strong>Geral:</strong> Todos os participantes recebem medalha de participação</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 5. Obrigações */}
              <section id="obrigacoes" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Obrigações dos Participantes
                </h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>Apresentar documento de identidade no dia da prova</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>Retirar o kit de corrida na data e local determinados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>Usar o número de peito fornecido pela organização</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>Seguir o percurso oficial sinalizado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>Respeitar as orientações dos organizadores e fiscais</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>Apresentar comprovantes específicos conforme a categoria</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 6. Penalidades */}
              <section id="penalidades" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Penalidades e Desclassificações
                </h2>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Desclassificação por não apresentar documentos obrigatórios</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Desclassificação por não usar o número oficial</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Desclassificação por desrespeitar outros participantes</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Desclassificação por usar atalhos ou sair do percurso oficial</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Eliminação por comportamento inadequado ou agressivo</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 7. Saúde e Isenção de Responsabilidade */}
              <section id="saude" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Saúde, Riscos e Isenção de Responsabilidade
                </h2>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Ao efetuar a inscrição, o participante declara estar ciente e de acordo com todos os itens abaixo, 
                  que integram o regulamento do evento:
                </p>

                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 mb-3">7.1 Termo de Responsabilidade de Acidentes</h3>
                    <p className="text-gray-700 leading-relaxed italic">
                      &ldquo;Declaro, para os devidos fins, estar ciente de toda a regulamentação, regras e exigências do evento esportivo no qual me inscrevo e, por isso, isento a organização e toda a equipe envolvida, seja pessoa física ou jurídica, de qualquer responsabilidade, caso ocorra algum acidente durante o evento esportivo e após a data de realização.&rdquo;
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 mb-3">7.2 Declaração de Aptidão Física e Saúde</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Declaro estar em plenas condições físicas e psicológicas para participar deste evento.</li>
                      <li>• Declaro não possuir contraindicação médica para a prática de corrida de rua.</li>
                      <li>• Estou ciente de que realizei (ou me responsabilizo por não ter realizado) avaliação médica adequada, incluindo teste ergométrico e exames pertinentes.</li>
                      <li>• Declaro conhecer meu estado de saúde e minha capacidade física para participar da prova.</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 mb-3">7.3 Ciência dos Riscos</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Estou ciente dos riscos inerentes à prática de corrida de rua, incluindo, mas não se limitando a: mal súbito, lesões musculares, desidratação, problemas cardiovasculares e acidentes durante o percurso.</li>
                      <li>• Participo por livre e espontânea vontade, assumindo integralmente os riscos da atividade.</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 mb-3">7.4 Responsabilidade do Atleta</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Assumo total responsabilidade pelos dados fornecidos na inscrição e pela veracidade das declarações de saúde.</li>
                      <li>• Em caso de não apresentar atestado médico de aptidão física quando exigido, isento a organização de quaisquer ocorrências decorrentes de minhas próprias limitações físicas ou psicológicas.</li>
                      <li>• Assumo custos com hospedagem, transporte, seguros, assistência médica e demais despesas decorrentes da minha participação.</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 mb-3">7.5 Recusa de Assistência Médica</h3>
                    <p className="text-gray-700 leading-relaxed italic">
                      &ldquo;Por motivos pessoais ou religiosos, afirmo que me responsabilizo pela recusa de assistência médica, isentando a organização e qualquer pessoa física ou jurídica ligada ao evento de responsabilidade perante minha recusa por auxílio médico necessário durante a competição.&rdquo;
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 mb-3">7.6 Limitação Após o Tempo da Prova</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Após o encerramento do tempo limite da prova e a reabertura do trânsito, participantes que permaneçam no percurso continuam sob sua exclusiva responsabilidade.
                    </p>
                  </div>
                </div>
              </section>

              {/* Observações Finais */}
              <section className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <h3 className="font-bold text-primary-900 mb-4">Observações Importantes</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• A organização se reserva o direito de alterar o regulamento a qualquer momento</li>
                  <li>• Em caso de cancelamento por força maior, não haverá reembolso</li>
                  <li>• As inscrições são pessoais e intransferíveis</li>
                  <li>• Para dúvidas, entre em contato: {CONTACT_EMAIL}</li>
                </ul>
              </section>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

