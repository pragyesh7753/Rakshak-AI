import { Navbar } from '@/features/landing/components/Navbar'
import { Hero } from '@/features/landing/components/Hero'
import { ProblemSection } from '@/features/landing/components/ProblemSection'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { USPSection } from '@/features/landing/components/USPSection'
import { FeaturesGrid } from '@/features/landing/components/FeaturesGrid'
import { DashboardPreview } from '@/features/landing/components/DashboardPreview'
import { CTASection } from '@/features/landing/components/CTASection'
import { Footer } from '@/features/landing/components/Footer'

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <USPSection />
      <FeaturesGrid />
      <DashboardPreview />
      <CTASection />
      <Footer />
    </div>
  )
}
