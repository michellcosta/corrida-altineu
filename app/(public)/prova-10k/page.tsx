import CmsPage from '@/components/cms/CmsPage'
import Fallback from './fallback'

export default function Page() {
  return <CmsPage slug="prova-10k" fallback={Fallback} />
}
