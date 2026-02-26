"use client"

import { createClient } from '@/lib/supabase/browserClient'

export interface AdminUser {
  id: string
  user_id: string
  name: string
  email: string
  role: 'SITE_ADMIN' | 'CHIP_ADMIN' | 'ORG_ADMIN'
  is_active: boolean
  created_at: string
  last_login_at?: string
}

export interface LoginResult {
  user: { id: string; email?: string }
  profile: { role: string; name: string }
  requiresMfa?: boolean
}

export async function login(email: string, password: string): Promise<LoginResult | null> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    throw new Error(error?.message || 'Usuario nao encontrado')
  }
  const { data: profile, error: profileError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (profileError) {
    throw new Error(profileError.message)
  }
  if (!profile) {
    throw new Error('Sua conta não está cadastrada como administrador. Entre em contato com o administrador do site.')
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const requiresMfa = aal?.nextLevel === 'aal2' && aal?.currentLevel !== aal?.nextLevel

  return {
    user: data.user,
    profile,
    requiresMfa: !!requiresMfa,
  }
}

export async function verifyMfa(code: string): Promise<LoginResult | null> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error || !data?.totp?.length) {
    throw new Error('Nenhum fator 2FA encontrado.')
  }
  const factorId = data.totp[0].id
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
  if (challengeError || !challenge?.id) {
    throw new Error(challengeError?.message || 'Erro ao criar desafio')
  }
  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim(),
  })
  if (verifyError) {
    throw new Error(verifyError.message || 'Código inválido')
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile) return null
  return { user, profile }
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }
  const { data: profile, error: profileError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (profileError || !profile) {
    return null
  }
  return { user, profile }
}
