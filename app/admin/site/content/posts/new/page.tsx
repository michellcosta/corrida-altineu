'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

export default function NewPostPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft' as 'draft' | 'published',
  })

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: form.title,
          slug: form.slug || slugify(form.title),
          excerpt: form.excerpt || null,
          content: form.content || '',
          status: form.status,
          author_id: admin?.id ?? null,
          published_at: form.status === 'published' ? new Date().toISOString() : null,
        })
        .select('id')
        .single()

      if (error) throw error
      toast.success('Post criado')
      router.push(`/admin/site/content/posts/${data.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Novo Post</h1>
          <p className="text-gray-600">Crie um novo artigo ou notícia.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))}
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="admin-input w-full"
                placeholder="url-amigavel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                className="admin-input w-full"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="admin-input w-full min-h-[200px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
                className="admin-input"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicar agora</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="admin-button-primary">
                {saving ? 'Salvando...' : 'Criar Post'}
              </button>
              <button type="button" onClick={() => router.back()} className="admin-button-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
