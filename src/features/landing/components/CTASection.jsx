import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield } from 'lucide-react'

export function CTASection() {
  return (
    <section id="get-started" className="py-16 md:py-24 bg-linear-to-r from-primary/10 via-secondary/10 to-primary/10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply blur-3xl" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary rounded-full mix-blend-multiply blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm text-primary font-medium">
            <Shield className="h-4 w-4" />
            <span>Start free trial. No credit card required.</span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-bold text-foreground text-balance">
            Protect Your Business
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
              From Cyber Threats
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Join SMBs worldwide using Rakshak AI for proactive threat detection. Get started in minutes with our free trial.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-linear-to-r from-primary to-secondary hover:opacity-90 text-white px-8">
              <Link href="/register" className="group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border">
              <Link href="#contact">Talk to an Expert</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">100+</span> SMBs protected
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">24/7</span> monitoring
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">5 min</span> setup time
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
