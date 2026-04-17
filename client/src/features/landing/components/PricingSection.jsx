import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/20 relative border-t border-border/50 overflow-hidden">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-2">
          <Bell className="h-10 w-10 text-primary" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-foreground">Pricing</h2>

        <div className="inline-block border border-border/50 bg-muted/50 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-medium text-muted-foreground">
          Coming Soon
        </div>

        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
          We're crafting flexible plans for teams of every size — from early-stage startups to enterprise security operations.
        </p>

        {/* Placeholder plan cards */}
        <div className="grid sm:grid-cols-3 gap-6 mt-12 text-left">
          {[
            { name: 'Starter', desc: 'For startups and small teams getting started with proactive security.' },
            { name: 'Pro', desc: 'For growing organizations needing deeper threat intelligence coverage.', highlight: true },
            { name: 'Enterprise', desc: 'Custom SLAs, dedicated support, and on-prem deployment options.' },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border backdrop-blur-sm ${
                plan.highlight
                  ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/20'
                  : 'border-border/50 bg-card/40'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
              <div className="text-2xl font-bold text-muted-foreground/50">— / mo</div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button variant="outline" className="rounded-full px-8 h-12 border-border">
            Notify Me When Available
          </Button>
        </div>
      </div>
    </section>
  )
}
