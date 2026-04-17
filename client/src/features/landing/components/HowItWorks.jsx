import { UserPlus, Activity, BellRing } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: '1. Register your organization',
      description: 'Sign up and add your primary domains, brand names, and key assets to track.',
    },
    {
      icon: Activity,
      title: '2. AI monitors threat surface',
      description: 'Our engine continuously scans social media, dark web, domain registries, and email channels.',
    },
    {
      icon: BellRing,
      title: '3. Get actionable alerts',
      description: 'Receive real-time notifications with clear severity scores and remediation steps.',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-muted/20 relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From setup to proactive defense in under 5 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-colors" />
                <div className="relative p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:-translate-y-1 transition-transform h-full">
                  <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center mb-6 shadow-sm">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
