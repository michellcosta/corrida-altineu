'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminUser, CreateUserData, UpdateUserData, usersApi } from '@/lib/admin/users'

export interface UseUsersReturn {
  users: AdminUser[]
  loading: boolean
  error: string | null
  createUser: (userData: CreateUserData) => Promise<void>
  updateUser: (id: string, userData: UpdateUserData) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  toggleMFA: (id: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshUsers: () => Promise<void>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar usuários
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const usersData = await usersApi.getUsers()
      setUsers(usersData)
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err)
      setError(err.message || 'Erro ao buscar usuários')
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar usuário
  const createUser = useCallback(async (userData: CreateUserData) => {
    try {
      setError(null)
      const newUser = await usersApi.createUser(userData)
      setUsers(prev => [newUser, ...prev])
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err)
      setError(err.message || 'Erro ao criar usuário')
      throw err
    }
  }, [])

  // Atualizar usuário
  const updateUser = useCallback(async (id: string, userData: UpdateUserData) => {
    try {
      setError(null)
      const updatedUser = await usersApi.updateUser(id, userData)
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user))
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err)
      setError(err.message || 'Erro ao atualizar usuário')
      throw err
    }
  }, [])

  // Deletar usuário
  const deleteUser = useCallback(async (id: string) => {
    try {
      setError(null)
      await usersApi.deleteUser(id)
      setUsers(prev => prev.filter(user => user.id !== id))
    } catch (err: any) {
      console.error('Erro ao deletar usuário:', err)
      setError(err.message || 'Erro ao deletar usuário')
      throw err
    }
  }, [])

  // Toggle MFA
  const toggleMFA = useCallback(async (id: string) => {
    try {
      setError(null)
      await usersApi.toggleMFA(id)
      // Atualizar estado local
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, mfa_enabled: !user.mfa_enabled } : user
      ))
    } catch (err: any) {
      console.error('Erro ao alterar 2FA:', err)
      setError(err.message || 'Erro ao alterar 2FA')
      throw err
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null)
      await usersApi.resetPassword(email)
    } catch (err: any) {
      console.error('Erro ao resetar senha:', err)
      setError(err.message || 'Erro ao resetar senha')
      throw err
    }
  }, [])

  // Refresh users
  const refreshUsers = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  // Carregar usuários na inicialização
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    toggleMFA,
    resetPassword,
    refreshUsers,
  }
}






