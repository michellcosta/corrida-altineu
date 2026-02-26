'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  CMSPage,
  CMSSection,
  createSection,
  deleteSection,
  getPageWithSections,
  moveSection,
  updatePage,
  updateSection,
} from '@/lib/admin/cms'
import { SECTION_TYPES } from '@/lib/cms/schemas'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Eye,
  EyeOff,
  FilePlus,
  Loader2,
  Save,
  Trash2,
} from 'lucide-react'
import SectionFormEditor from '@/components/admin/SectionFormEditor'

type SectionTextState = Record<string, string>
type SectionErrorState = Record<string, string | null>
type ToastState = { id: string; message: string; type: 'success' | 'error' }

const STATUS_OPTIONS: Array<{ value: CMSPage['status']; label: string }> = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
]

const SECTION_NAME: Record<string, string> = SECTION_TYPES.reduce<Record<string, string>>((acc, item) => {
  acc[item.type] = item.name
  return acc
}, {})

const SECTION_DESCRIPTION: Record<string, string> = SECTION_TYPES.reduce<Record<string, string>>((acc, item) => {
  acc[item.type] = item.description
  return acc
}, {})

const FORM_SUPPORTED_TYPES = ['hero', 'countdown', 'cta', 'stats', 'news', 'faq', 'cards', 'timeline', 'testimonials', 'sponsors']

