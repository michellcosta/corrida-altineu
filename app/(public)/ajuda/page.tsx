import CmsPage from '@/components/cms/CmsPage'
import Fallback from './fallback'

export default function AjudaPage() {
  return <CmsPage slug="ajuda" fallback={Fallback} />
}
