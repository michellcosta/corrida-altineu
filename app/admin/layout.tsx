import { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: 'Painel Administrativo | Corrida de Macuco',
  description: 'Sistema de gerenciamento da Corrida Rústica de Macuco',
  robots: 'noindex, nofollow', // Não indexar páginas admin
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}








