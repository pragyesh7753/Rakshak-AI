import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { ProblemSection } from '@/components/ProblemSection'
import { HowItWorks } from '@/components/HowItWorks'
import { USPSection } from '@/components/USPSection'
import { FeaturesGrid } from '@/components/FeaturesGrid'
import { DashboardPreview } from '@/components/DashboardPreview'
import { CTASection } from '@/components/CTASection'
import { Footer } from '@/components/Footer'

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
