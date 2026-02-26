'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Hash, Loader2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

interface RegWithCat {
  id: string
  registration_number: string | null
  bib_number: number | null
  status: string
  athlete: { full_name: string }
  category: { id: string; name: string }
}

export default function NumberingPage() {
  const [registrations, setRegistrations] = useState<RegWithCat[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
      if (!event) {
        setRegistrations([])
        setCategories([])
        return
      }
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .eq('event_id', event.id)
        .order('name')
      setCategories(cats || [])

      const { data: regs } = await supabase
        .from('registrations')
        .select(`
          id, registration_number, bib_number, status,
          athlete:athletes(full_name),
          category:categories(id, name)
        `)
        .eq('event_id', event.id)
        .eq('status', 'confirmed')
        .order('registered_at', { ascending: true })

      setRegistrations((regs as unknown as RegWithCat[]) || [])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar')
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  async function handleApplyNumbering() {
    try {
      setApplying(true)
      const supabase = createClient()
      const confirmed = registrations.filter((r) => r.status === 'confirmed')
      const byCategory = confirmed.reduce<Record<string, RegWithCat[]>>((acc, r) => {
        const key = r.category?.id ?? 'other'
        if (!acc[key]) acc[key] = []
        acc[key].push(r)
        return acc
      }, {})

      let globalBib = 1
      for (const cat of categories) {
        const list = byCategory[cat.id] || []
        for (const reg of list) {
          const { error } = await supabase
            .from('registrations')
            .update({ bib_number: globalBib })
            .eq('id', reg.id)
          if (error) throw error
          globalBib++
        }
      }
      toast.success('Numeração aplicada com sucesso')
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao aplicar numeração')
    } finally {
      setApplying(false)
    }
  }

  const confirmedCount = registrations.filter((r) => r.status === 'confirmed').length
  const numeradosCount = registrations.filter((r) => r.bib_number != null).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Numeração</h1>
            <p className="text-gray-600">Atribua números de peito aos inscritos confirmados.</p>
          </div>
          <button
            onClick={handleApplyNumbering}
            disabled={applying || confirmedCount === 0}
            className="admin-button-primary flex items-center gap-2"
          >
            {applying ? <Loader2 size={20} className="animate-spin" /> : <Hash size={20} />}
            {applying ? 'Aplicando...' : 'Gerar Numeração'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
            <p className="text-sm text-gray-500">Confirmados</p>
          </div>
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-primary-600">{numeradosCount}</p>
            <p className="text-sm text-gray-500">Já numerados</p>
          </div>
        </div>

        <div className="admin-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma inscrição confirmada. A numeração é aplicada apenas a atletas com status confirmado.
            </div>
          ) : (
            <div className="admin-table-wrapper max-h-96 overflow-y-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nº Inscrição</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Nº Peito</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="font-mono">{reg.registration_number ?? '-'}</td>
                      <td className="font-semibold">{reg.athlete?.full_name ?? '-'}</td>
                      <td>{reg.category?.name ?? '-'}</td>
                      <td>
                        {reg.bib_number != null ? (
                          <span className="font-mono font-bold text-primary-600">{reg.bib_number}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Como funciona:</strong> Clique em &quot;Gerar Numeração&quot; para atribuir números sequenciais (1, 2, 3...) a todos os inscritos confirmados, ordenados por categoria e data de inscrição.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
