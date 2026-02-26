'use client'

import { createClient } from '@/lib/supabase/browserClient'

export interface AdminUser {
  id: string
  user_id: string
  name: string
  email: string
  role: 'SITE_ADMIN' | 'CHIP_ADMIN' | 'ORG_ADMIN'
  is_active: boolean
  mfa_enabled: boolean
  created_at: string
  last_login_at?: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'SITE_ADMIN' | 'CHIP_ADMIN' | 'ORG_ADMIN'
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: 'SITE_ADMIN' | 'CHIP_ADMIN' | 'ORG_ADMIN'
  is_active?: boolean
  mfa_enabled?: boolean
}

class UsersApiClient {
  private supabase = createClient()

  // Buscar todos os usuários admin
  async getUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await this.supabase
        .from('admin_users')
        .select(`
          id,
          user_id,
          name,
          email,
          role,
          is_active,
          created_at,
          last_login_at
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar usuários:', error)
        throw new Error(error.message)
      }

      // Adicionar mfa_enabled como false por padrão até a coluna ser criada
      return (data || []).map(user => ({
        ...user,
        mfa_enabled: false // Temporário até adicionar a coluna no banco
      }))
    } catch (error: any) {
      console.error('Erro na API getUsers:', error)
      throw new Error(error.message || 'Erro ao buscar usuários')
    }
  }

  // Criar novo usuário admin (via API route - usa service role no servidor)
  async createUser(userData: CreateUserData): Promise<AdminUser> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao criar usuário')
    }
    return { ...data, mfa_enabled: false }
  }

  // Atualizar usuário
  async updateUser(id: string, userData: UpdateUserData): Promise<AdminUser> {
    try {
      const { data, error } = await this.supabase
        .from('admin_users')
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar usuário:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error: any) {
      console.error('Erro na API updateUser:', error)
      throw new Error(error.message || 'Erro ao atualizar usuário')
    }
  }

  // Deletar usuário (via API route - usa service role no servidor)
  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Erro ao deletar usuário')
    }
  }

  // Toggle MFA (coluna mfa_enabled ainda não existe no schema - no-op por enquanto)
  async toggleMFA(_id: string): Promise<void> {
    // TODO: adicionar coluna mfa_enabled ao admin_users e implementar
  }

  // Resetar senha (usa cliente anon - resetPasswordForEmail não precisa de admin)
  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })
    if (error) {
      throw new Error(error.message)
    }
  }
}

export const usersApi = new UsersApiClient()
