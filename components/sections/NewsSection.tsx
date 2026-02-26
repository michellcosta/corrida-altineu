import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'

const news = [
  {
    title: 'Inscrições para 51ª Edição Abertas',
    excerpt: '2º lote disponível com valores promocionais. Garanta sua vaga antes que esgote!',
    date: '10 Jan 2025',
    category: 'Inscrições',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800',
    href: '/noticias/inscricoes-abertas-51-edicao',
  },
  {
    title: 'Percurso 2025 Divulgado',
    excerpt: 'Confira o mapa completo, altimetria e os pontos de hidratação da prova.',
    date: '08 Jan 2025',
    category: 'Percurso',
    image: 'https://images.unsplash.com/photo-1586466849048-05d0c2ab2c94?q=80&w=800',
    href: '/noticias/percurso-2025',
  },
  {
    title: 'Novos Patrocinadores',
    excerpt: 'Conheça as empresas que apoiam a maior corrida rústica da região.',
    date: '05 Jan 2025',
    category: 'Parcerias',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800',
    href: '/noticias/novos-patrocinadores',
  },
]

export default function NewsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="section-title">
              Últimas <span className="text-gradient">Notícias</span>
            </h2>
            <p className="section-subtitle">
              Fique por dentro de todas as novidades
            </p>
          </div>
          <Link
            href="/noticias"
            className="hidden md:flex items-center text-primary-600 hover:text-primary-700 font-semibold group"
          >
            Ver todas
            <ArrowRight
              size={20}
              className="ml-2 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((article) => (
            <Link
              key={article.title}
              href={article.href}
              className="group card"
            >
              <div className="relative overflow-hidden rounded-lg mb-4">
                <div
                  className="h-48 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url(${article.image})` }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Calendar size={16} className="mr-2" />
                {article.date}
              </div>

              <h3 className="text-xl font-display font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {article.title}
              </h3>

              <p className="text-gray-600 mb-4">{article.excerpt}</p>

              <div className="flex items-center text-primary-600 font-semibold group-hover:gap-2 transition-all">
                Ler mais
                <ArrowRight
                  size={18}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            href="/noticias"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
          >
            Ver todas as notícias
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}








