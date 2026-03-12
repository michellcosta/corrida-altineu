import { Metadata } from 'next'
import './admin.css'
import PWAProvider from '@/components/admin/PWAProvider'
import InstallPWAButton from '@/components/admin/InstallPWAButton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Painel Administrativo | Corrida de Macuco',
  description: 'Sistema de gerenciamento da Corrida Rústica de Macuco',
  robots: 'noindex, nofollow', // Não indexar páginas admin
  manifest: '/manifest-admin.json',
  themeColor: '#2563eb',
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PWAProvider />
      <div className="fixed top-4 right-4 z-50">
        <InstallPWAButton />
      </div>
      {children}
    </>
  )
}








