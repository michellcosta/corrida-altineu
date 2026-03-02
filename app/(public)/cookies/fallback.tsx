'use client'

import { Cookie, Shield, Settings } from 'lucide-react'
import Link from 'next/link'

const cookieTypes = [
  {
    title: 'Cookies essenciais',
    description: 'Necessários para o funcionamento básico do site. Não podem ser desativados.',
    items: [
      { name: 'Supabase Auth', purpose: 'Manter sessão de login no painel administrativo', duration: 'Sessão' },
      { name: 'Next.js', purpose: 'Sessão e funcionamento da aplicação', duration: 'Sessão' },
    ],
  },
  {
    title: 'Cookies funcionais',
    description: 'Melhoram a experiência do usuário, como preferências e notificações.',
    items: [
      { name: 'Sonner', purpose: 'Exibir notificações e mensagens de feedback na tela', duration: 'Sessão' },
    ],
  },
]

export default function CookiesFallback() {
  return (
    <div className="pt-24">
      <section className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl space-y-6">
            <Cookie size={56} className="text-white" />
            <h1 className="font-display font-bold text-5xl md:text-6xl">
              Política de Cookies
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Saiba como utilizamos cookies no site da Corrida Rústica de São João Batista e como você pode gerenciá-los.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom max-w-5xl space-y-12">
          <div className="card bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-3 mb-4 text-amber-800">
              <Shield size={22} />
              <h2 className="font-display font-bold text-2xl">Resumo</h2>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed">
              Utilizamos apenas cookies essenciais e funcionais para garantir o funcionamento do site e a experiência do usuário.
              Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros. Seus dados são tratados conforme a
              Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018).
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-xl text-gray-900 mb-4">O que são cookies?</h3>
            <p className="text-gray-700 leading-relaxed">
              Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles permitem
              que o site lembre de suas ações e preferências (como login e idioma) por um determinado período.
            </p>
          </div>

          <div className="space-y-8">
            {cookieTypes.map((section) => (
              <div key={section.title} className="card">
                <h3 className="font-display font-bold text-xl text-gray-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-700">Cookie / Tecnologia</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Finalidade</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => (
                        <tr key={item.name} className="border-b border-gray-100">
                          <td className="py-3 text-gray-800">{item.name}</td>
                          <td className="py-3 text-gray-600">{item.purpose}</td>
                          <td className="py-3 text-gray-600">{item.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-gray-50">
            <h3 className="font-display font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
              <Settings size={20} />
              Como gerenciar cookies
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Você pode configurar seu navegador para bloquear ou excluir cookies. As opções geralmente estão em
              &quot;Configurações&quot; ou &quot;Preferências&quot;. Observe que desativar cookies essenciais pode impedir
              o funcionamento correto do site (por exemplo, o login no painel administrativo).
            </p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies
              </li>
              <li>
                <strong>Firefox:</strong> Configurações → Privacidade e segurança → Cookies
              </li>
              <li>
                <strong>Safari:</strong> Preferências → Privacidade → Cookies
              </li>
              <li>
                <strong>Edge:</strong> Configurações → Cookies e permissões do site
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/privacidade"
              className="text-primary-600 font-semibold hover:underline"
            >
              Ver Política de Privacidade
            </Link>
            <Link
              href="/termos"
              className="text-primary-600 font-semibold hover:underline"
            >
              Ver Termos de Uso
            </Link>
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
