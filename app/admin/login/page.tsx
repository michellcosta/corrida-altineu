'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login, verifyMfa } from '@/lib/admin/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMfa, setShowMfa] = useState(false)

  function redirectByRole(role: string) {
    switch (role) {
      case 'SITE_ADMIN':
        router.push('/admin/site')
        break
      case 'CHIP_ADMIN':
        router.push('/admin/chip')
        break
      case 'ORG_ADMIN':
        router.push('/admin/org')
        break
      default:
        router.push('/admin/site')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result) {
        if (result.requiresMfa) {
          setShowMfa(true)
        } else {
          redirectByRole(result.profile.role)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaCode.trim()) return
    setError('')
    setLoading(true)
    try {
      const result = await verifyMfa(mfaCode)
      if (result) {
        redirectByRole(result.profile.role)
      }
    } catch (err: any) {
      setError(err.message || 'Código inválido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-primary-600 font-bold text-2xl">51ª</span>
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Painel Administrativo
          </h1>
          <p className="text-primary-100">
            Corrida Rústica de Macuco 2026
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Fazer Login
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {showMfa ? (
            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <p className="text-sm text-gray-600">
                Digite o código de 6 dígitos do seu aplicativo autenticador.
              </p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de verificação
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="000000"
                  disabled={loading}
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
              <button
                type="button"
                onClick={() => setShowMfa(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Voltar ao login
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-gray-500">
                Use o email e a senha cadastrados no painel administrativo.
              </p>
            </>
          )}
        </div>

        {/* Link para o site */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-white hover:text-primary-100 transition-colors text-sm"
          >
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  )
}

