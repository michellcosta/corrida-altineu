import { Metadata } from 'next'
import CmsPage from '@/components/cms/CmsPage'
import Fallback from './fallback'

export const metadata: Metadata = {
  title: 'Política de Cookies | Corrida Rústica de São João Batista',
  description: 'Política de cookies do site da Corrida Rústica de São João Batista. Saiba como utilizamos cookies e como gerenciá-los conforme a LGPD.',
  keywords: 'cookies, LGPD, privacidade, corrida são joão batista',
}

export default function CookiesPage() {
  return <CmsPage slug="cookies" fallback={Fallback} />
}
