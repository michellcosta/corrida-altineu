'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, BookOpen, CheckCircle2, AlertTriangle } from 'lucide-react'

type FAQCategory = {
  id: string
  title: string
  description: string
  items: Array<{ q: string; a: string }>
}

const categories: FAQCategory[] = [
  {
    id: 'inscricoes',
    title: 'Inscrições',
    description: 'Processo de inscrição, pagamento e alterações',
    items: [
      {
        q: 'Como faço minha inscrição?',
        a: 'Acesse /inscricao, escolha a categoria desejada e complete o formulário. Após finalizar o pagamento, você receberá um e-mail de confirmação.',
      },
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'Cartão de crédito, PIX e boleto bancário. Boletos levam até 48h para compensar.',
      },
      {
        q: 'Posso alterar meus dados após a inscrição?',
        a: 'Sim. Até 10 dias antes da prova, envie um e-mail para contato@corridamacuco.com.br informando as alterações desejadas.',
      },
      {
        q: 'Há desconto para grupos ou equipes?',
        a: 'Sim. Equipes com 10 atletas ou mais têm 10% de desconto. Entre em contato para receber um link exclusivo.',
      },
      {
        q: 'Como acompanho o status da minha inscrição?',
        a: 'Use a página /inscricao/acompanhar informando CPF e data de nascimento. Lá você vê status de pagamento e categoria.',
      },
    ],
  },
  {
    id: 'kits',
    title: 'Kits e retirada',
    description: 'Informações sobre retirada e conteúdo do kit',
    items: [
      {
        q: 'Onde e quando retiro meu kit?',
        a: 'Na Praça Prof. João Brasil: sexta-feira (14h às 20h) ou sábado (5h30 às 6h30). Chegue com antecedência de 30 minutos.',
      },
      {
        q: 'Posso retirar o kit de outra pessoa?',
        a: 'Somente com procuração simples, cópia do documento e comprovante de inscrição do atleta.',
      },
      {
        q: 'O que vem no kit?',
        a: 'Camiseta, número de peito com chip, brindes dos patrocinadores e acesso aos postos de hidratação e frutas após a prova.',
      },
      {
        q: 'Posso trocar o tamanho da camiseta?',
        a: 'As camisetas são entregues conforme o tamanho escolhido na inscrição. Trocas dependem de disponibilidade ao final da retirada.',
      },
    ],
  },
  {
    id: 'prova',
    title: 'Dia da Prova',
    description: 'Logística, horários e regras gerais do evento',
    items: [
      {
        q: 'Qual o horário das largadas?',
        a: 'Corrida 10K às 12h (saída da Fábrica de Cimento Holcim) e Corrida Infanto-Juvenil 2K às 10h (entrada do Goiabal).',
      },
      {
        q: 'Haverá guarda-volumes?',
        a: 'Não. Recomendamos levar apenas o essencial e combinar com acompanhantes para guardar pertences.',
      },
      {
        q: 'Há postos de hidratação?',
        a: 'Sim, a cada 2,5 km e na chegada, com água e frutas. Consulte /percursos para ver os pontos exatos.',
      },
      {
        q: 'Posso correr com fones de ouvido?',
        a: 'O uso não é recomendado por segurança. Você precisa ouvir avisos da organização e sinalização do percurso.',
      },
      {
        q: 'Existe tempo limite?',
        a: 'Sim. Corrida 10K: 90 minutos. Corrida 2K: 30 minutos. Atletas que excederem o limite poderão ser encaminhados ao ponto de dispersão.',
      },
    ],
  },
  {
    id: 'pos-prova',
    title: 'Pós-prova e resultados',
    description: 'Resultado oficial, medalhas e atendimento pós-evento',
    items: [
      {
        q: 'Quando os resultados serão divulgados?',
        a: 'Os resultados oficiais serão publicados em até 48 horas após o término da prova na página /resultados.',
      },
      {
        q: 'Todos recebem medalha?',
        a: 'Sim. Atletas que completarem o percurso dentro do tempo limite recebem medalha na chegada.',
      },
      {
        q: 'Como funciona a premiação?',
        a: 'Entregaremos troféus e valores em dinheiro conforme a página /premiacoes. A premiação geral, atletas de Macuco e faixas etárias acontece no palco principal às 13h30.',
      },
      {
        q: 'Há atendimento médico disponível?',
        a: 'Sim. Contamos com ambulâncias, equipe médica e fisioterapeutas na chegada. Em caso de emergência, procure a equipe mais próxima.',
      },
    ],
  },
]

export default function FaqFallback() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  return (
    <div className="pt-24">
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl space-y-6">
            <BookOpen size={56} className="text-white" />
            <h1 className="font-display font-bold text-5xl md:text-6xl">
              Perguntas Frequentes
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Respostas organizadas por tema para você chegar à prova com tudo resolvido.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom space-y-12">
          <div className="card bg-gradient-to-br from-purple-50 to-indigo-50">
            <h2 className="font-display font-bold text-2xl mb-4 flex items-center gap-2 text-indigo-700">
              <CheckCircle2 size={22} />
              Dicas rápidas
            </h2>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-gray-700">
              <p>
                <strong>Status da inscrição:</strong> consulte em <Link href="/inscricao/acompanhar" className="text-indigo-600 font-semibold">/inscricao/acompanhar</Link>.
              </p>
              <p>
                <strong>Resultados:</strong> publicados em até 48h após o evento em <Link href="/resultados" className="text-indigo-600 font-semibold">/resultados</Link>.
              </p>
              <p>
                <strong>Retirada de kits:</strong> sexta (14h-20h) e sábado (5h30-6h30) na Praça Prof. João Brasil.
              </p>
              <p>
                <strong>Suporte:</strong> WhatsApp (22) 99999-9999 – atendimento em até 2h úteis.
              </p>
            </div>
          </div>

          <div className="grid gap-8">
            {categories.map((category) => (
              <div key={category.id} className="card">
                <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">
                  {category.title}
                </h2>
                <p className="text-gray-600 mb-6">{category.description}</p>
                <div className="space-y-3">
                  {category.items.map((item) => {
                    const itemKey = `${category.id}-${item.q}`
                    const isOpen = openItem === itemKey
                    return (
                      <div key={itemKey} className="border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => setOpenItem(isOpen ? null : itemKey)}
                          className="w-full flex justify-between items-start gap-4 text-left px-4 py-3"
                        >
                          <span className="font-semibold text-gray-900">{item.q}</span>
                          <ChevronDown
                            size={22}
                            className={`text-indigo-600 flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-gray-700 leading-relaxed border-t border-gray-100">
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-red-50 border border-red-200">
            <h2 className="font-display font-bold text-2xl flex items-center gap-2 text-red-700 mb-3">
              <AlertTriangle size={22} />
              Emergências e situações especiais
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              No dia da prova, situações médicas ou logísticas urgentes devem ser comunicadas diretamente ao posto de
              comando na Praça Prof. João Brasil. Fora do horário da prova, utilize os canais oficiais listados na página
              /ajuda para um atendimento mais rápido.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