function AddSectionModal({
  open,
  onClose,
  onCreate,
  loading,
}: {
  open: boolean
  onClose: () => void
  onCreate: (payload: { type: string; content?: Record<string, unknown> }) => Promise<void>
  loading: boolean
}) {
  const [selectedType, setSelectedType] = useState<string>('hero')
  const [contentText, setContentText] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSelectedType('hero')
      setContentText('')
      setError(null)
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    let parsedContent: Record<string, unknown> | undefined

    if (contentText.trim().length > 0) {
      try {
        parsedContent = JSON.parse(contentText)
        if (typeof parsedContent !== 'object' || Array.isArray(parsedContent)) {
          throw new Error('O JSON precisa ser um objeto.')
        }
      } catch (err: any) {
        setError(err?.message ?? 'Conteudo invalido. Forneca JSON valido ou deixe vazio.')
        return
      }
    }

    try {
      await onCreate({ type: selectedType, content: parsedContent })
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Nao foi possivel criar a secao.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-2xl font-semibold text-gray-900">Adicionar secao</h2>
        <p className="mt-1 text-sm text-gray-500">
          Selecione o tipo de secao e, opcionalmente, informe um JSON com os dados iniciais.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Tipo</label>
            <select
              className="admin-input mt-1"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
            >
              {SECTION_TYPES.map((item) => (
                <option key={item.type} value={item.type}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {SECTION_DESCRIPTION[selectedType] ?? ''}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Conteudo (JSON opcional)
            </label>
            <textarea
              value={contentText}
              onChange={(event) => setContentText(event.target.value)}
              rows={10}
              className="admin-input mt-1 font-mono text-xs"
              placeholder='{"headline": "Titulo"}'
            />
            <p className="mt-1 text-xs text-gray-500">
              Deixe em branco para usar valores padrao. Campos obrigatorios sao validados automaticamente.
            </p>
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
            className="admin-button-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="admin-button-primary flex items-center gap-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <FilePlus size={18} />}
            Criar secao
          </button>
        </div>
      </form>
    </div>
  )
}

export default function PageEditor({ params }: { params: { id: string } }) {
  const pageId = params.id
  const [page, setPage] = useState<CMSPage | null>(null)
  const [sections, setSections] = useState<CMSSection[]>([])
  const [sectionTexts, setSectionTexts] = useState<SectionTextState>({})
  const [sectionErrors, setSectionErrors] = useState<SectionErrorState>({})
  const [sectionEditMode, setSectionEditMode] = useState<Record<string, 'form' | 'json'>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastState[]>([])

  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    status: 'draft' as CMSPage['status'],
  })

  useEffect(() => {
    refreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  const refreshData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPageWithSections(pageId)
      setPage(data.page)
      setPageForm({
        title: data.page.title,
        slug: data.page.slug,
        status: data.page.status,
      })
      setSections(data.sections)
      const textState: SectionTextState = {}
      const modeState: Record<string, 'form' | 'json'> = {}
      data.sections.forEach((section) => {
        textState[section.id] = JSON.stringify(section.content ?? {}, null, 2)
        modeState[section.id] = FORM_SUPPORTED_TYPES.includes(section.component_type) ? 'form' : 'json'
      })
      setSectionTexts(textState)
      setSectionEditMode((prev) => ({ ...modeState, ...prev }))
      setSectionErrors({})
    } catch (err: any) {
      setError(err?.message ?? 'Nao foi possivel carregar a pagina.')
    } finally {
      setLoading(false)
    }
  }

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

  const handleSavePage = async () => {
    if (!page) return
    try {
      setSaving(true)
      const updated = await updatePage(page.id, {
        title: pageForm.title.trim(),
        slug: pageForm.slug.trim().replace(/^\//, ''),
        status: pageForm.status,
      })
      setPage(updated)
      notify('Pagina atualizada com sucesso.', 'success')
    } catch (err: any) {
      notify(err?.message ?? 'Nao foi possivel atualizar a pagina.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateSection = async (payload: { type: string; content?: Record<string, unknown> }) => {
    try {
      setSaving(true)
      await createSection(pageId, payload.type as CMSSection['component_type'], payload.content)
      await refreshData()
      notify('Secao criada com sucesso.', 'success')
    } catch (err: any) {
      notify(err?.message ?? 'Nao foi possivel criar a secao.', 'error')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSection = async (section: CMSSection) => {
    try {
      setSaving(true)
      const text = sectionTexts[section.id] ?? '{}'
      const parsed = JSON.parse(text)
      await updateSection(section.id, { content: parsed })
      notify('Secao atualizada com sucesso.', 'success')
      setSectionErrors((prev) => ({ ...prev, [section.id]: null }))
      await refreshData()
    } catch (err: any) {
      const message = err?.message ?? 'Nao foi possivel salvar a secao.'
      setSectionErrors((prev) => ({ ...prev, [section.id]: message }))
      notify(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisibility = async (section: CMSSection) => {
    try {
      setSaving(true)
      await updateSection(section.id, { is_visible: !section.is_visible })
      await refreshData()
      notify('Visibilidade atualizada.', 'success')
    } catch (err: any) {
      notify(err?.message ?? 'Nao foi possivel atualizar a visibilidade.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSection = async (section: CMSSection) => {
    const confirmation = window.confirm('Deseja realmente remover esta secao?')
    if (!confirmation) return

    try {
      setSaving(true)
      await deleteSection(section.id, pageId)
      await refreshData()
      notify('Secao removida com sucesso.', 'success')
    } catch (err: any) {
      notify(err?.message ?? 'Nao foi possivel remover a secao.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleMove = async (section: CMSSection, direction: 'up' | 'down') => {
    try {
      setSaving(true)
      await moveSection(pageId, section.id, direction)
      await refreshData()
    } catch (err: any) {
      notify(err?.message ?? 'Nao foi possivel reordenar as secoes.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const orderedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order_index - b.order_index)
  }, [sections])

  return (
    <AdminLayout>
      <div className="space-y-6">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        ) : page ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">
                  Editor de pagina
                </p>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  {page.title}
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  ID: {page.id}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="admin-button-primary flex items-center gap-2"
                >
                  <FilePlus size={18} />
                  Nova secao
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="admin-card lg:col-span-1">
                <h2 className="text-lg font-semibold text-gray-900">Detalhes da pagina</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Atualize titulo, slug ou status de publicacao.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Titulo</label>
                    <input
                      type="text"
                      className="admin-input mt-1"
                      value={pageForm.title}
                      onChange={(event) => setPageForm((prev) => ({ ...prev, title: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Slug</label>
                    <div className="mt-1 flex items-center">
                      <span className="rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        /
                      </span>
                      <input
                        type="text"
                        className="admin-input rounded-l-none"
                        value={pageForm.slug}
                        onChange={(event) => setPageForm((prev) => ({ ...prev, slug: event.target.value }))}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Use letras minusculas e hifen.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Status</label>
                    <select
                      className="admin-input mt-1"
                      value={pageForm.status}
                      onChange={(event) =>
                        setPageForm((prev) => ({ ...prev, status: event.target.value as CMSPage['status'] }))
                      }
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSavePage}
                  className="admin-button-primary mt-6 flex w-full items-center justify-center gap-2 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Salvar pagina
                </button>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Secoes ({sections.length})</h2>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="admin-button-secondary flex items-center gap-2"
                  >
                    <FilePlus size={16} />
                    Adicionar secao
                  </button>
                </div>

                <div className="mt-4 space-y-5">
                  {orderedSections.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
                      Nenhuma secao cadastrada. Clique em &quot;Adicionar secao&quot; para comecar.
                    </div>
                  ) : (
                    orderedSections.map((section, index) => {
                      const name = SECTION_NAME[section.component_type] ?? section.component_type
                      return (
                        <div key={section.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-gray-400">
                                Secao {index + 1}
                              </p>
                              <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                              <p className="text-xs text-gray-500">ID: {section.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleMove(section, 'up')}
                                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                                title="Mover para cima"
                                disabled={index === 0 || saving}
                              >
                                <ArrowUp size={16} />
                              </button>
                              <button
                                onClick={() => handleMove(section, 'down')}
                                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                                title="Mover para baixo"
                                disabled={index === orderedSections.length - 1 || saving}
                              >
                                <ArrowDown size={16} />
                              </button>
                              <button
                                onClick={() => handleToggleVisibility(section)}
                                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                                title={section.is_visible ? 'Ocultar secao' : 'Exibir secao'}
                                disabled={saving}
                              >
                                {section.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                              <button
                                onClick={() => handleDeleteSection(section)}
                                className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                title="Excluir secao"
                                disabled={saving}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 space-y-4">
                            {FORM_SUPPORTED_TYPES.includes(section.component_type) && (
                              <div className="flex gap-2 mb-2">
                                <button
                                  type="button"
                                  onClick={() => setSectionEditMode((p) => ({ ...p, [section.id]: 'form' }))}
                                  className={`px-3 py-1.5 text-sm rounded-lg ${
                                    (sectionEditMode[section.id] ?? 'form') === 'form'
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  Formulário
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSectionEditMode((p) => ({ ...p, [section.id]: 'json' }))}
                                  className={`px-3 py-1.5 text-sm rounded-lg ${
                                    (sectionEditMode[section.id] ?? 'form') === 'json'
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  JSON
                                </button>
                              </div>
                            )}

                            {(sectionEditMode[section.id] ?? (FORM_SUPPORTED_TYPES.includes(section.component_type) ? 'form' : 'json')) ===
                            'form' &&
                            FORM_SUPPORTED_TYPES.includes(section.component_type) ? (
                              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <SectionFormEditor
                                  section={section}
                                  content={(() => {
                                    try {
                                      return (JSON.parse(sectionTexts[section.id] ?? '{}') || {}) as Record<string, unknown>
                                    } catch {
                                      return {}
                                    }
                                  })()}
                                  onChange={(newContent) =>
                                    setSectionTexts((prev) => ({
                                      ...prev,
                                      [section.id]: JSON.stringify(newContent, null, 2),
                                    }))
                                  }
                                />
                              </div>
                            ) : (
                              <textarea
                                value={sectionTexts[section.id] ?? '{}'}
                                onChange={(event) =>
                                  setSectionTexts((prev) => ({ ...prev, [section.id]: event.target.value }))
                                }
                                rows={18}
                                className="admin-input font-mono text-xs"
                                spellCheck={false}
                              />
                            )}

                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">
                                Estrutura baseada no schema {section.component_type}. Valide o JSON antes de salvar.
                              </p>
                              <button
                                onClick={() => handleSaveSection(section)}
                                className="admin-button-primary flex items-center gap-2 disabled:opacity-60"
                                disabled={saving}
                              >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Salvar secao
                              </button>
                            </div>

                            {sectionErrors[section.id] && (
                              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle size={18} />
                                <span>{sectionErrors[section.id]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <AddSectionModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreate={handleCreateSection}
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
