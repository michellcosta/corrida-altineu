import Link from 'next/link'
import { Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">51ª</span>
              </div>
              <div>
                <p className="font-display font-bold text-xl text-white">
                  Corrida de Macuco
                </p>
                <p className="text-xs text-gray-400">Desde 1974</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Há 51 anos promovendo saúde, esporte e união na cidade de Macuco e região.
            </p>
            <div className="flex space-x-3 mt-4">
              <a
                href="https://www.instagram.com/corridademacuco/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              {[
                { name: 'Sobre a Corrida', href: '/sobre' },
                { name: 'Regulamento', href: '/regulamento' },
                { name: 'Percursos', href: '/percursos' },
                { name: 'Premiações', href: '/premiacoes' },
                { name: 'Resultados', href: '/resultados' },
                { name: 'Galeria', href: '/galeria' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              Suporte
            </h3>
            <ul className="space-y-2">
              {[
                { name: 'Central de Ajuda', href: '/ajuda' },
                { name: 'FAQ', href: '/faq' },
                { name: 'Guia do Atleta', href: '/guia-atleta' },
                { name: 'Política de Cancelamento', href: '/politicas' },
                { name: 'Termos de Uso', href: '/termos' },
                { name: 'Privacidade', href: '/privacidade' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Prefeitura Municipal de Macuco<br />
                  Centro, Macuco - RJ
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-primary-400 flex-shrink-0" />
                <a href="tel:+552232678000" className="text-sm hover:text-primary-400">
                  (22) 3267-8000
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-primary-400 flex-shrink-0" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm hover:text-primary-400"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/inscricao"
                className="inline-block w-full text-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Inscreva-se Agora
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Corrida Rústica de Macuco. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/termos" className="hover:text-primary-400">
                Termos
              </Link>
              <Link href="/privacidade" className="hover:text-primary-400">
                Privacidade
              </Link>
              <Link href="/cookies" className="hover:text-primary-400">
                Cookies
              </Link>
              <Link href="/admin/login" className="hover:text-primary-400">
                Login Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


