'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { CheckCircle, Search, Loader2, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const QrScanner = dynamic(() => import('@/components/admin/QrScanner'), { ssr: false })

interface Registration {
  id: string
  registration_number: string | null
  bib_number: number | null
  kit_picked_at: string | null
  athlete: { full_name: string }
  category: { name: string }
}

function extractSearchFromQr(decodedText: string): string {
  try {
    if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
      const url = new URL(decodedText)
      const segments = url.pathname.split('/').filter(Boolean)
      return segments[segments.length - 1] || decodedText
    }
  } catch {
    // fallback
  }
  return decodedText.trim()
}

export default function CheckinPage() {
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [result, setResult] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q?.trim()) {
      setSearch(q.trim())
      doSearch(q.trim())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function doSearch(searchValue: string) {
    if (!searchValue.trim()) return
    setSearch(searchValue.trim())
    try {
      setLoading(true)
      setResult(null)
      const supabase = createClient()
      const { data: event } = await supabase.from('events').select('id').eq('year', 2026).single()
      if (!event) {
        toast.error('Evento não encontrado')
        return
      }
      const term = searchValue.trim()
      let query = supabase
        .from('registrations')
        .select(`
          id, registration_number, bib_number, kit_picked_at,
          athlete:athletes(full_name),
          category:categories(name)
        `)
        .eq('event_id', event.id)
      if (/^[0-9a-f-]{36}$/i.test(term)) {
        query = query.or(`registration_number.ilike.%${term}%,id.eq.${term}`)
      } else {
        query = query.ilike('registration_number', `%${term}%`)
      }
      const { data: regs } = await query.limit(1)
      const reg = (regs as unknown as Registration[])?.[0]
      setResult(reg || null)
      if (!reg) toast.error('Inscrição não encontrada')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao buscar')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (!search.trim()) return
    await doSearch(search)
  }

  function handleQrScan(decodedText: string) {
    setShowScanner(false)
    const term = extractSearchFromQr(decodedText)
    doSearch(term)
  }

  async function handleCheckin(id: string) {
    try {
      setChecking(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('registrations')
        .update({ kit_picked_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      toast.success('Kit retirado com sucesso!')
      setResult((prev) => (prev ? { ...prev, kit_picked_at: new Date().toISOString() } : null))
      setSearch('')
      inputRef.current?.focus()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao registrar')
    } finally {
      setChecking(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Check-in</h1>
          <p className="text-gray-600">Registre a retirada de kits. Busque por número de inscrição ou código.</p>
        </div>

        <form onSubmit={handleSearch} className="admin-card max-w-xl">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="admin-button-secondary flex items-center gap-2"
              title="Escanear QR Code"
            >
              <QrCode size={20} />
              QR
            </button>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nº inscrição ou código de confirmação"
              className="admin-input flex-1 text-lg"
              autoFocus
            />
            <button type="submit" disabled={loading} className="admin-button-primary flex items-center gap-2">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              Buscar
            </button>
          </div>
        </form>

        {showScanner && (
          <QrScanner
            onScan={handleQrScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {result && (
          <div
            className={`admin-card max-w-xl border-2 ${
              result.kit_picked_at ? 'border-green-200 bg-green-50' : 'border-primary-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Inscrição</p>
                <p className="text-xl font-bold text-gray-900">{result.registration_number ?? '-'}</p>
                <p className="text-lg font-semibold mt-2">{result.athlete?.full_name}</p>
                <p className="text-sm text-gray-600">{result.category?.name}</p>
                {result.bib_number && (
                  <p className="text-sm mt-1">
                    Nº Peito: <span className="font-bold text-primary-600">{result.bib_number}</span>
                  </p>
                )}
                {result.kit_picked_at && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ✓ Kit retirado em {new Date(result.kit_picked_at).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
              {!result.kit_picked_at && (
                <button
                  onClick={() => handleCheckin(result.id)}
                  disabled={checking}
                  className="admin-button-primary flex items-center gap-2"
                >
                  {checking ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                  Confirmar Retirada
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
