'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Mail, Edit, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  type: string
  subject: string | null
  body: string
  is_active: boolean
}

export default function TemplatesSettingsPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', 'email')
        .order('name')
      if (error) throw error
      setTemplates(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Templates de Comunicação
            </h1>
            <p className="text-gray-600">
              Gerencie templates de email
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/site/settings/templates/new')}
            className="admin-button-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Novo Template
          </button>
        </div>

        <div className="admin-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum template cadastrado. Crie templates para confirmação de inscrição, lembretes, etc.
            </div>
          ) : (
<div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.id}>
                      <td className="font-semibold">{t.name}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            t.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {t.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => router.push(`/admin/site/settings/templates/${t.id}`)}
                          className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-card bg-gradient-to-br from-purple-50 to-indigo-50">
          <h3 className="font-bold text-lg mb-4">Variáveis Disponíveis</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              '{{athlete_name}}',
              '{{event_name}}',
              '{{race_date}}',
              '{{category_name}}',
              '{{registration_number}}',
              '{{qr_code}}',
              '{{kit_location}}',
              '{{kit_date}}',
              '{{result_time}}',
            ].map((variable) => (
              <code
                key={variable}
                className="bg-white px-3 py-2 rounded border border-purple-200 font-mono text-xs"
              >
                {variable}
              </code>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
