import CmsPage from '@/components/cms/CmsPage'
import Fallback from './fallback'

export default function PercursosPage() {
  return <CmsPage slug="percursos" fallback={Fallback} />
}

