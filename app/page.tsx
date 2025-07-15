import { NavBar } from '@/components/ui/navbar'
import { HeroBanner } from '@/components/ui/hero-banner'
import { SectionDivider } from '@/components/ui/section-divider'
import { StationsPreview } from '@/components/ui/stations-preview'
import { FeaturesSection } from '@/components/ui/features-section'
import { Footer } from '@/components/ui/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <HeroBanner />
      <SectionDivider angle="top" />
      <StationsPreview />
      <SectionDivider angle="bottom" />
      <FeaturesSection />
      <Footer />
    </main>
  )
} 