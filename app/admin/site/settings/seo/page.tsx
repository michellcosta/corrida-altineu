'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Loader2, Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const SEO_FIELDS = [
  {
    key: 'meta_title',
    label: 'Título da página',
    placeholder: 'Corrida Rústica de Macuco',
    hint: 'Recomendado: 50–60 caracteres',
    maxChars: 60,
  },
  {
    key: 'meta_description',
    label: 'Descrição (meta)',
    placeholder: '51ª edição da Corrida Rústica de Macuco - 2026',
    hint: 'Recomendado: 150–160 caracteres',
    maxChars: 160,
    textarea: true,
  },
  {
    key: 'meta_keywords',
    label: 'Palavras-chave',
    placeholder: 'corrida, macuco, esporte, atletismo',
    hint: 'Separadas por vírgula',
  },
  {
    key: 'site_name',
    label: 'Nome do site',
    placeholder: 'Corrida Rústica de Macuco',
    hint: 'Usado no Open Graph e redes sociais',
  },
  {
    key: 'og_image',
    label: 'Imagem Open Graph (URL)',
    placeholder: 'https://... ou /imagem.jpg',
    hint: 'Imagem de compartilhamento (1200×630px recomendado)',
    type: 'url',
  },
  {
    key: 'twitter_handle',
    label: 'Twitter / X (@handle)',
    placeholder: '@corridademacuco',
    hint: 'Conta do Twitter para cards',
  },
  {
    key: 'canonical_url',
    label: 'URL canônica',
    placeholder: 'https://corridademacuco.com.br',
    hint: 'URL principal do site (sem barra no final)',
    type: 'url',
  },
] as const

export default function SeoPage() {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(SEO_FIELDS.map((f) => [f.key, '']))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const supabase = createClient()
      for (const { key } of SEO_FIELDS) {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', `seo_${key}`)
          .single()
        if (data?.value && typeof data.value === 'object' && 'v' in data.value) {
          setValues((v) => ({ ...v, [key]: String((data.value as { v: string }).v) }))
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const previewTitle = values.meta_title || 'Corrida Rústica de Macuco'
  const previewDesc = values.meta_description || '51ª edição da Corrida Rústica de Macuco - 2026'
  const previewImage = values.og_image
    ? values.og_image.startsWith('http')
      ? values.og_image
      : `${APP_URL.replace(/\/$/, '')}${values.og_image.startsWith('/') ? '' : '/'}${values.og_image}`
    : null

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">SEO</h1>
          <p className="text-gray-600">
            Configure meta tags e otimização para buscadores e compartilhamento em redes sociais.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
          <form onSubmit={handleSubmit} className="admin-card max-w-xl">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {SEO_FIELDS.map((field) => {
                  const val = values[field.key] ?? ''
                  const maxChars = 'maxChars' in field ? field.maxChars : undefined
                  const charCount = maxChars != null ? val.length : null
                  const isOver =
                    charCount !== null && maxChars != null && charCount > maxChars
                  return (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {'textarea' in field && field.textarea ? (
                        <textarea
                          value={val}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, [field.key]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                          className="admin-input w-full min-h-[80px] resize-y"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={'type' in field ? field.type || 'text' : 'text'}
                          value={val}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, [field.key]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                          className="admin-input w-full"
                        />
                      )}
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">{field.hint}</span>
                        {charCount !== null && maxChars != null && (
                          <span
                            className={`text-xs tabular-nums ${
                              isOver ? 'text-amber-600' : 'text-gray-400'
                            }`}
                          >
                            {charCount}/{maxChars}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
                <button type="submit" disabled={saving} className="admin-button-primary">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}
          </form>

          {/* Preview de compartilhamento */}
          <div className="admin-card max-w-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Share2 className="w-4 h-4" />
              Preview de compartilhamento
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Como o link aparece ao compartilhar no Facebook, Twitter, LinkedIn, etc.
            </p>
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
              {previewImage && (
                <div className="aspect-[1.91/1] bg-gray-100">
                  <img
                    src={previewImage}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <div className="p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                  {values.site_name || 'Corrida Rústica de Macuco'}
                </p>
                <p className="font-medium text-gray-900 line-clamp-1 text-sm">{previewTitle}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{previewDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
