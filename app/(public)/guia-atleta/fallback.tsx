'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'
import { useState } from 'react'

type GuiaSection = {
  id: string
  title: string
  content: Array<{
    subtitle: string
    items: string[]
  }>
}

type FaqItem = {
  q: string
  a: string
}

const guiaSections: GuiaSection[] = [
  {
    id: 'documentos',
    title: '📄 Documentação Necessária',
    content: [
      {
        subtitle: 'Para todos os atletas',
        items: [
          'RG ou CNH original (cópia não será aceita)',
          'Comprovante de inscrição impresso ou salvo no celular',
          'Termo de responsabilidade assinado (disponível no site)',
        ],
      },
      {
        subtitle: 'Menores de 18 anos',
        items: [
          'Autorização do responsável com firma reconhecida',
          'Documento do responsável (RG ou CNH)',
          'Certidão de nascimento ou RG do menor',
        ],
      },
      {
        subtitle: 'Categoria 60+',
        items: [
          'Atestado médico específico para corrida emitido há no máximo 30 dias',
          'Todos os documentos mencionados acima',
        ],
      },
    ],
  },
  {
    id: 'preparacao',
    title: '🏃‍♂️ Preparação para a Prova',
    content: [
      {
        subtitle: 'Nos dias anteriores',
        items: [
          'Hidrate-se bem (2 a 3 litros de água por dia)',
          'Evite treinos intensos nos 3 dias que antecedem a prova',
          'Durma ao menos 7 horas por noite',
          'Prefira refeições leves e ricas em carboidratos',
          'Não experimente alimentos novos',
        ],
      },
      {
        subtitle: 'No dia da prova',
        items: [
          'Tome café da manhã leve 2 a 3 horas antes (frutas, pão, mel)',
          'Hidratação moderada antes da largada',
          'Chegue com 30 a 45 minutos de antecedência',
          'Faça aquecimento leve e alongamentos dinâmicos',
          'Use roupas e tênis já testados nos treinos',
        ],
      },
    ],
  },
  {
    id: 'dia-prova',
    title: '📝 Checklist do Dia',
    content: [
      {
        subtitle: 'O que levar',
        items: [
          '📄 Documentos (RG, comprovante de inscrição)',
          '🔢 Número de peito preso na camiseta',
          '⏱️ Chip de cronometragem no tênis',
          '💧 Garrafa de água (opcional)',
          '📱 Celular para contato e fotos',
          '🧢 Boné ou viseira',
          '🧴 Protetor solar',
          '👕 Roupa de troca',
        ],
      },
      {
        subtitle: 'O que não levar',
        items: [
          '💎 Objetos de valor',
          '🎧 Fones de ouvido (por segurança)',
          '🎒 Mochilas grandes',
          '🐶 Animais de estimação',
        ],
      },
    ],
  },
  {
    id: 'hospedagem',
    title: '🏨 Hospedagem',
    content: [
      {
        subtitle: 'Hotéis parceiros com desconto',
        items: [
          'Hotel Macuco Plaza – R$ 180/noite (15% off) – (22) 3267-1000',
          'Pousada Serra Verde – R$ 120/noite (10% off) – (22) 3267-2000',
          'Hotel Centro – R$ 100/noite (20% off) – (22) 3267-3000',
          'Pousada Cantinho Rural – R$ 90/noite (10% off) – (22) 3267-4000',
        ],
      },
      {
        subtitle: 'Dica',
        items: [
          'Mencione “Corrida de Macuco 2026” ao reservar',
          'Faça a reserva com antecedência, principalmente para sexta-feira',
        ],
      },
    ],
  },
  {
    id: 'alimentacao',
    title: '🍽️ Alimentação',
    content: [
      {
        subtitle: 'Restaurantes parceiros',
        items: [
          'Restaurante do Porto – frutos do mar – (22) 3267-5000',
          'Cantina Italiana – massas – (22) 3267-6000',
          'Churrascaria Gaúcha – carnes – (22) 3267-7000',
          'Bistrô Orgânico – opções saudáveis – (22) 3267-8000',
          'Pizzaria Bella – pizzas especiais – (22) 3267-9000',
        ],
      },
      {
        subtitle: 'Antes da prova',
        items: [
          'Refeição leve até 3 horas antes da largada',
          'Evite alimentos gordurosos ou muito condimentados',
          'Não utilize suplementos que você não esteja acostumado',
        ],
      },
    ],
  },
  {
    id: 'logistica',
    title: '🚗 Logística e Transporte',
    content: [
      {
        subtitle: 'Para chegar à largada',
        items: [
          'Acesso pela Fábrica de Cimento Holcim (vagas limitadas para carros)',
          'Condução oficial saindo da Praça Prof. João Brasil às 11h15',
          'Recomenda-se carona solidária ou transporte por aplicativo',
        ],
      },
      {
        subtitle: 'Acesso à chegada',
        items: [
          'Chegada na Praça Prof. João Brasil (Centro de Macuco)',
          'Estacionamento gratuito na Rua das Flores',
          'Estacionamento oficial (R$ 15) com vigilância 24h',
        ],
      },
    ],
  },
]

