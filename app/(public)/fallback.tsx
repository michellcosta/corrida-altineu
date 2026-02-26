import SectionRenderer from '@/components/cms/SectionRenderer'
import HighlightsSection from '@/components/sections/HighlightsSection'
import SponsorsSection from '@/components/sections/SponsorsSection'
import { HOME_PAGE_DATA } from '@/lib/cms/sample-data'
import { getPublishedPage } from '@/lib/cms/queries'
import { getLatestEvent } from '@/lib/cms/event'

function mapFallbackSections() {
  return HOME_PAGE_DATA.sections.map((section, index) => {
    const { type, ...rest } = section as any
    return {
      id: `fallback-${index}`,
      component_type: type,
      content: rest,
    }
  })
}

export default async function Home() {
  const [eventData, cmsPage] = await Promise.all([getLatestEvent(), getPublishedPage('home')])

  const sections =
    cmsPage && cmsPage.sections.length > 0 ? cmsPage.sections : mapFallbackSections()

  const sectionTypes = new Set(sections.map((section) => section.component_type))

  return (
    <>
      {sections.map((section, index) => (
        <SectionRenderer
          key={section.id ?? `${section.component_type}-${index}`}
          section={section}
          eventData={eventData}
        />
      ))}

      {/* Se no CMS ainda nao existirem secoes equivalentes, mantemos os modulos adicionais */}
      {!sectionTypes.has('highlights') && <HighlightsSection />}
      {!sectionTypes.has('sponsors') && <SponsorsSection />}
    </>
  )
}
