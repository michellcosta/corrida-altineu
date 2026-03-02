import CmsPage from '@/components/cms/CmsPage'
import Fallback from './fallback'

export const dynamic = 'force-dynamic'

export default function Page() {
  return <CmsPage slug="60-mais-10k" fallback={Fallback} />
}






