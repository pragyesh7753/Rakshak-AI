import { Building2, Rocket, Landmark, Shield } from 'lucide-react'

export function TargetAudience() {
  const audiences = [
    {
      icon: Building2,
      title: 'Enterprises',
      description: 'Protect sprawling digital footprints and brand reputation across global markets.',
    },
    {
      icon: Rocket,
      title: 'Startups',
      description: 'Secure your fast-growing infrastructure without hiring a large security team.',
    },
    {
      icon: Landmark,
      title: 'Government',
      description: 'Defend critical infrastructure and sensitive public sector communications.',
    },
    {
      icon: Shield,
      title: 'Financial Sector',
      description: 'Prevent fraud, credential harvesting, and targeted phishing campaigns.',
    },
  ]

  return (
    <section className="py-24 bg-background relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Who Is It For
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for organizations that refuse to be the next headline.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => {
            const Icon = audience.icon
            return (
              <div key={index} className="p-6 rounded-2xl border border-border/50 bg-card/40 hover:bg-muted/20 transition-colors">
                <Icon className="h-8 w-8 text-primary mb-4 opacity-80" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{audience.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{audience.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
