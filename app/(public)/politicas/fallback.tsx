import { Metadata } from 'next'
import { Shield, Lock, Database, UserCheck, FileText } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Corrida de Macuco',
  description: 'Política de privacidade da Corrida Rústica de Macuco. Conheça como tratamos seus dados conforme a LGPD.',
  keywords: 'política privacidade, LGPD, dados pessoais, corrida macuco',
}

const dataUses = [
  {
    title: '1. Coleta de Dados',
    items: [
      'Dados cadastrais: nome completo, CPF, data de nascimento, gênero, e-mail e telefone.',
      'Informações de endereço e contato para categorias especiais (Morador 10K, Infantil, etc.).',
      'Dados médicos básicos (ex.: alergias) quando informados voluntariamente pelo atleta.',
      'Comprovantes anexados (documento oficial, comprovante de residência, autorização de menor).',
    ],
  },
  {
    title: '2. Finalidades',
    items: [
      'Gerenciar inscrições, categorias e listas de largada.',
      'Emitir recibos e notas fiscais quando aplicável.',
      'Comunicar informações relevantes sobre o evento (alterações de percurso, horários, logística).',
      'Divulgar resultados e estatísticas oficiais após o término da prova.',
    ],
  },
  {
    title: '3. Compartilhamento',
    items: [
      'Prestadores que auxiliam na cronometragem e na infraestrutura do evento (chips, impressão de números).',
      'Órgãos públicos quando houver exigência legal, como seguro obrigatório ou atendimento médico.',
      'Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais.',
    ],
  },
  {
    title: '4. Armazenamento',
    items: [
      'Os dados são armazenados em servidores com controle de acesso e criptografia em repouso.',
      'Documentos enviados ficam disponíveis apenas para a equipe responsável pela validação das inscrições.',
      'Mantemos os dados pelo tempo necessário para cumprir obrigações legais e estatísticas do evento.',
    ],
  },
  {
    title: '5. Direitos do Atleta',
    items: [
      'Confirmar a existência de tratamento de dados.',
      'Solicitar correção de informações incompletas ou desatualizadas.',
      'Requerer a exclusão dos dados pessoais após o evento, observadas obrigações legais.',
      'Revogar o consentimento para comunicações de marketing a qualquer momento.',
    ],
  },
  {
    title: '6. Segurança',
    items: [
      'Utilizamos HTTPS em todo o site e restringimos o acesso administrativo por autenticação segura.',
      'Processos internos preveem revisão periódica de permissões e registros de auditoria.',
      'Nosso time é instruído a manipular dados sensíveis apenas quando estritamente necessário.',
    ],
  },
]

export default function PoliticasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="w-12 h-12 text-white" />
            <h1 className="text-4xl font-display font-bold text-white">
              Política de <span className="text-yellow-300">Privacidade</span>
            </h1>
          </div>

          <p className="text-xl text-primary-100 mb-8 max-w-4xl mx-auto">
            Transparência no tratamento das informações coletadas para a Corrida Rústica de Macuco.
            Seus dados são tratados conforme a Lei Geral de Proteção de Dados (LGPD).
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12">
              {/* Resumo */}
              <div className="mb-12 bg-primary-50 border border-primary-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4 text-primary-800">
                  <Lock className="w-6 h-6" />
                  <h2 className="font-display font-bold text-2xl">Resumo</h2>
                </div>
                <p className="text-primary-900 leading-relaxed">
                  Coletamos apenas as informações necessárias para gerir inscrições, comunicação e operações da corrida.
                  Os dados são tratados conforme a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018) e armazenados
                  em ambientes controlados.
                </p>
              </div>

              {/* Seções */}
              <div className="space-y-10">
                {dataUses.map((section) => (
                  <section key={section.title}>
                    <h3 className="font-display font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      {section.title}
                    </h3>
                    <ul className="space-y-2 text-gray-700 leading-relaxed">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-1 text-primary-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              {/* Bases legais e Contato */}
              <div className="grid gap-6 lg:grid-cols-2 mt-12">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                  <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Bases legais utilizadas
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>
                      <strong>Execução de contrato:</strong> processamento da inscrição e participação no evento.
                    </li>
                    <li>
                      <strong>Obrigação legal:</strong> guarda de registros para fins fiscais e de segurança.
                    </li>
                    <li>
                      <strong>Consentimento:</strong> envio de comunicações promocionais e uso de imagem.
                    </li>
                    <li>
                      <strong>Legítimo interesse:</strong> prevenção de fraudes e melhoria da experiência do participante.
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary-600" />
                    Como exercer seus direitos
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    Para solicitar acesso, correção ou exclusão dos seus dados pessoais, envie um e-mail para{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 font-semibold hover:underline">
                      {CONTACT_EMAIL}
                    </a>{' '}
                    com o assunto &quot;Privacidade - Solicitação&quot;. Responderemos em até 15 dias, conforme a LGPD.
                  </p>
                  <p className="text-xs text-gray-500">
                    Em caso de conflito não resolvido diretamente conosco, você pode contatar a Autoridade Nacional de
                    Proteção de Dados (ANPD).
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-8">
                Esta política foi atualizada em {new Date().toLocaleDateString('pt-BR')}. Alterações futuras serão
                publicadas neste mesmo endereço.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
