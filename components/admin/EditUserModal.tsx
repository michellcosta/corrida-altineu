'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Shield, Key } from 'lucide-react'
import { AdminUser, UpdateUserData } from '@/lib/admin/users'

interface EditUserModalProps {
  user: AdminUser
  open: boolean
  onClose: () => void
  onUpdate: (id: string, userData: UpdateUserData) => Promise<void>
  onToggleMFA: (id: string) => Promise<void>
  onResetPassword: (email: string) => Promise<void>
  loading?: boolean
}

export default function EditUserModal({ 
  user, 
  open, 
  onClose, 
  onUpdate, 
  onToggleMFA, 
  onResetPassword,
  loading = false 
}: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
    mfa_enabled: user.mfa_enabled,
  })
  const [errors, setErrors] = useState<Partial<UpdateUserData>>({})
  const [actionLoading, setActionLoading] = useState<'update' | 'mfa' | 'password' | null>(null)

  useEffect(() => {
    if (open) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        mfa_enabled: user.mfa_enabled,
      })
      setErrors({})
    }
  }, [open, user])

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateUserData> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setActionLoading('update')
    try {
      await onUpdate(user.id, formData)
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleMFA = async () => {
    setActionLoading('mfa')
    try {
      await onToggleMFA(user.id)
      // Atualizar estado local
      setFormData(prev => ({ ...prev, mfa_enabled: !prev.mfa_enabled }))
    } catch (error) {
      console.error('Erro ao alterar 2FA:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResetPassword = async () => {
    if (!confirm('Tem certeza que deseja resetar a senha deste usuário? Ele receberá um email com instruções.')) {
      return
    }

    setActionLoading('password')
    try {
      await onResetPassword(user.email)
      alert('Email de reset de senha enviado com sucesso!')
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      alert('Erro ao enviar email de reset de senha')
    } finally {
      setActionLoading(null)
    }
  }

  const handleClose = () => {
    if (!loading && !actionLoading) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900">
              Editar Usuário
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              ID: {user.id}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading || !!actionLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading || !!actionLoading}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading || !!actionLoading}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nível de Acesso *
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={formData.role || 'ORG_ADMIN'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                disabled={loading || !!actionLoading}
              >
                <option value="ORG_ADMIN">Org Admin - Acesso somente leitura</option>
                <option value="CHIP_ADMIN">Chip Admin - Gerenciar cronometragem</option>
                <option value="SITE_ADMIN">Site Admin - Acesso completo</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status da Conta
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  disabled={loading || !!actionLoading}
                />
                <span className="text-sm text-gray-700">Conta ativa</span>
              </label>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Contas inativas não podem fazer login
            </p>
          </div>

          {/* Security Actions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações de Segurança</h3>
            
            <div className="space-y-4">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Autenticação 2FA</p>
                  <p className="text-sm text-gray-600">
                    {formData.mfa_enabled ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleMFA}
                  disabled={loading || actionLoading === 'mfa'}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                    formData.mfa_enabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } disabled:opacity-50`}
                >
                  {actionLoading === 'mfa' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    formData.mfa_enabled ? 'Desativar' : 'Ativar'
                  )}
                </button>
              </div>

              {/* Reset Password */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Resetar Senha</p>
                  <p className="text-sm text-gray-600">
                    Enviar email com link para nova senha
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading || actionLoading === 'password'}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Key size={16} />
                  {actionLoading === 'password' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Resetar'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || !!actionLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || actionLoading === 'update'}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading === 'update' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}






