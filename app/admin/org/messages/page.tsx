'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Mail, Send, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

export default function MessagesPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [filter, setFilter] = useState<'all' | 'confirmed'>('confirmed')

  useEffect(() => {
    loadRecipients()
  }, [filter])

  async function loadRecipients() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
      if (!event) {
        setRegistrations([])
        return
      }
      let query = supabase
        .from('registrations')
        .select(`
          id,
          athlete:athletes(full_name, email)
        `)
        .eq('event_id', event.id)
      if (filter === 'confirmed') query = query.eq('status', 'confirmed')
      const { data } = await query
      setRegistrations(data || [])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar')
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) {
      toast.error('Preencha assunto e mensagem')
      return
    }
    try {
      setSending(true)
      const recipientsMap = new Map<string, string>()
      for (const r of registrations) {
        const email = r.athlete?.email?.trim()
        if (email) {
          const name = r.athlete?.full_name ?? ''
          if (!recipientsMap.has(email)) {
            recipientsMap.set(email, name)
          }
        }
      }
      const recipients = Array.from(recipientsMap.entries()).map(([email, athlete_name]) => ({
        email,
        athlete_name,
      }))
      if (recipients.length === 0) {
        toast.error('Nenhum destinatário encontrado')
        return
      }
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, recipients }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar')
      }
      toast.success(`${data.sent} de ${data.total} emails enviados`)
      if (data.errors?.length) {
        toast.error(`Alguns falharam: ${data.errors.slice(0, 2).join('; ')}`)
      }
      setSubject('')
      setBody('')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Mensagens</h1>
          <p className="text-gray-600">Envie mensagens em massa para atletas inscritos.</p>
        </div>

        <div className="admin-card max-w-2xl">
          <h2 className="text-lg font-bold mb-4">Nova Mensagem</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Destinatários</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'confirmed')}
              className="admin-input"
            >
              <option value="confirmed">Apenas confirmados</option>
              <option value="all">Todos os inscritos</option>
            </select>
            {loading ? (
              <p className="text-sm text-gray-500 mt-2">Carregando...</p>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                {registrations.length} destinatários (emails únicos)
              </p>
            )}
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="admin-input w-full"
                placeholder="Ex: Lembrete - Retirada de Kit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
              <p className="text-xs text-gray-500 mb-1">
                A saudação (Bom dia/Boa tarde/Boa noite) e o nome do atleta são adicionados automaticamente no início.
              </p>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="admin-input w-full min-h-[200px]"
                placeholder="Ex: Lembramos que a retirada de kit será no sábado às 8h. Não esqueça o documento!"
              />
            </div>
            <button
              type="submit"
              disabled={sending || loading || registrations.length === 0}
              className="admin-button-primary flex items-center gap-2"
            >
              {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              {sending ? 'Enviando...' : 'Enviar Emails'}
            </button>
          </form>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Configuração:</strong> Adicione <code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, <code>AWS_SES_REGION</code> (ex: us-east-2) e <code>SES_FROM_EMAIL</code> (email verificado no Amazon SES) nas variáveis de ambiente.
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
