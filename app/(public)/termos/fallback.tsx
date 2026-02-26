'use client'

import { CalendarDays, FileText, Scale, ShieldCheck } from 'lucide-react'

const sections = [
  {
    title: '1. Aceitação dos Termos',
    content: [
      'Ao se inscrever na Corrida Rústica de São João Batista, o atleta declara ter lido, compreendido e aceitado integralmente estes termos.',
      'A inscrição é pessoal e intransferível. Não é permitida a substituição de participantes.',
    ],
  },
  {
    title: '2. Inscrições e Pagamentos',
    content: [
      'As inscrições são realizadas exclusivamente pelo site oficial. O pagamento pode ser feito por cartão de crédito, PIX ou boleto bancário.',
      'O atleta é responsável por garantir que os dados informados no formulário estejam corretos e atualizados.',
      'Não realizamos reembolso em caso de desistência. Situações médicas comprovadas podem ser avaliadas pela organização mediante laudo assinado por profissional habilitado.',
    ],
  },
  {
    title: '3. Documentação e Retirada de Kits',
    content: [
      'A retirada de kits é realizada mediante apresentação de documento oficial com foto e comprovante de inscrição.',
      'Atletas menores de 18 anos devem apresentar autorização do responsável legal com firma reconhecida, além de cópia do documento do responsável.',
      'Os kits não retirados nos horários divulgados não serão entregues após o evento.',
    ],
  },
  {
    title: '4. Participação no Evento',
    content: [
      'O atleta declara estar apto do ponto de vista físico e médico para a prática de corrida de rua, assumindo total responsabilidade por sua participação.',
      'É obrigatório o uso do número de peito com chip fornecido pela organização. O atleta deve posicioná-lo na parte frontal da camiseta.',
      'Não é permitido correr com bicicletas, patins, animais ou qualquer item que possa prejudicar outros participantes.',
      'Não haverá guarda-volumes oficial. A organização não se responsabiliza por objetos pessoais perdidos ou extraviados.',
    ],
  },
  {
    title: '5. Saúde e Segurança',
    content: [
      'Haverá ambulâncias e equipe médica na chegada e ao longo do percurso. Em caso de emergência, o atleta será encaminhado ao serviço público de saúde.',
      'A organização poderá impedir a participação de atletas que apresentem sinais de exaustão extrema ou risco à própria segurança.',
    ],
  },
  {
    title: '6. Direitos de Imagem e Uso de Dados',
    content: [
      'Ao participar do evento, o atleta autoriza o uso de sua imagem (fotos e vídeos) para divulgação da corrida em mídias sociais, site e materiais promocionais, sem ônus para a organização.',
      'Os dados pessoais informados na inscrição são tratados conforme a Política de Privacidade. Utilizamos essas informações para comunicação sobre o evento, classificação e estatísticas.',
    ],
  },
  {
    title: '7. Resultados e Premiação',
    content: [
      'Os resultados oficiais serão divulgados no site em até 48 horas após o término da prova.',
      'A premiação em dinheiro e troféus será entregue conforme cronograma divulgado em /premiacoes. O atleta deve apresentar documento com foto para retirar a premiação.',
      'Em caso de identificação de irregularidades (uso de atalhos, troca de chip, conduta antidesportiva), o atleta será desclassificado, perdendo o direito a qualquer premiação.',
    ],
  },
  {
    title: '8. Cancelamento e Alterações',
    content: [
      'A organização pode adiar ou cancelar o evento por motivos de força maior, como condições climáticas extremas ou questões de segurança pública.',
      'Caso o evento seja cancelado por determinação da organização, os inscritos serão informados sobre nova data ou procedimento alternativo. Não há garantia de reembolso integral.',
    ],
  },
]

export default function TermosFallback() {
  return (
    <div className="pt-24">
      <section className="bg-gradient-to-r from-slate-800 to-slate-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl space-y-6">
            <FileText size={56} className="text-white" />
            <h1 className="font-display font-bold text-5xl md:text-6xl">Termos de Uso</h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Este documento apresenta as normas, responsabilidades e condições que regem a participação na Corrida
              Rústica de São João Batista.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom space-y-10 max-w-5xl">
          <div className="card bg-slate-50 border border-slate-200">
            <h2 className="font-display font-bold text-2xl text-slate-800 flex items-center gap-3 mb-4">
              <CalendarDays size={24} />
              Dados do Evento
            </h2>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>
                <strong>Evento:</strong> 51ª Corrida Rústica de São João Batista (também chamada Corrida de Macuco).
              </li>
              <li>
                <strong>Data prevista:</strong> {new Date('2026-07-24').toLocaleDateString('pt-BR')}.
              </li>
              <li>
                <strong>Organização:</strong> Secretaria Municipal de Esporte e Lazer de Macuco.
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="card">
                <h3 className="font-display font-bold text-xl text-slate-900 mb-3">{section.title}</h3>
                <ul className="space-y-2 text-gray-700 leading-relaxed">
                  {section.content.map((paragraph, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 text-slate-400">•</span>
                      <span>{paragraph}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="card bg-slate-900 text-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={24} />
              <h2 className="font-display font-bold text-2xl">Responsabilidade do Atleta</h2>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              O atleta declara estar em plenas condições de saúde para participar da corrida, assumindo integral
              responsabilidade pelos riscos inerentes à prática esportiva. A organização recomenda avaliação médica prévia
              e acompanhamento profissional durante a preparação. Em caso de dúvidas ou sintomas adversos, procure
              imediatamente um médico.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Este documento pode ser atualizado a qualquer momento para refletir alterações operacionais ou regulatórias.
            A versão mais recente estará sempre disponível neste endereço.
          </p>
        </div>
      </section>
    </div>
  )
}
