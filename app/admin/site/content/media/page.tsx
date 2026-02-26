'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Upload, Loader2, Image } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

const BUCKET = 'media'

interface FileItem {
  name: string
  url: string
}

export default function MediaPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [])

  async function loadFiles() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 100 })
      if (error) {
        if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
          setFiles([])
          return
        }
        throw error
      }
      const urls = await Promise.all(
        (data || [])
          .filter((f) => f.name && !f.name.startsWith('.'))
          .map(async (f) => {
            const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name)
            return { name: f.name, url: urlData.publicUrl }
          })
      )
      setFiles(urls)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar. Crie o bucket "media" no Supabase Storage.')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const supabase = createClient()
      const ext = file.name.split('.').pop() || ''
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error } = await supabase.storage.from(BUCKET).upload(name, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (error) throw error
      toast.success('Upload concluído')
      loadFiles()
    } catch (err: any) {
      toast.error(err.message || 'Erro no upload. Verifique se o bucket "media" existe e tem permissões.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Biblioteca de Mídia</h1>
            <p className="text-gray-600">Gerencie imagens e arquivos do site.</p>
          </div>
          <label className="admin-button-primary flex items-center gap-2 cursor-pointer">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            {uploading ? 'Enviando...' : 'Fazer Upload'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        <div className="admin-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Nenhum arquivo ou bucket não configurado</p>
              <p className="text-sm text-gray-400">
                Crie um bucket chamado &quot;media&quot; no Supabase Storage e configure políticas de upload.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {files.map((f) => (
                <a
                  key={f.name}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="p-2 text-xs text-gray-600 truncate">{f.name}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
