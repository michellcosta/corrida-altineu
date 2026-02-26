'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, ExternalLink, Loader2, Upload, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

const BUCKET = 'media'
const REGULATIONS_PATH = 'regulations'

interface Regulation {
  id: string
  title: string
  file_path: string | null
  file_url: string | null
  version: string | null
  is_active: boolean
}

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', file_url: '', version: '', useUpload: true })

  useEffect(() => {
    loadRegulations()
  }, [])

  async function loadRegulations() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('regulations')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setRegulations(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar')
      setRegulations([])
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.includes('pdf')) {
      toast.error('Apenas arquivos PDF são aceitos')
      return
    }
    try {
      setUploading(true)
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'pdf'
      const path = `${REGULATIONS_PATH}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (error) throw error
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      setForm((f) => ({ ...f, file_url: urlData.publicUrl }))
      toast.success('PDF enviado com sucesso')
    } catch (err: any) {
      toast.error(err.message || 'Erro no upload. Verifique se o bucket "media" existe.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.file_url?.trim()) {
      toast.error('Envie um PDF ou informe a URL')
      return
    }
    try {
      const supabase = createClient()
      const { error } = await supabase.from('regulations').insert({
        title: form.title,
        file_url: form.file_url.trim(),
        version: form.version || null,
      })
      if (error) throw error
      toast.success('Regulamento adicionado')
      setForm({ title: '', file_url: '', version: '', useUpload: true })
      setShowForm(false)
      loadRegulations()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Regulamentos</h1>
            <p className="text-gray-600">Gerencie regulamentos e termos do evento.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="admin-button-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Regulamento
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-card max-w-xl">
            <h2 className="text-lg font-bold mb-4">Adicionar Regulamento</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="admin-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF do Regulamento</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      checked={form.useUpload}
                      onChange={() => setForm((f) => ({ ...f, useUpload: true, file_url: '' }))}
                    />
                    <span>Enviar arquivo PDF</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="source"
                      checked={!form.useUpload}
                      onChange={() => setForm((f) => ({ ...f, useUpload: false }))}
                    />
                    <span>Usar URL externa</span>
                  </label>
                </div>
                {form.useUpload ? (
                  <label className="mt-2 flex items-center gap-2 admin-button-secondary w-fit cursor-pointer">
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                    {uploading ? 'Enviando...' : 'Selecionar PDF'}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <input
                    type="url"
                    value={form.file_url}
                    onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                    className="admin-input w-full mt-2"
                    placeholder="https://..."
                  />
                )}
                {form.file_url && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <FileText size={14} /> PDF pronto
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Versão</label>
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                  className="admin-input w-full"
                  placeholder="Ex: 2026.1"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="admin-button-primary">Salvar</button>
                <button type="button" onClick={() => setShowForm(false)} className="admin-button-secondary">
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="admin-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : regulations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum regulamento cadastrado. Envie um PDF ou adicione o link.
            </div>
          ) : (
            <div className="space-y-3">
              {regulations.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{r.title}</p>
                    {r.version && <p className="text-sm text-gray-500">Versão {r.version}</p>}
                  </div>
                  {(r.file_url || r.file_path) && (
                    <a
                      href={r.file_url || r.file_path || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-button-secondary flex items-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Abrir PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
