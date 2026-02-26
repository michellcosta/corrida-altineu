'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browserClient'
import { AdminUser, ROLE_NAVIGATION, UserRole, ROLE_COLORS } from '@/lib/admin/types'
import {
  Menu, LogOut, User, Bell, ChevronRight,
  LayoutDashboard, FileText, Calendar, Users, BarChart, Activity,
  Download, Hash, CheckCircle, Award, AlertTriangle, MessageSquare,
  Settings, Search, Mail, Layers, File, Layout, Newspaper, Image, FileCheck, Shield
} from 'lucide-react'
import { SkeletonAdminLayout } from '@/components/ui'
import { useAlertCount } from '@/hooks/useAlertCount'

const iconMap: Record<string, any> = {
  LayoutDashboard, FileText, Calendar, Users, BarChart, Activity,
  Download, Hash, CheckCircle, Award, AlertTriangle, MessageSquare,
  Settings, Search, Mail, Layers, File, Layout, Newspaper, Image, FileCheck
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const alertCount = useAlertCount()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkAuth() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Verificar se há sessão ativa
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        console.log('Usuário não autenticado, redirecionando para login')
        router.push('/admin/login')
        return
      }

      // Buscar perfil admin
      const { data: profile, error: profileError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile) {
        console.log('Perfil admin não encontrado, redirecionando para login')
        router.push('/admin/login')
        return
      }

      // Converter para o formato AdminUser esperado
      const adminUser: AdminUser = {
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        mfaEnabled: false,
        createdAt: new Date(profile.created_at),
        lastLogin: profile.last_login_at ? new Date(profile.last_login_at) : undefined,
      }

      setUser(adminUser)
    } catch (error: any) {
      console.error('Erro ao verificar autenticação:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Mesmo com erro, redireciona para login
      router.push('/admin/login')
    }
  }

  function toggleMenu(menuName: string) {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
              <div>
                <div className="mb-1 h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <SkeletonAdminLayout />
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navigation = ROLE_NAVIGATION[user.role]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300`}>
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">51ª</span>
            </div>
            <div>
              <p className="font-display font-bold text-white">Admin Panel</p>
              <p className="text-xs text-gray-400">Macuco 2026</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${ROLE_COLORS[user.role]}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedMenus.includes(item.name)

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {Icon && <Icon size={20} />}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {Icon && <Icon size={20} />}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {(item.badge != null || (item.badgeKey === 'alerts' && alertCount > 0)) && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badgeKey === 'alerts' ? alertCount : item.badge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Submenu */}
                {hasChildren && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children!.map((child) => {
                      const ChildIcon = iconMap[child.icon]
                      const isChildActive = pathname === child.href

                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                            isChildActive
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {ChildIcon && <ChildIcon size={16} />}
                          <span>{child.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Segurança + Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-1">
          <Link
            href="/admin/settings/security"
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Shield size={20} />
            <span className="font-medium">Segurança (2FA)</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`admin-content ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {navigation.find(n => pathname.startsWith(n.href))?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">51ª Corrida de Macuco - 2026</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                href="/"
                target="_blank"
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                Ver Site →
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}