const faqs: FaqItem[] = [
  {
    q: 'Posso correr com fone de ouvido?',
    a: 'Não é recomendado por questões de segurança. É importante ouvir avisos da organização e estar atento ao entorno.',
  },
  {
    q: 'Posso usar meu próprio chip de cronometragem?',
    a: 'Não. Todos devem utilizar o chip fornecido pela organização, que já vem junto ao número de peito.',
  },
  {
    q: 'E se chover no dia da prova?',
    a: 'A prova acontece com chuva. Apenas em casos extremos (temporal, raios) pode haver adiamento, sempre comunicado nos canais oficiais.',
  },
  {
    q: 'Posso levar meu cachorro?',
    a: 'Não é permitida a presença de animais na prova para garantir a segurança de todos os corredores.',
  },
  {
    q: 'Há guarda-volumes?',
    a: 'Não haverá guarda-volumes oficial. Leve apenas o essencial e combine com acompanhantes para guardar seus pertences.',
  },
  {
    q: 'Posso me inscrever no dia da prova?',
    a: 'Somente em caso de desistência. Procure a equipe da organização na Praça Prof. João Brasil no dia da prova para verificar disponibilidade.',
  },
  {
    q: 'Onde vejo os resultados?',
    a: 'Os resultados serão publicados no site em até 48 horas após o término da prova.',
  },
]

export default function GuiaAtletaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="pt-24">
      <section className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl">
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Guia do Atleta
            </h1>
            <p className="text-xl text-cyan-100 leading-relaxed">
              Tudo o que você precisa saber para chegar pronto à 51ª Corrida Rústica de São João Batista.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="space-y-8">
            {guiaSections.map((section) => (
              <div key={section.id} className="card">
                <h2 className="font-display font-bold text-2xl md:text-3xl mb-6">
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {section.content.map((block, idx) => (
                    <div key={`${section.id}-${idx}`}>
                      <h3 className="font-bold text-lg mb-3 text-primary-600">
                        {block.subtitle}
                      </h3>
                      <ul className="space-y-2">
                        {block.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-3">
                            <ChevronRight className="text-primary-600 mt-1 flex-shrink-0" size={20} />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <h2 className="section-title text-center mb-12">
              Perguntas <span className="text-gradient">Frequentes</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={faq.q} className="card">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex justify-between items-start gap-4 text-left"
                  >
                    <span className="font-semibold text-lg text-gray-900">{faq.q}</span>
                    <ChevronDown
                      className={`text-primary-600 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''
                        }`}
                      size={24}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 card bg-gradient-to-br from-blue-50 to-cyan-50">
            <h2 className="font-display font-bold text-2xl mb-6">Ainda tem dúvidas?</h2>
            <p className="text-gray-700 mb-6">
              Nossa equipe está pronta para ajudar. Entre em contato:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <p className="font-semibold mb-3">WhatsApp Suporte</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Organização</span>
                    <a href="https://wa.me/5521983821217" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-medium">Thiago - Organização: (21) 98382-1217</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Organização</span>
                    <a href="https://wa.me/5521988862910" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-medium">Felipe - Organização: (21) 98886-2910</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cronometragem</span>
                    <a href="https://wa.me/5521982267030" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-medium">Mário - Cronometragem: (21) 98226-7030</a>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Suporte Site</span>
                    <a href="https://wa.me/5521968686880" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-medium">Michell - Site: (21) 96868-6880</a>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-2">Email</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:text-primary-700">
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
