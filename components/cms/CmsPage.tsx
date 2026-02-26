import type { ComponentType } from 'react'

type FallbackComponent = ComponentType

interface CmsPageProps {
  slug: string
  fallback: FallbackComponent
  includeFallbackWhenEmpty?: boolean
}

export default function CmsPage({
  slug,
  fallback: Fallback,
  includeFallbackWhenEmpty = true,
}: CmsPageProps) {
  // Por enquanto, sempre mostra o fallback até configurar o Supabase
  // TODO: Implementar busca de dados do CMS quando Supabase estiver configurado
  
  return includeFallbackWhenEmpty ? <Fallback /> : null
}

