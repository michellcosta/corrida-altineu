import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { getSeoMetadata } from '@/lib/seo'
import FloatingAIChat from '@/components/layout/FloatingAIChat'
import AnalyticsTracker from '@/components/layout/AnalyticsTracker'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const DEFAULT_METADATA = {
  title: 'Corrida Rústica de Macuco',
  description: '51ª edição da Corrida Rústica de Macuco - 2026',
  keywords: 'corrida, macuco, esporte, atletismo',
  authors: [{ name: 'Corrida de Macuco' }],
  openGraph: {
    title: 'Corrida Rústica de Macuco',
    description: '51ª edição - 2026',
    type: 'website',
    locale: 'pt_BR',
  },
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function generateMetadata() {
  const seo = await getSeoMetadata()
  const title = seo.meta_title || DEFAULT_METADATA.title
  const description = seo.meta_description || DEFAULT_METADATA.description
  const siteName = seo.site_name || DEFAULT_METADATA.openGraph.title
  const ogImage = seo.og_image
  const ogImageUrl = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${APP_URL.replace(/\/$/, '')}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`
    : undefined
  const metadataBase = seo.canonical_url
    ? new URL(seo.canonical_url.replace(/\/$/, ''))
    : new URL(APP_URL)
  const twitterSite = seo.twitter_handle
    ? seo.twitter_handle.startsWith('@')
      ? seo.twitter_handle
      : `@${seo.twitter_handle}`
    : undefined
  return {
    metadataBase,
    title,
    description,
    keywords: seo.meta_keywords || DEFAULT_METADATA.keywords,
    authors: [{ name: siteName }],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
      siteName,
      ...(ogImageUrl && { images: [{ url: ogImageUrl }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(twitterSite && { site: twitterSite }),
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased bg-gray-50">
        <AnalyticsTracker />
        {children}
        <FloatingAIChat />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.06), 0 2px 6px -2px rgb(0 0 0 / 0.04)',
            },
          }}
        />
      </body>
    </html>
  )
}

