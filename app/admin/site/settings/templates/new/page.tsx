'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

export default function NewTemplatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    subject: '',
    body: '',
    is_active: true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: form.name,
          type: 'email',
          subject: form.subject || null,
          body: form.body,
          is_active: form.is_active,
        })
        .select('id')
        .single()
      if (error) throw error
      toast.success('Template criado')
      router.push(`/admin/site/settings/templates/${data.id}`)
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
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Novo Template</h1>
          <p className="text-gray-600">Crie um template de email.</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Corpo (use variáveis como {'{{athlete_name}}'})</label>
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
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="admin-button-primary">
                {saving ? 'Salvando...' : 'Criar'}
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
