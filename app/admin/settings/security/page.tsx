'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/browserClient'
import { toast } from 'sonner'

export default function SecurityPage() {
  const [factors, setFactors] = useState<{ id: string; type: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [factorId, setFactorId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadFactors()
  }, [])

  async function loadFactors() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error
      const totp = (data?.totp ?? []).map((f) => ({ id: f.id, type: f.factor_type }))
      setFactors(totp)
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }

  async function handleEnroll() {
    try {
      setEnrolling(true)
      setError('')
      const supabase = createClient()
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Corrida Macuco Admin',
      })
      if (error) throw error
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
    } catch (err: any) {
      setError(err?.message || 'Erro ao iniciar configuração')
      toast.error(err?.message)
    } finally {
      setEnrolling(false)
    }
  }

  async function handleVerify() {
    if (!verifyCode.trim() || !factorId) return
    try {
      setError('')
      const supabase = createClient()
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })
      if (challengeError) throw challengeError
      const challengeId = challengeData.id
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode.trim(),
      })
      if (verifyError) throw verifyError
      toast.success('2FA ativado com sucesso!')
      setFactorId('')
      setQrCode('')
      setSecret('')
      setVerifyCode('')
      loadFactors()
    } catch (err: any) {
      setError(err?.message || 'Código inválido. Tente novamente.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Segurança</h1>
          <p className="text-gray-600">Gerencie a autenticação em duas etapas (2FA) da sua conta.</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">Autenticação em duas etapas</h2>
              <p className="text-sm text-gray-500">
                Proteja sua conta com um aplicativo autenticador (Google Authenticator, Authy, etc.)
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 size={20} className="animate-spin" />
              Carregando...
            </div>
          ) : factors.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="font-medium">2FA ativo</span>
              </div>
              <p className="text-sm text-gray-600">
                Sua conta está protegida. Na próxima vez que fizer login, você precisará informar o código do
                aplicativo autenticador após a senha.
              </p>
              <button
                onClick={async () => {
                  if (!confirm('Desativar 2FA? Você precisará configurá-lo novamente para reativar.')) return
                  try {
                    const supabase = createClient()
                    const { error } = await supabase.auth.mfa.unenroll({ factorId: factors[0].id })
                    if (error) throw error
                    toast.success('2FA desativado')
                    loadFactors()
                  } catch (err: any) {
                    toast.error(err?.message || 'Erro ao desativar')
                  }
                }}
                className="admin-button-secondary text-red-600 border-red-200 hover:bg-red-50"
              >
                Desativar 2FA
              </button>
            </div>
          ) : qrCode ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                1. Escaneie o QR Code com seu aplicativo autenticador.
                <br />
                2. Ou digite manualmente o segredo: <code className="bg-gray-100 px-1 rounded">{secret}</code>
              </p>
              <div className="inline-block p-4 bg-white rounded-lg border">
                <img
                  src={`data:image/svg+xml,${encodeURIComponent(qrCode)}`}
                  alt="QR Code para autenticador"
                  className="w-48 h-48"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de verificação</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  className="admin-input w-32"
                  placeholder="000000"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={handleVerify} className="admin-button-primary" disabled={verifyCode.length !== 6}>
                  Ativar 2FA
                </button>
                <button
                  onClick={() => {
                    setQrCode('')
                    setFactorId('')
                    setSecret('')
                    setVerifyCode('')
                    setError('')
                  }}
                  className="admin-button-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="admin-button-primary flex items-center gap-2"
              >
                {enrolling ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
                {enrolling ? 'Preparando...' : 'Ativar 2FA'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
