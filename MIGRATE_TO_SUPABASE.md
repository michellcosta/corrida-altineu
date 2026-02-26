# 🔄 Guia de Migração - NestJS → Supabase

Este documento explica como migrar o código existente para usar Supabase em vez do backend NestJS.

---

## 📊 Comparação de Arquitetura

### Antes (NestJS + PostgreSQL)
```
Frontend (Next.js)
    ↓
Backend (NestJS)
    ↓
PostgreSQL + Prisma
```

### Depois (Supabase)
```
Frontend (Next.js)
    ↓
Supabase (PostgreSQL + API REST + Auth)
```

**Vantagens**:
- ✅ Menos código para manter
- ✅ API REST gerada automaticamente
- ✅ Auth integrado (JWT, refresh tokens, etc.)
- ✅ Deploy simplificado
- ✅ 100% gratuito para até 500 MB de banco

---

## 🔧 Passo 1: Instalar Dependências

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

---

## 📁 Passo 2: Criar Clientes Supabase

### 2.1 Cliente Browser (para Client Components)

Crie `lib/supabase/browserClient.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2.2 Cliente Server (para Server Components/API Routes)

Crie `lib/supabase/serverClient.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server component
          }
        },
      },
    }
  )
}
```

### 2.3 Middleware (para proteger rotas)

Crie `middleware.ts` na raiz do projeto:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 🔐 Passo 3: Migrar Autenticação

### 3.1 Remover Mock Auth

**Antes** (`lib/admin/auth.ts` - mock):
```typescript
export async function login(email: string, password: string) {
  // Mock implementation
  return { user: mockUser, token: 'fake-token' }
}
```

**Depois** (`lib/admin/auth.ts` - real):
```typescript
'use client'

import { createClient } from '@/lib/supabase/browserClient'

export async function login(email: string, password: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Buscar perfil admin
  const { data: profile, error: profileError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', data.user.id)
    .single()

  if (profileError) throw profileError

  return { user: data.user, profile }
}

export async function logout() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) return null

  // Buscar perfil admin
  const { data: profile } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return { user, profile }
}
```

### 3.2 Atualizar Página de Login

**Atualizar** `app/admin/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/admin/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/admin/site')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Login Admin</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
```

---

## 📝 Passo 4: Migrar Hooks e API

### 4.1 Hook para Event Settings

**Antes** (`hooks/useAdmin.ts` - mock):
```typescript
export function useEventSettings() {
  const [settings, setSettings] = useState(mockSettings)
  
  async function saveSettings(data: any) {
    // Mock save
    setSettings(data)
  }

  return { settings, saveSettings, loading: false }
}
```

**Depois** (`hooks/useAdmin.ts` - real):
```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/browserClient'

export function useEventSettings(year: number = 2026) {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [year])

  async function loadSettings() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          categories (*)
        `)
        .eq('year', year)
        .single()

      if (error) throw error
      setSettings(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings(data: any) {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          race_date: data.race_date,
          age_cutoff_date: data.age_cutoff_date,
          location: data.location,
          registrations_open: data.registrations_open,
          // ... outros campos
        })
        .eq('year', year)

      if (error) throw error
      
      await loadSettings() // Recarregar
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  return { settings, saveSettings, loading, error, reload: loadSettings }
}
```

### 4.2 Hook para Dashboard Stats

```typescript
export function useDashboardStats(role: string) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      // Buscar estatísticas agregadas
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('id, status, category_id', { count: 'exact' })

      if (regError) throw regError

      // Agrupar por status
      const byStatus = registrations.reduce((acc: any, reg: any) => {
        acc[reg.status] = (acc[reg.status] || 0) + 1
        return acc
      }, {})

      setStats({
        total: registrations.length,
        confirmed: byStatus.confirmed || 0,
        pending: byStatus.pending || 0,
        rejected: byStatus.rejected || 0,
      })
    } catch (err: any) {
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, reload: loadStats }
}
```

---

## 📄 Passo 5: Migrar Páginas Admin

### 5.1 Dashboard

**Atualizar** `app/admin/site/page.tsx`:

