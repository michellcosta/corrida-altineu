'use client'

import { CMSSection } from '@/lib/admin/cms'

interface SectionFormEditorProps {
  section: CMSSection
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export default function SectionFormEditor({ section, content, onChange }: SectionFormEditorProps) {
  const type = section.component_type

  const update = (key: string, value: unknown) => {
    onChange({ ...content, [key]: value })
  }

  if (type === 'hero') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título principal</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.headline as string) ?? ''}
            onChange={(e) => update('headline', e.target.value)}
            placeholder="Ex: 51ª Corrida Rústica de Macuco"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.subheadline as string) ?? ''}
            onChange={(e) => update('subheadline', e.target.value)}
            placeholder="Ex: 24 de junho de 2026"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            className="admin-input w-full"
            rows={3}
            value={(content.description as string) ?? ''}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Texto de apoio..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Botão principal - Texto</label>
            <input
              type="text"
              className="admin-input w-full"
              value={((content.ctaPrimary as Record<string, unknown>)?.label as string) ?? ''}
              onChange={(e) =>
                update('ctaPrimary', {
                  ...((content.ctaPrimary as Record<string, unknown>) ?? {}),
                  label: e.target.value,
                  href: ((content.ctaPrimary as Record<string, unknown>)?.href as string) ?? '/inscricao',
                })
              }
              placeholder="Ex: Inscreva-se"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Botão principal - Link</label>
            <input
              type="text"
              className="admin-input w-full"
              value={((content.ctaPrimary as Record<string, unknown>)?.href as string) ?? ''}
              onChange={(e) =>
                update('ctaPrimary', {
                  ...((content.ctaPrimary as Record<string, unknown>) ?? {}),
                  label: ((content.ctaPrimary as Record<string, unknown>)?.label as string) ?? 'Inscreva-se',
                  href: e.target.value,
                })
              }
              placeholder="/inscricao"
            />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'countdown') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Ex: Faltam"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.subtitle as string) ?? ''}
            onChange={(e) => update('subtitle', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data alvo (YYYY-MM-DD)</label>
          <input
            type="date"
            className="admin-input w-full"
            value={((content.targetDate as string) ?? '').slice(0, 10)}
            onChange={(e) => update('targetDate', e.target.value + 'T00:00:00')}
          />
        </div>
      </div>
    )
  }

  if (type === 'cta') {
    const cta = (content.ctaPrimary as Record<string, unknown>) ?? {}
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.subtitle as string) ?? ''}
            onChange={(e) => update('subtitle', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Botão - Texto</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(cta.label as string) ?? ''}
            onChange={(e) => update('ctaPrimary', { ...cta, label: e.target.value, href: (cta.href as string) ?? '/' })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Botão - Link</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(cta.href as string) ?? ''}
            onChange={(e) => update('ctaPrimary', { ...cta, href: e.target.value })}
          />
        </div>
      </div>
    )
  }

  if (type === 'stats') {
    const stats = (content.stats as Array<{ value: string; label: string }>) ?? []
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título (opcional)</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500">
          Estatísticas: edite o JSON para adicionar/remover itens. Formato: {`[{"value":"51","label":"Edições"}]`}
        </p>
      </div>
    )
  }

  if (type === 'news') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de posts</label>
          <input
            type="number"
            min={1}
            max={12}
            className="admin-input w-full"
            value={(content.showCount as number) ?? 3}
            onChange={(e) => update('showCount', parseInt(e.target.value, 10) || 3)}
          />
        </div>
      </div>
    )
  }

  if (type === 'faq') {
    const questions = (content.questions as Array<{ question: string; answer: string }>) ?? []
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Perguntas e Respostas</label>
          {questions.map((q, i) => (
            <div key={i} className="mb-4 p-3 border rounded-lg space-y-2">
              <input
                type="text"
                className="admin-input w-full"
                placeholder="Pergunta"
                value={q.question}
                onChange={(e) => {
                  const next = [...questions]
                  next[i] = { ...next[i], question: e.target.value }
                  update('questions', next)
                }}
              />
              <textarea
                className="admin-input w-full"
                rows={2}
                placeholder="Resposta"
                value={q.answer}
                onChange={(e) => {
                  const next = [...questions]
                  next[i] = { ...next[i], answer: e.target.value }
                  update('questions', next)
                }}
              />
              <button
                type="button"
                onClick={() => update('questions', questions.filter((_, j) => j !== i))}
                className="text-xs text-red-600"
              >
                Remover
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update('questions', [...questions, { question: '', answer: '' }])}
            className="admin-button-secondary text-sm"
          >
            + Adicionar pergunta
          </button>
        </div>
      </div>
    )
  }

  if (type === 'cards') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.subtitle as string) ?? ''}
            onChange={(e) => update('subtitle', e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500">
          Cards: edite o JSON para adicionar/remover. Cada card precisa: id, icon, title, description, price, isFree.
        </p>
      </div>
    )
  }

  if (type === 'timeline') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.subtitle as string) ?? ''}
            onChange={(e) => update('subtitle', e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500">
          Marcos: edite o JSON. Cada item: year, title, description, highlight (opcional).
        </p>
      </div>
    )
  }

  if (type === 'testimonials') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.subtitle as string) ?? ''}
            onChange={(e) => update('subtitle', e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500">
          Depoimentos: edite o JSON. Cada item: name, role, city, image (url, alt), rating, text.
        </p>
      </div>
    )
  }

  if (type === 'sponsors') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
          <input
            type="text"
            className="admin-input w-full"
            value={(content.subtitle as string) ?? ''}
            onChange={(e) => update('subtitle', e.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500">
          Patrocinadores: edite o JSON. tiers: array de {`{name, sponsors: [{name, logo: {url}}]}`}
        </p>
      </div>
    )
  }

  return null
}
