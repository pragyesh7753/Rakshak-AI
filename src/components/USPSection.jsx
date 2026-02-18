import { Card } from '@/components/ui/card'
import { Map, Zap, Inbox, Brain } from 'lucide-react'

export function USPSection() {
  const features = [
    {
      icon: Map,
      title: 'Digital Life Exposure Map',
      description: 'Visualize your entire digital footprint across the web. See exactly where your data appears and what\'s at risk.',
    },
    {
      icon: Zap,
      title: 'Hack Risk Prediction Engine',
      description: 'Predictive AI models forecast potential attacks based on emerging threats and historical patterns.',
    },
    {
      icon: Inbox,
      title: 'Cyber Security Organizer',
      description: 'Manage all your security alerts, incidents, and remediation tasks in one intelligent dashboard.',
    },
    {
      icon: Brain,
      title: 'Explainable Security AI',
      description: 'Understand why threats matter. Our AI explains each finding in plain language with context and impact.',
    },
  ]

  return (
    <section className="relative py-16 md:py-24 bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary font-medium mb-4">
            FEATURED
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            What Makes Us Different
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Advanced AI capabilities that go beyond basic threat detection to provide comprehensive security intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="p-8 border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col gap-4">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
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
