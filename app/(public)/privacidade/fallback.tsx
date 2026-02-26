'use client'

import { Shield, Lock, Database, UserCheck } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'

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

export default function PrivacidadeFallback() {
  return (
    <div className="pt-24">
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl space-y-6">
            <Shield size={56} className="text-white" />
            <h1 className="font-display font-bold text-5xl md:text-6xl">
              Política de Privacidade
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Transparência no tratamento das informações coletadas para a Corrida Rústica de São João Batista.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom max-w-5xl space-y-12">
          <div className="card bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3 mb-4 text-emerald-800">
              <Lock size={22} />
              <h2 className="font-display font-bold text-2xl">Resumo</h2>
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed">
              Coletamos apenas as informações necessárias para gerir inscrições, comunicação e operações da corrida. Os
              dados são tratados conforme a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018) e armazenados em
              ambientes controlados.
            </p>
          </div>

          <div className="space-y-8">
            {dataUses.map((section) => (
              <div key={section.title} className="card">
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2 text-gray-700 leading-relaxed">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card bg-gradient-to-br from-emerald-50 to-teal-50">
              <h3 className="font-display font-bold text-xl text-emerald-800 mb-3 flex items-center gap-2">
                <Database size={20} />
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

            <div className="card bg-gray-50">
              <h3 className="font-display font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
                <UserCheck size={20} />
                Como exercer seus direitos
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Para solicitar acesso, correção ou exclusão dos seus dados pessoais, envie um e-mail para{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 font-semibold">
                  {CONTACT_EMAIL}
                </a>{' '}
                com o assunto “Privacidade - Solicitação”. Responderemos em até 15 dias, conforme a LGPD.
              </p>
              <p className="text-xs text-gray-500">
                Em caso de conflito não resolvido diretamente conosco, você pode contatar a Autoridade Nacional de
                Proteção de Dados (ANPD).
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Esta política foi atualizada em {new Date().toLocaleDateString('pt-BR')}. Alterações futuras serão publicadas
            neste mesmo endereço.
          </p>
        </div>
      </section>
    </div>
  )
}
