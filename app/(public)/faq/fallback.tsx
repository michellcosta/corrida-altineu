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
        a: 'Acesse /inscricao, escolha a categoria desejada e complete o formulário. Após finalizar o pagamento via PIX, você receberá um e-mail de confirmação.',
      },
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'Somente PIX.',
      },
      {
        q: 'Posso alterar meus dados após a inscrição?',
        a: 'Sim. Você pode editar seus dados a qualquer momento na página Acompanhar Inscrição.',
      },
      {
        q: 'Há desconto para grupos ou equipes?',
        a: 'Sim. Equipes com 10 atletas ou mais têm 10% de desconto. Entre em contato para receber um link exclusivo.',
      },
      {
        q: 'Como acompanho o status da minha inscrição?',
        a: 'Use a página Acompanhar Inscrição informando seu CPF. Lá você vê status de pagamento e categoria.',
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
        a: 'Na Praça de Macuco, no dia da prova (24/06/2026), das 08:00 às 11:00 da manhã.',
      },
      {
        q: 'Posso retirar o kit de outra pessoa?',
        a: 'Somente com autorização assinada, cópia do documento e comprovante de inscrição do atleta.',
      },
      {
        q: 'O que vem no kit?',
        a: 'Número de peito com chip, medalha (entregue após a prova), além de acesso aos postos de hidratação.',
      },
      {
        q: 'Posso trocar o tamanho da camiseta?',
        a: 'As camisetas são entregues conforme a disponibilidade ao final da retirada.',
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
        a: 'Corrida 10K às 08:00h e Corrida Infanto-Juvenil 2K às 09:30h.',
      },
      {
        q: 'Haverá guarda-volumes?',
        a: 'Não. Recomendamos levar apenas o essencial e combinar com acompanhantes para guardar pertences.',
      },
      {
        q: 'Há postos de hidratação?',
        a: 'Sim, a cada 2 km e na chegada.',
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
                <strong>Status da inscrição:</strong> consulte na página <Link href="/inscricao/acompanhar" className="text-indigo-600 font-semibold">Acompanhar Inscrição</Link>.
              </p>
              <p>
                <strong>Resultados:</strong> publicados em até 48h após o evento em <Link href="/resultados" className="text-indigo-600 font-semibold">/resultados</Link>.
              </p>
              <p>
                <strong>Retirada de kits:</strong> no dia da prova (24/06/2026) das 08:00 às 11:00 na Praça de Macuco.
              </p>
              <div className="space-y-1">
                <p><strong>Suporte WhatsApp:</strong></p>
                <ul className="list-none space-y-1 ml-0">
                  <li>• Thiago (Org.): <a href="https://wa.me/5521983821217" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">(21) 98382-1217</a></li>
                  <li>• Felipe (Org.): <a href="https://wa.me/5521988862910" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">(21) 98886-2910</a></li>
                  <li>• Mário (Cron.): <a href="https://wa.me/5521982267030" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">(21) 98226-7030</a></li>
                  <li>• Michell (Site): <a href="https://wa.me/5521968686880" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">(21) 96868-6880</a></li>
                </ul>
                <p className="text-[10px] text-gray-500 mt-1">Atendimento em até 24h úteis.</p>
              </div>
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
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              No dia da prova, situações médicas ou logísticas urgentes devem ser comunicadas diretamente ao posto de
              comando na Praça de Macuco. Fora do horário da prova, utilize os canais oficiais abaixo para um atendimento mais rápido.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Thiago (Org.)</span>
                <a href="https://wa.me/5521983821217" target="_blank" rel="noopener noreferrer" className="text-red-700 font-semibold hover:underline">(21) 98382-1217</a>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Felipe (Org.)</span>
                <a href="https://wa.me/5521988862910" target="_blank" rel="noopener noreferrer" className="text-red-700 font-semibold hover:underline">(21) 98886-2910</a>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Mário (Cron.)</span>
                <a href="https://wa.me/5521982267030" target="_blank" rel="noopener noreferrer" className="text-red-700 font-semibold hover:underline">(21) 98226-7030</a>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Michell (Site)</span>
                <a href="https://wa.me/5521968686880" target="_blank" rel="noopener noreferrer" className="text-red-700 font-semibold hover:underline">(21) 96868-6880</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
