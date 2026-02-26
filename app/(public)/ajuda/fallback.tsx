'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { CONTACT_EMAIL } from '@/lib/constants'
import {
  LifeBuoy,
  MessageSquare,
  Phone,
  Clock,
  Mail,
  ArrowRight,
  FileText,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'

const quickLinks = [
  { label: 'Acompanhar inscrição', href: '/inscricao/acompanhar' },
  { label: 'Guia do Atleta', href: '/guia-atleta' },
  { label: 'Regulamento Completo', href: '/regulamento' },
  { label: 'Premiações', href: '/premiacoes' },
  { label: 'Percursos', href: '/percursos' },
]

const supportChannels = [
  {
    icon: Phone,
    title: 'Telefone',
    description: 'Segunda a sexta, 9h às 17h',
    value: '(22) 3267-8000',
    href: 'tel:+552232678000',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp',
    description: 'Resposta em até 2h úteis',
    value: '(22) 99999-9999',
    href: 'https://wa.me/5522999999999',
  },
  {
    icon: Mail,
    title: 'E-mail',
    description: 'Retorno em até 24h úteis',
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
]

const faqGroups = [
  {
    title: 'Inscrições e Pagamentos',
    items: [
      {
        q: 'Como confirmar minha inscrição?',
        a: 'Após finalizar o pagamento, você receberá um e-mail de confirmação. Também é possível consultar o status em /inscricao/acompanhar usando CPF e data de nascimento.',
      },
      {
        q: 'Posso transferir minha inscrição para outra pessoa?',
        a: 'Não. As inscrições são pessoais e intransferíveis conforme o regulamento.',
      },
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'Cartão de crédito, PIX e boleto. Pagamentos por boleto levam até 48h para compensar.',
      },
      {
        q: 'Existe reembolso em caso de desistência?',
        a: 'Não realizamos reembolso. Em situações médicas comprovadas, fale com a organização através do e-mail para avaliarmos caso a caso.',
      },
    ],
  },
  {
    title: 'Retirada de Kit',
    items: [
      {
        q: 'Quais documentos preciso levar?',
        a: 'Documento oficial com foto e comprovante de inscrição. Menores devem levar autorização do responsável com firma reconhecida.',
      },
      {
        q: 'Posso retirar o kit de outra pessoa?',
        a: 'Somente com procuração simples, cópia do documento e comprovante de inscrição do atleta.',
      },
      {
        q: 'O que vem no kit?',
        a: 'Camiseta, número de peito com chip, medalha (entregue após a prova) e brindes dos parceiros, além de acesso aos postos de hidratação.',
      },
    ],
  },
  {
    title: 'Dia da Prova',
    items: [
      {
        q: 'Haverá guarda-volumes?',
        a: 'Não haverá guarda-volumes oficial. Leve apenas o essencial e combine com acompanhantes.',
      },
      {
        q: 'Há postos de hidratação?',
        a: 'Sim, a cada 2,5 km e na chegada, com água e frutas.',
      },
      {
        q: 'O que acontece se chover?',
        a: 'A prova ocorre mesmo com chuva. Apenas em condições extremas faremos adiamento, comunicado nas redes oficiais.',
      },
      {
        q: 'Posso me inscrever no dia?',
        a: 'Somente caso haja desistência. Procure a organização na Praça Prof. João Brasil no dia da prova para verificar vagas remanescentes.',
      },
    ],
  },
  {
    title: 'Resultados e Pós-prova',
    items: [
      {
        q: 'Quando saem os resultados?',
        a: 'Os resultados serão publicados no site em até 48 horas após o término da prova.',
      },
      {
        q: 'Receberei medalha?',
        a: 'Sim. Todos os atletas que completarem o percurso dentro do tempo limite recebem medalha de participação.',
      },
    ],
  },
]

const documents = [
  {
    title: 'Regulamento Oficial',
    description: 'Documento completo com todas as regras e categorias.',
    href: '/regulamento',
  },
  {
    title: 'Termo de Responsabilidade',
    description: 'Obrigatório para retirada do kit e participação.',
    href: '/termos',
  },
  {
    title: 'Política de Privacidade',
    description: 'Como tratamos seus dados pessoais e inscrições.',
    href: '/privacidade',
  },
]

export default function AjudaFallback() {
  const computedFaqs = useMemo(() => faqGroups, [])

  return (
    <div className="pt-24">
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl space-y-6">
            <LifeBuoy size={56} className="text-white" />
            <h1 className="font-display font-bold text-5xl md:text-6xl">
              Central de Ajuda
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Encontre respostas rápidas, baixe documentos importantes e fale com a nossa equipe de suporte.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom space-y-16">
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="card">
              <h2 className="font-display font-bold text-3xl mb-6">
                Como podemos ajudar hoje?
              </h2>
              <p className="text-gray-600 mb-8">
                As respostas abaixo cobrem as dúvidas mais frequentes. Para detalhes completos, consulte o Guia do Atleta
                ou o Regulamento.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:border-primary-400 hover:text-primary-600 transition-colors"
                  >
                    <span className="font-semibold">{link.label}</span>
                    <ArrowRight
                      size={18}
                      className="text-gray-400 group-hover:text-primary-600 transition-colors"
                    />
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="card bg-gradient-to-br from-blue-50 to-cyan-50">
                <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2 text-blue-800">
                  <HelpCircle size={22} />
                  Atendimento
                </h3>
                <p className="text-gray-600 mb-6">
                  Nosso time está disponível para ajudar de segunda a sexta-feira. No dia da prova, a equipe de suporte
                  fica concentrada na Praça Prof. João Brasil a partir das 8h.
                </p>
                <div className="space-y-4">
                  {supportChannels.map(({ icon: Icon, title, description, value, href }) => (
                    <Link
                      key={title}
                      href={href}
                      className="flex items-start gap-3 rounded-lg border border-blue-100 bg-white px-4 py-3 hover:border-blue-300 transition-colors"
                    >
                      <Icon className="mt-1 text-blue-600" size={20} />
                      <div>
                        <p className="font-semibold text-gray-900">{title}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                        <p className="text-sm text-blue-600 font-semibold">{value}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="font-display font-bold text-xl mb-4 flex items-center gap-2 text-gray-900">
                  <Clock size={22} />
                  Prazos importantes
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>
                    <span className="font-semibold text-gray-900">Retirada de kits:</span> sexta-feira (14h às 20h) e
                    sábado (5h30 às 6h30) na Praça Prof. João Brasil.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900">Resultados oficiais:</span> publicados em até 48h após a
                    prova.
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900">Contato direto no dia da prova:</span> tenda de suporte
                    ao lado da área de largada.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-3xl mb-8 text-center">
              Perguntas Frequentes
            </h2>
            <div className="grid gap-6">
              {computedFaqs.map((group) => (
                <div key={group.title} className="card">
                  <h3 className="font-display font-semibold text-xl text-primary-700 mb-4">
                    {group.title}
                  </h3>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={item.q} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                        <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                        <p className="text-gray-700 leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-r from-primary-50 to-blue-50">
            <h2 className="font-display font-bold text-2xl mb-6">
              Documentos e Políticas
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {documents.map((doc) => (
                <Link
                  key={doc.title}
                  href={doc.href}
                  className="flex items-start gap-3 rounded-lg border border-primary-100 bg-white px-4 py-3 hover:border-primary-300 transition-colors"
                >
                  <FileText className="mt-1 text-primary-600" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">{doc.title}</p>
                    <p className="text-sm text-gray-600">{doc.description}</p>
                  </div>
                  <ExternalLink className="ml-auto mt-1 text-primary-400" size={18} />
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-display font-bold text-2xl mb-4 text-gray-900">
              Precisa de ajuda personalizada?
            </h2>
            <p className="text-gray-600 mb-6">
              Envie sua dúvida com nome completo, CPF, número de inscrição (se houver) e uma breve descrição do problema.
              Quanto mais detalhes, mais rápido conseguimos responder.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                Enviar e-mail
              </Link>
              <Link
                href="https://wa.me/5522999999999"
                className="btn-secondary inline-flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Falar no WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
