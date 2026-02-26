import CmsPage from '@/components/cms/CmsPage'
import Fallback from './fallback'

export default function Page() {
  return <CmsPage slug="noticias" fallback={Fallback} />
}






