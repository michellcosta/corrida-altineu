import CmsPage from '@/components/cms/CmsPage'
import Fallback from './fallback'

export const dynamic = 'force-dynamic'

export default function Page() {
  return <CmsPage slug="morador-10k" fallback={Fallback} />
}






