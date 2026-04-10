import { Card } from '@/components/ui/card'
import { Zap, Users, ShieldCheck, TrendingUp } from 'lucide-react'

export function USPSection() {
  const features = [
    {
      icon: Zap,
      title: 'Fast Setup, No Security Team Required',
      description: 'Get started in under 5 minutes. No complex configuration or dedicated security personnel needed.',
    },
    {
      icon: ShieldCheck,
      title: 'Always-On Monitoring',
      description: '24/7 automated surveillance of OSINT sources, paste sites, and underground forums for your business.',
    },
    {
      icon: Users,
      title: 'Built for SMBs',
      description: 'Enterprise-grade security at SMB pricing. Protect your business without breaking the bank.',
    },
    {
      icon: TrendingUp,
      title: 'Proactive Defense',
      description: 'Detect threats before they become breaches. Stay ahead of attackers with early warning intelligence.',
    },
  ]

  return (
    <section className="relative py-16 md:py-24 bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-secondary/5 to-primary/5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary font-medium mb-4">
            WHY RAKSHAK AI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Why It Matters for SMBs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Cybersecurity shouldn&apos;t be complicated or expensive. Rakshak AI brings enterprise protection to growing businesses.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="p-8 border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col gap-4">
                  <div className="h-14 w-14 rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-balance">{feature.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
