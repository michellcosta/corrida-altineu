'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

const SEO_KEYS = {
  meta_title: 'Título da página',
  meta_description: 'Descrição (meta)',
  og_image: 'Imagem Open Graph (URL)',
}

export default function SeoPage() {
  const [values, setValues] = useState<Record<string, string>>({
    meta_title: '',
    meta_description: '',
    og_image: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const supabase = createClient()
      for (const key of Object.keys(SEO_KEYS)) {
        const { data } = await supabase.from('settings').select('value').eq('key', `seo_${key}`).single()
        if (data?.value && typeof data.value === 'object' && 'v' in data.value) {
          setValues((v) => ({ ...v, [key]: String((data.value as any).v) }))
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const supabase = createClient()
      for (const [key, val] of Object.entries(values)) {
        await supabase.from('settings').upsert(
          { key: `seo_${key}`, value: { v: val }, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
      }
      toast.success('Configurações salvas')
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
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">SEO</h1>
          <p className="text-gray-600">Configure meta tags e otimização para buscadores.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-card max-w-xl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(SEO_KEYS).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={key === 'og_image' ? 'url' : 'text'}
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    className="admin-input w-full"
                  />
                </div>
              ))}
              <button type="submit" disabled={saving} className="admin-button-primary">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}
        </form>
      </div>
    </AdminLayout>
  )
}