```typescript
'use client'

import { useDashboardStats } from '@/hooks/useAdmin'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/admin/auth'

export default function SiteDashboard() {
  const [user, setUser] = useState<any>(null)
  const { stats, loading } = useDashboardStats('SITE_ADMIN')

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  if (!user) return <div>Carregando...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Bem-vindo, {user.profile?.name}
      </h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Total de Inscrições</h3>
          <p className="text-3xl font-bold mt-2">
            {loading ? '...' : stats?.total || 0}
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Confirmadas</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {loading ? '...' : stats?.confirmed || 0}
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Pendentes</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {loading ? '...' : stats?.pending || 0}
          </p>
        </div>

        <div className="bg-red-50 p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Rejeitadas</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {loading ? '...' : stats?.rejected || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 5.2 Event Settings

**Atualizar** `app/admin/site/settings/event/page.tsx`:

```typescript
'use client'

import { useEventSettings } from '@/hooks/useAdmin'
import { useState } from 'react'

export default function EventSettingsPage() {
  const { settings, saveSettings, loading } = useEventSettings(2026)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    const result = await saveSettings(data)

    if (result.success) {
      setMessage('✅ Configurações salvas com sucesso!')
    } else {
      setMessage(`❌ Erro: ${result.error}`)
    }

    setSaving(false)
  }

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações do Evento</h1>

      {message && (
        <div className="mb-4 p-4 rounded bg-gray-100">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Ano do Evento
            </label>
            <input
              type="number"
              name="year"
              defaultValue={settings?.year}
              className="w-full px-3 py-2 border rounded"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Edição
            </label>
            <input
              type="number"
              name="edition"
              defaultValue={settings?.edition}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Data da Prova
            </label>
            <input
              type="date"
              name="race_date"
              defaultValue={settings?.race_date}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Data de Corte (Idade)
            </label>
            <input
              type="date"
              name="age_cutoff_date"
              defaultValue={settings?.age_cutoff_date}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  )
}
```

---

## 🗑️ Passo 6: Remover Código Antigo

Após migrar tudo, você pode remover:

```bash
# Mover backend para pasta legacy (não deletar ainda)
mkdir -p legacy
mv backend/ legacy/
mv docker-compose.yml legacy/
mv BACKEND.md legacy/
mv BACKEND_SETUP.md legacy/
mv prisma/ legacy/ # Se houver

# Atualizar package.json (remover scripts do backend)
# Editar manualmente e remover linhas relacionadas a NestJS/Prisma
```

---

## ✅ Passo 7: Checklist de Migração

- [ ] Supabase criado e schema executado
- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Dependências instaladas (`@supabase/supabase-js`)
- [ ] Clientes Supabase criados (`browserClient.ts` e `serverClient.ts`)
- [ ] Middleware configurado
- [ ] Autenticação migrada (`lib/admin/auth.ts`)
- [ ] Hooks migrados (`hooks/useAdmin.ts`)
- [ ] Páginas admin atualizadas
- [ ] Testes locais executados (`npm run dev`)
- [ ] Deploy no Vercel configurado
- [ ] Backend antigo movido para `legacy/`

---

## 🧪 Passo 8: Testar Localmente

```bash
# 1. Configurar .env.local
cp .env.local.example .env.local
# Edite e adicione as chaves do Supabase

# 2. Rodar dev server
npm run dev

# 3. Testar fluxos:
# - Login admin: http://localhost:3000/admin/login
# - Dashboard: http://localhost:3000/admin/site
# - Event Settings: http://localhost:3000/admin/site/settings/event
```

---

## 📚 Próximos Passos

Após a migração básica funcionar:

1. **Implementar inscrições reais** (substituir formulário mock)
2. **Adicionar dashboard de atletas** (área do atleta)
3. **Implementar upload de arquivos** (Supabase Storage)
4. **Configurar emails** (Supabase Auth + templates)
5. **Adicionar relatórios e exports** (API routes com `service_role`)

---

**🎉 Migração completa! Agora você tem um backend serverless totalmente gerenciado! 🎉**








