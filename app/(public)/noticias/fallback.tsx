import { Metadata } from 'next'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { RACE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Notícias | Corrida de Macuco',
  description: 'Fique por dentro das últimas notícias da Corrida Rústica de Macuco. Novidades, atualizações e informações importantes.',
  keywords: 'notícias, corrida macuco, atualizações, novidades',
}

// Mock de notícias - em produção viria do CMS/Supabase
const noticias = [
  {
    id: 'inscricoes-abertas-51-edicao',
    titulo: 'Inscrições Abertas para a 51ª Edição!',
    resumo: 'As inscrições para a 51ª Corrida Rústica de Macuco estão oficialmente abertas. Não perca esta oportunidade!',
    data: '2025-10-15',
    autor: 'Organização',
    categoria: 'Inscrições',
    imagem: '/images/noticias/inscricoes-abertas.jpg',
    destaque: true
  },
  {
    id: 'percurso-2026',
    titulo: 'Novo Percurso 2026 Divulgado',
    resumo: 'Conheça o percurso oficial da 51ª edição com melhorias na segurança e experiência dos corredores.',
    data: '2025-10-10',
    autor: 'Organização',
    categoria: 'Percurso',
    imagem: '/images/noticias/percurso-2026.jpg',
    destaque: false
  },
  {
    id: 'novos-patrocinadores',
    titulo: 'Novos Patrocinadores Confirmados',
    resumo: 'Grandes empresas se juntam à Corrida de Macuco para tornar esta edição ainda mais especial.',
    data: '2025-10-05',
    autor: 'Organização',
    categoria: 'Patrocínio',
    imagem: '/images/noticias/patrocinadores.jpg',
    destaque: false
  },
  {
    id: 'categoria-60-mais',
    titulo: 'Categoria 60+ com Suporte Especial',
    resumo: 'Conheça os benefícios especiais para corredores de 60 anos ou mais na próxima edição.',
    data: '2025-09-28',
    autor: 'Organização',
    categoria: 'Categorias',
    imagem: '/images/noticias/60-mais.jpg',
    destaque: false
  },
  {
    id: 'kit-corredor-2026',
    titulo: 'Kit do Corredor 2026 Apresentado',
    resumo: 'Veja o que está incluído no kit oficial da 51ª edição da Corrida Rústica de Macuco.',
    data: '2025-09-20',
    autor: 'Organização',
    categoria: 'Kit',
    imagem: '/images/noticias/kit-2026.jpg',
    destaque: false
  },
  {
    id: 'record-participacao',
    titulo: 'Recorde de Participação Esperado',
    resumo: 'A organização espera superar o recorde de participantes na 51ª edição da corrida.',
    data: '2025-09-15',
    autor: 'Organização',
    categoria: 'Participação',
    imagem: '/images/noticias/record-participacao.jpg',
    destaque: false
  }
]

export default function NoticiasPage() {
  const noticiaDestaque = noticias.find(n => n.destaque)
  const outrasNoticias = noticias.filter(n => !n.destaque)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-6">
            Notícias e <span className="text-yellow-300">Atualizações</span>
          </h1>
          
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Fique por dentro de todas as novidades da {RACE_CONFIG.edition}ª 
            Corrida Rústica de Macuco. Acompanhe as últimas informações, 
            atualizações e eventos especiais.
          </p>
        </div>
      </section>

      {/* Notícia em Destaque */}
      {noticiaDestaque && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                Destaque da Semana
              </h2>
            </div>
            
            <Link href={`/noticias/${noticiaDestaque.id}`} className="group">
              <article className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <div className="h-64 md:h-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                      <div className="text-center text-white p-8">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar size={32} />
                        </div>
                        <p className="text-sm opacity-90">Imagem da Notícia</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {noticiaDestaque.categoria}
                      </span>
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        DESTAQUE
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
                      {noticiaDestaque.titulo}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {noticiaDestaque.resumo}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {new Date(noticiaDestaque.data).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={16} />
                          {noticiaDestaque.autor}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                        <span>Ler mais</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* Lista de Notícias */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-8 bg-accent-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Todas as Notícias
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {outrasNoticias.map((noticia) => (
              <Link key={noticia.id} href={`/noticias/${noticia.id}`} className="group">
                <article className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Calendar size={24} />
                      </div>
                      <p className="text-sm opacity-90">Imagem da Notícia</p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold">
                        {noticia.categoria}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {noticia.titulo}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                      {noticia.resumo}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(noticia.data).toLocaleDateString('pt-BR')}
                      </div>
                      
                      <div className="flex items-center gap-1 text-primary-600 font-semibold group-hover:gap-2 transition-all">
                        <span>Ler</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Receba as Notícias em Primeira Mão
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Cadastre-se em nossa newsletter e seja o primeiro a saber das novidades!
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-yellow-300"
              />
              <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors">
                Cadastrar
              </button>
            </div>
            <p className="text-primary-100 text-sm mt-3">
              Não enviamos spam. Cancele quando quiser.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

