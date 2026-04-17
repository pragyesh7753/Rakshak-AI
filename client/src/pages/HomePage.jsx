import { Navbar } from '@/features/landing/components/Navbar'
import { Hero } from '@/features/landing/components/Hero'
import { ProblemSection } from '@/features/landing/components/ProblemSection'
import { FeatureFlow } from '@/features/landing/components/FeatureFlow'
import { AiRiskEngine } from '@/features/landing/components/AiRiskEngine'
import { ImpactSection } from '@/features/landing/components/ImpactSection'
import { HowItWorks } from '@/features/landing/components/HowItWorks'
import { TargetAudience } from '@/features/landing/components/TargetAudience'
import { CTASection } from '@/features/landing/components/CTASection'
import { Footer } from '@/features/landing/components/Footer'

export function HomePage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/30 min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <FeatureFlow />
        <AiRiskEngine />
        <ImpactSection />
        <HowItWorks />
        <TargetAudience />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
