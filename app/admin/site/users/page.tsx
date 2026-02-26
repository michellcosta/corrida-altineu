'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import NewUserModal from '@/components/admin/NewUserModal'
import EditUserModal from '@/components/admin/EditUserModal'
import { ToastContainer, ToastProps } from '@/components/admin/Toast'
import { useUsers } from '@/hooks/useUsers'
import { Plus, Shield, Search, RefreshCw, Trash2, AlertTriangle } from 'lucide-react'
import { ROLE_COLORS } from '@/lib/admin/types'
import { AdminUser } from '@/lib/admin/users'

export default function UsersManagementPage() {
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    toggleMFA,
    resetPassword,
    refreshUsers,
  } = useUsers()

  const [newUserModalOpen, setNewUserModalOpen] = useState(false)
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [toasts, setToasts] = useState<ToastProps[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filtrar usuários por busca
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Função para adicionar toast
  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString()
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }
    }
    setToasts(prev => [...prev, newToast])
  }

  // Função para remover toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Handlers
  const handleCreateUser = async (userData: any) => {
    try {
      await createUser(userData)
      addToast({
        type: 'success',
        title: 'Usuário criado!',
        message: `${userData.name} foi adicionado com sucesso.`
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao criar usuário',
        message: error.message
      })
    }
  }

  const handleUpdateUser = async (id: string, userData: any) => {
    try {
      await updateUser(id, userData)
      addToast({
        type: 'success',
        title: 'Usuário atualizado!',
        message: 'As alterações foram salvas com sucesso.'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao atualizar usuário',
        message: error.message
      })
    }
  }

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${user.name}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setActionLoading(user.id)
    try {
      await deleteUser(user.id)
      addToast({
        type: 'success',
        title: 'Usuário deletado!',
        message: `${user.name} foi removido com sucesso.`
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao deletar usuário',
        message: error.message
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleMFA = async (id: string) => {
    try {
      await toggleMFA(id)
      const user = users.find(u => u.id === id)
      addToast({
        type: 'success',
        title: '2FA alterado!',
        message: `Autenticação 2FA foi ${user?.mfa_enabled ? 'desativada' : 'ativada'} com sucesso.`
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao alterar 2FA',
        message: error.message
      })
    }
  }

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email)
      addToast({
        type: 'success',
        title: 'Email enviado!',
        message: 'Link de reset de senha foi enviado com sucesso.'
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao resetar senha',
        message: error.message
      })
    }
  }

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    setEditUserModalOpen(true)
  }

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Nunca'
    
    const date = new Date(lastLogin)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `Há ${diffMins} min`
    if (diffHours < 24) return `Há ${diffHours}h`
    if (diffDays < 7) return `Há ${diffDays} dias`
    
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Gerenciar Usuários
            </h1>
            <p className="text-gray-600">
              Controle de acesso e permissões dos administradores
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshUsers}
              disabled={loading}
              className="admin-button-secondary flex items-center gap-2"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
            <button
              onClick={() => setNewUserModalOpen(true)}
              className="admin-button-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="admin-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={20} />
              <p className="text-red-800 font-semibold">Erro ao carregar usuários</p>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="admin-card">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
              </p>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Tente ajustar os termos de busca' : 'Crie o primeiro usuário administrativo'}
              </p>
            </div>
          ) : (
<div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Função</th>
                    <th>Status</th>
                    <th>2FA</th>
                    <th>Último Login</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="font-semibold">{user.name}</td>
                      <td className="text-gray-600">{user.email}</td>
                      <td>
                        <span className={`admin-badge ${ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        {user.mfa_enabled ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Shield size={16} />
                            Ativo
                          </span>
                        ) : (
                          <span className="text-gray-400">Inativo</span>
                        )}
                      </td>
                      <td className="text-gray-600 text-sm">
                        {formatLastLogin(user.last_login_at)}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={actionLoading === user.id}
                            className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50 flex items-center gap-1"
                          >
                            {actionLoading === user.id ? (
                              <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Deletar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-600">Total de Usuários</p>
          </div>
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-green-600">
              {users.filter(u => u.is_active).length}
            </p>
            <p className="text-sm text-gray-600">Usuários Ativos</p>
          </div>
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.mfa_enabled).length}
            </p>
            <p className="text-sm text-gray-600">Com 2FA Ativo</p>
          </div>
          <div className="admin-card text-center">
            <p className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'SITE_ADMIN').length}
            </p>
            <p className="text-sm text-gray-600">Site Admins</p>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-yellow-900 font-semibold mb-1">
                Recomendações de Segurança
              </p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Ative 2FA para todos os usuários SITE_ADMIN e CHIP_ADMIN</li>
                <li>• Use senhas fortes e únicas para cada conta</li>
                <li>• Monitore regularmente os logs de acesso</li>
                <li>• Desative contas de usuários que não precisam mais de acesso</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewUserModal
        open={newUserModalOpen}
        onClose={() => setNewUserModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          open={editUserModalOpen}
          onClose={() => {
            setEditUserModalOpen(false)
            setSelectedUser(null)
          }}
          onUpdate={handleUpdateUser}
          onToggleMFA={handleToggleMFA}
          onResetPassword={handleResetPassword}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </AdminLayout>
  )
}


