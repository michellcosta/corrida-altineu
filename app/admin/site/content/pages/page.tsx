'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  CMSPage,
  createPage,
  deletePage,
  listPages,
  updatePage,
} from '@/lib/admin/cms'
import {
  AlertCircle,
  CheckCircle,
  Edit,
  ExternalLink,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'

type ToastState = {
  id: string
  message: string
  type: 'success' | 'error'
}

const STATUS_OPTIONS: Array<{ value: CMSPage['status']; label: string }> = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
]

const STATUS_BADGE: Record<CMSPage['status'], string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-200 text-gray-700',
}

const STATUS_FILTER_LABEL: Record<'all' | CMSPage['status'], string> = {
  all: 'Todos os status',
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
}

function formatDate(date?: string | null) {
  if (!date) return '-'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  } catch {
    return date
  }
}

function CreatePageModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (payload: { title: string; slug: string; status: CMSPage['status'] }) => Promise<void>
  loading: boolean
}) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<CMSPage['status']>('draft')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setTitle('')
      setSlug('')
      setStatus('draft')
      setError(null)
    }
  }, [open])

  if (!open) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Informe o titulo da pagina.')
      return
    }

    if (!slug.trim()) {
      setError('Informe o slug da pagina.')
      return
    }

    try {
      await onConfirm({
        title: title.trim(),
        slug: slug.trim().replace(/^\//, ''),
        status,
      })
    } catch (err: any) {
      setError(err?.message ?? 'Nao foi possivel criar a pagina.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-2xl font-semibold text-gray-900">Nova pagina</h2>
        <p className="mt-1 text-sm text-gray-500">
          Crie uma nova pagina para o site. Voce podera editar as secoes logo em seguida.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Titulo
            </label>
            <input
              type="text"
              className="admin-input mt-1"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Home"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Slug
            </label>
            <div className="mt-1 flex items-center">
              <span className="rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                /
              </span>
              <input
                type="text"
                className="admin-input rounded-l-none"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="home"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use letras minusculas e hifen para separar palavras.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Status
            </label>
            <select
              className="admin-input mt-1"
              value={status}
              onChange={(event) => setStatus(event.target.value as CMSPage['status'])}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="admin-button-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="admin-button-primary flex items-center gap-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Criando...
              </>
            ) : (
              <>
                <Plus size={18} />
                Criar pagina
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function PagesManagementPage() {
  const router = useRouter()
  const [pages, setPages] = useState<CMSPage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CMSPage['status']>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastState[]>([])

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listPages()
      setPages(data)
    } catch (err: any) {
      setError(err?.message ?? 'Nao foi possivel carregar as paginas.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePage = async (payload: { title: string; slug: string; status: CMSPage['status'] }) => {
    setSaving(true)
    try {
      const page = await createPage(payload)
      setPages((prev) => [page, ...prev])
      setIsCreateModalOpen(false)
      notify('Pagina criada com sucesso.', 'success')
      router.push(`/admin/site/content/pages/${page.id}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePage = async (page: CMSPage) => {
    const confirmation = window.confirm(
      `Deseja realmente excluir a pagina "${page.title}"? Essa acao nao pode ser desfeita.`
    )
    if (!confirmation) return

    try {
      setSaving(true)
      await deletePage(page.id)
      setPages((prev) => prev.filter((item) => item.id !== page.id))
      notify('Pagina removida com sucesso.', 'success')
    } catch (err: any) {
      notify(err?.message ?? 'Nao foi possivel remover a pagina.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (page: CMSPage, status: CMSPage['status']) => {
    if (page.status === status) return
    try {
      setSaving(true)
      const updated = await updatePage(page.id, { status })
      setPages((prev) => prev.map((item) => (item.id === page.id ? { ...item, status: updated.status } : item)))
      notify('Status atualizado com sucesso.', 'success')
    } catch (err: any) {
      notify(err?.message ?? 'Nao foi possivel atualizar o status.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch =
        !searchTerm ||
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || page.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [pages, searchTerm, statusFilter])

  const notify = (message: string, type: ToastState['type']) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Conteudo do site
            </h1>
            <p className="mt-1 text-gray-600">
              Gerencie as paginas publicas, altere status e edite secoes em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadPages}
              className="admin-button-secondary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Atualizar
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="admin-button-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Nova pagina
            </button>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                className="admin-input pl-9"
                placeholder="Buscar por titulo ou slug..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
              <select
                className="admin-input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              >
                {Object.entries(STATUS_FILTER_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                className="admin-button-secondary flex items-center gap-2"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
              >
                <Filter size={18} />
                Limpar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="admin-card overflow-hidden">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-[28%]">Titulo</th>
                  <th className="w-[18%]">Slug</th>
                  <th className="w-[14%]">Status</th>
                  <th className="w-[10%]">Secoes</th>
                  <th className="w-[20%]">Atualizado em</th>
                  <th className="w-[10%]" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <Loader2 size={22} className="mx-auto animate-spin text-primary-600" />
                    </td>
                  </tr>
                ) : filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">
                      Nenhuma pagina encontrada. Ajuste os filtros ou crie uma nova.
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => (
                    <tr key={page.id}>
                      <td>
                        <div>
                          <p className="font-semibold text-gray-900">{page.title}</p>
                          <p className="text-xs text-gray-500">ID: {page.id}</p>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm text-gray-600">/{page.slug}</span>
                      </td>
                      <td>
                        <select
                          className="admin-input text-sm"
                          value={page.status}
                          onChange={(event) => handleStatusChange(page, event.target.value as CMSPage['status'])}
                          disabled={saving}
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className="text-sm font-semibold text-gray-700">
                          {page.sections_count ?? 0}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-500">
                          {formatDate(page.updated_at)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/site/content/pages/${page.id}`)}
                            className="flex items-center gap-1 rounded-lg border border-primary-200 px-3 py-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50"
                          >
                            <Edit size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => window.open(`/${page.slug}`, '_blank')}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                          >
                            <ExternalLink size={16} />
                            Ver
                          </button>
                          <button
                            onClick={() => handleDeletePage(page)}
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            title="Excluir pagina"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreatePageModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreatePage}
        loading={saving}
      />

      <div className="fixed bottom-6 right-6 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}






