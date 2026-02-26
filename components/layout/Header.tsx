'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react'

const ShieldIcon = ({ size = 14 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const navigation = [
  { name: 'Início', href: '/' },
  {
    name: 'Provas',
    href: '/prova-10k',
    submenu: [
      { name: 'Geral 10K', href: '/prova-10k' },
      { name: 'Morador 10K', href: '/morador-10k' },
      { name: '60+ 10K', href: '/60-mais-10k' },
      { name: 'Infantil 2K', href: '/prova-kids' },
    ],
  },
  { name: 'Evento', href: '/programacao', submenu: [
    { name: 'Percursos', href: '/percursos' },
    { name: 'Premiações', href: '/premiacoes' },
    { name: 'Programação', href: '/programacao' },
  ]},
  { name: 'Resultados', href: '/resultados' },
  { name: 'Guia', href: '/guia-atleta' },
  { name: 'Contato', href: '/contato' },
]

function isActive(href: string, pathname: string, submenu?: { href: string }[]) {
  if (pathname === href) return true
  if (submenu) return submenu.some((s) => pathname === s.href || pathname.startsWith(s.href + '/'))
  return false
}

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      // Fechar menu mobile ao rolar
      if (isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  // Fechar menu ao clicar fora ou pressionar ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const nav = target.closest('nav')
      const menuButton = target.closest('button[aria-label*="menu" i]')
      
      // Se clicou fora do nav ou no botão do menu (que já fecha/abre via onClick)
      if (isOpen && nav && !menuButton) {
        // Verificar se o clique foi fora do menu mobile
        const mobileMenu = nav.querySelector('.lg\\:hidden')
        if (mobileMenu && !mobileMenu.contains(target)) {
          setIsOpen(false)
        }
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll do body quando menu está aberto (mas o menu pode rolar)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'shadow-xl py-3'
          : 'py-4 backdrop-blur-md'
      }`}
    >
      {/* Background: gradient + subtle pattern + accent line */}
      <div
        className={`absolute inset-0 -z-10 ${
          isScrolled
            ? 'bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800'
            : 'bg-gradient-to-br from-primary-600/90 via-primary-700/90 to-primary-800/85'
        }`}
      >
        {/* Subtle diagonal shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        {/* Accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-400 to-transparent opacity-90" />
      </div>

      <nav className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo + Admin (sempre visível) */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 ring-1 ring-white/30 shadow-inner transition-all duration-200 group-hover:scale-105 group-hover:ring-accent-400/50">
                <span className="font-display text-lg font-bold text-white drop-shadow-sm">51ª</span>
                <span className="-mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-white/90">Edição</span>
                <div className="absolute -bottom-px left-1/2 h-px w-6 -translate-x-1/2 rounded-full bg-accent-400/80" />
              </div>
              <div className="hidden sm:block text-white">
                <p className="font-display text-xl font-bold tracking-tight">Corrida de Macuco</p>
                <p className="text-xs text-white/70 tracking-wide">Tradição desde 1974</p>
              </div>
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center justify-center rounded-lg p-1.5 text-white/50 transition-colors hover:text-white/80 hover:bg-white/10 lg:hidden"
              title="Área administrativa"
            >
              <ShieldIcon />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 lg:flex lg:rounded-lg lg:bg-white/5 lg:px-2 lg:py-1.5 lg:ring-1 lg:ring-white/10">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.submenu && setActiveSubmenu(item.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-white/15 hover:text-white ${
                    isActive(item.href, pathname, item.submenu)
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-white/90'
                  }`}
                  aria-current={isActive(item.href, pathname, item.submenu) ? 'page' : undefined}
                >
                  {item.name}
                  {item.submenu && <ChevronDown size={16} aria-hidden />}
                </Link>

                {/* Submenu */}
                {item.submenu && activeSubmenu === item.name && (
                  <div className="absolute left-0 top-full mt-1 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.name}
                        href={subitem.href}
                        className={`block rounded-lg px-4 py-2 text-sm transition-colors hover:bg-primary-50 hover:text-primary-600 ${
                          pathname === subitem.href ? 'bg-primary-50 font-semibold text-primary-600' : 'text-gray-700'
                        }`}
                        aria-current={pathname === subitem.href ? 'page' : undefined}
                      >
                        {subitem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons (desktop lg+) */}
          <div className="hidden items-center space-x-3 lg:flex lg:pl-4 lg:border-l lg:border-white/20">
            <Link
              href="/inscricao/lista"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white"
            >
              Lista de Inscritos
            </Link>
            <Link
              href="/inscricao/acompanhar"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/40"
            >
              Acompanhar Inscrição
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/inscricao"
              className="relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-accent-600 hover:shadow-xl active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/10 before:to-transparent before:pointer-events-none sm:px-6 sm:text-base"
            >
              Inscrever-se
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-white/50 transition-colors hover:text-white/80 hover:bg-white/10"
              title="Área administrativa"
            >
              <ShieldIcon />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/20 lg:hidden"
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isOpen}
            suppressHydrationWarning
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="mt-4 max-h-[calc(100vh-120px)] overflow-y-auto animate-slide-up rounded-xl border border-white/20 bg-white/95 p-4 text-gray-800 shadow-lg lg:hidden">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-4 py-2 font-medium transition-colors hover:bg-primary-50 hover:text-primary-600"
                    onClick={() => !item.submenu && setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.submenu && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className="block rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => setIsOpen(false)}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-2">
                <Link
                  href="/admin/login"
                  className="flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldIcon size={14} />
                  <span>Admin</span>
                </Link>
                <Link
                  href="/inscricao/lista"
                  className="block rounded-lg py-2.5 px-4 text-center font-medium text-white transition-colors hover:bg-white/15"
                  onClick={() => setIsOpen(false)}
                >
                  Lista de Inscritos
                </Link>
                <Link
                  href="/inscricao/acompanhar"
                  className="block rounded-lg border border-white/60 bg-white/10 py-2.5 px-4 text-center font-semibold text-white transition-colors hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  Acompanhar Inscrição
                </Link>
                <Link
                  href="/inscricao"
                  className="block whitespace-nowrap rounded-lg bg-accent-500 py-2.5 px-4 text-center font-semibold text-white transition-all hover:bg-accent-600"
                  onClick={() => setIsOpen(false)}
                >
                  Inscrever-se
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
