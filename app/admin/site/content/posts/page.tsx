'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Edit, Loader2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  status: string
  published_at: string | null
  created_at: string
}

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('posts')
        .select('id, slug, title, excerpt, status, published_at, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setPosts(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Posts do Blog</h1>
            <p className="text-gray-600">Gerencie artigos, notícias e conteúdo do blog.</p>
          </div>
          <button
            onClick={() => router.push('/admin/site/content/posts/new')}
            className="admin-button-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Post
          </button>
        </div>

        <div className="admin-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum post cadastrado. Crie o primeiro post.
            </div>
          ) : (
<div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Publicado em</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id}>
                      <td className="font-semibold">{p.title}</td>
                      <td className="font-mono text-sm text-gray-600">/{p.slug}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            p.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : p.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {p.status === 'published' ? 'Publicado' : p.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                        </span>
                      </td>
                      <td className="text-sm text-gray-600">
                        {p.published_at
                          ? new Date(p.published_at).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => router.push(`/admin/site/content/posts/${p.id}`)}
                          className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 ml-auto"
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
