import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/serverClient'
import HeroSection from '@/components/sections/HeroSection'
import CountdownSection from '@/components/sections/CountdownSection'
import HighlightsSection from '@/components/sections/HighlightsSection'
import TimelineSection from '@/components/sections/TimelineSection'
import CTASection from '@/components/sections/CTASection'

const CategoriesSection = dynamic(
  () => import('@/components/sections/CategoriesSection'),
  { ssr: true }
)

async function getEventData() {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('year', 2026)
      .single()
    return data
  } catch {
    return null
  }
}

export default async function Home() {
  const eventData = await getEventData()

  return (
    <>
      <HeroSection eventData={eventData} />
      <CountdownSection eventData={eventData} />
      <CategoriesSection />
      <HighlightsSection />
      <TimelineSection />
      <CTASection />
    </>
  )
}
