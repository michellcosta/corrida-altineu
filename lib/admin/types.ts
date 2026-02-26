export enum UserRole {
  SITE_ADMIN = 'SITE_ADMIN',
  CHIP_ADMIN = 'CHIP_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  mfaEnabled: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface NavItem {
  name: string
  href: string
  icon: string
  badge?: number
  badgeKey?: 'alerts'
  children?: NavItem[]
}

export const ROLE_NAVIGATION: Record<UserRole, NavItem[]> = {
  [UserRole.SITE_ADMIN]: [
    { name: 'Dashboard', href: '/admin/site', icon: 'LayoutDashboard' },
    {
      name: 'Conteudo',
      href: '/admin/site/content',
      icon: 'FileText',
      children: [
        { name: 'Paginas', href: '/admin/site/content/pages', icon: 'FileText' },
        { name: 'Posts', href: '/admin/site/content/posts', icon: 'Newspaper' },
        { name: 'Midia', href: '/admin/site/content/media', icon: 'Image' },
      ],
    },
    {
      name: 'Configuracoes',
      href: '/admin/site/settings',
      icon: 'Settings',
      children: [
        { name: 'Evento', href: '/admin/site/settings/event', icon: 'Calendar' },
        { name: 'Templates', href: '/admin/site/settings/templates', icon: 'Mail' },
        { name: 'SEO', href: '/admin/site/settings/seo', icon: 'Search' },
      ],
    },
    { name: 'Regulamentos', href: '/admin/site/regulations', icon: 'FileCheck' },
    { name: 'Usuarios', href: '/admin/site/users', icon: 'Users' },
  ],
  [UserRole.CHIP_ADMIN]: [
    { name: 'Dashboard', href: '/admin/chip', icon: 'LayoutDashboard' },
    { name: 'Inscritos', href: '/admin/chip/registrations', icon: 'Users' },
    { name: 'Exportacoes', href: '/admin/chip/exports', icon: 'Download' },
    { name: 'Numeracao', href: '/admin/chip/numbering', icon: 'Hash' },
    { name: 'Check-in', href: '/admin/chip/checkin', icon: 'CheckCircle' },
    { name: 'Resultados', href: '/admin/chip/results', icon: 'Award' },
    { name: 'Alertas', href: '/admin/chip/alerts', icon: 'AlertTriangle', badgeKey: 'alerts' },
  ],
  [UserRole.ORG_ADMIN]: [
    { name: 'Dashboard', href: '/admin/org', icon: 'LayoutDashboard' },
    { name: 'Relatorios', href: '/admin/org/reports', icon: 'FileText' },
    { name: 'Mensagens', href: '/admin/org/messages', icon: 'MessageSquare' },
  ],
}

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.SITE_ADMIN]: 'bg-purple-100 text-purple-800',
  [UserRole.CHIP_ADMIN]: 'bg-blue-100 text-blue-800',
  [UserRole.ORG_ADMIN]: 'bg-green-100 text-green-800',
}





