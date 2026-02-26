import CmsPage from '@/components/cms/CmsPage'
import Fallback from './fallback'

export default function FaqPage() {
  return <CmsPage slug="faq" fallback={Fallback} />
}
