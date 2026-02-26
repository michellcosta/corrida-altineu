'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    subject: '',
    body: '',
    is_active: true,
  })

  useEffect(() => {
    loadTemplate()
  }, [id])

  async function loadTemplate() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase.from('email_templates').select('*').eq('id', id).single()
      if (error) throw error
      if (data) {
        setForm({
          name: data.name,
          subject: data.subject || '',
          body: data.body || '',
          is_active: data.is_active ?? true,
        })
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar')
      router.push('/admin/site/settings/templates')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('email_templates')
        .update({
          name: form.name,
          subject: form.subject || null,
          body: form.body,
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
      toast.success('Template atualizado')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Editar Template</h1>
            <p className="text-gray-600">{form.name}</p>
          </div>
          <button onClick={() => router.back()} className="admin-button-secondary">
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-card max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="admin-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="admin-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Corpo</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="admin-input w-full min-h-[200px]"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="active">Ativo</label>
            </div>
            <button type="submit" disabled={saving} className="admin-button-primary">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
