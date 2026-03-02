'use client'

import { useState, useEffect, useRef } from 'react'
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
import { useAdminNotifications } from '@/hooks/useAdminNotifications'

const iconMap: Record<string, any> = {
  LayoutDashboard, FileText, Calendar, Users, BarChart, Activity,
  Download, Hash, CheckCircle, Award, AlertTriangle, MessageSquare,
  Settings, Search, Mail, Layers, File, Layout, Newspaper, Image, FileCheck
}

interface AdminLayoutProps {
  children: React.ReactNode
}

function formatNotificationDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins} min`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const alertCount = useAlertCount()
  const { notifications, unreadCount, markAsRead } = useAdminNotifications()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const notificationsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    if (notificationsOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [notificationsOpen])

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

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop: toggle com sidebarOpen | Mobile: overlay com mobileMenuOpen */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white overflow-y-auto z-40 transition-transform duration-300 ease-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}`}
      >
        <div className="p-4 md:p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center space-x-3 group" onClick={closeMobileMenu}>
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
                    onClick={closeMobileMenu}
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
                          onClick={closeMobileMenu}
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
            onClick={closeMobileMenu}
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
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ml-0 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setMobileMenuOpen((o) => !o)
                  } else {
                    setSidebarOpen((o) => !o)
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                aria-label="Abrir menu"
              >
                <Menu size={24} />
              </button>
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-bold text-gray-900 truncate">
                  {navigation.find(n => pathname.startsWith(n.href))?.name || 'Dashboard'}
                </h1>
                <p className="text-xs md:text-sm text-gray-500 hidden sm:block">51ª Corrida de Macuco - 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-4 shrink-0" ref={notificationsRef}>
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen((o) => !o)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                  aria-label="Notificações"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Notificações</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAsRead(undefined, true)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 text-center">Nenhuma notificação</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 ${!n.read_at ? 'bg-primary-50/50' : ''}`}
                          >
                            {n.link ? (
                              <Link
                                href={n.link}
                                onClick={() => {
                                  if (!n.read_at) markAsRead([n.id])
                                  setNotificationsOpen(false)
                                }}
                                className="block"
                              >
                                <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatNotificationDate(n.created_at)}</p>
                              </Link>
                            ) : (
                              <div
                                onClick={() => !n.read_at && markAsRead([n.id])}
                                className="cursor-default"
                              >
                                <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatNotificationDate(n.created_at)}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link
                href="/"
                target="_blank"
                className="text-xs md:text-sm text-primary-600 hover:text-primary-700 font-semibold whitespace-nowrap"
              >
                Ver Site →
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden
        />
      )}
    </div>
  )
}

