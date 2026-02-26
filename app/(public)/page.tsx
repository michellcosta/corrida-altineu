import dynamic from 'next/dynamic'
import HeroSection from '@/components/sections/HeroSection'
import CountdownSection from '@/components/sections/CountdownSection'
import HighlightsSection from '@/components/sections/HighlightsSection'
import TimelineSection from '@/components/sections/TimelineSection'
import SponsorsSection from '@/components/sections/SponsorsSection'
import CTASection from '@/components/sections/CTASection'

const CategoriesSection = dynamic(
  () => import('@/components/sections/CategoriesSection'),
  { ssr: true }
)

export default function Home() {
  // Por enquanto, sem dados do Supabase até configurar
  const eventData = null

  return (
    <>
      <HeroSection eventData={eventData} />
      <CountdownSection eventData={eventData} />
      <CategoriesSection />
      <HighlightsSection />
      <TimelineSection />
      <SponsorsSection />
      <CTASection />
    </>
  )
}
