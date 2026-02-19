import { Card } from '@/components/ui/card'
import { 
  Shield, 
  Globe, 
  Lock, 
  Bell, 
  Eye, 
  Clock 
} from 'lucide-react'

export function FeaturesGrid() {
  const features = [
    {
      icon: Shield,
      title: 'Leaked Credential Detection',
      description: 'Scan paste sites, forums, and breach databases for exposed passwords, usernames, and employee credentials.',
    },
    {
      icon: Lock,
      title: 'API Key & Secret Monitoring',
      description: 'Detect accidentally exposed API keys, tokens, and secrets in GitHub repos and public code snippets.',
    },
    {
      icon: Globe,
      title: 'Domain Surveillance',
      description: 'Monitor for typosquatting, phishing domains, and unauthorized use of your brand across the web.',
    },
    {
      icon: Eye,
      title: 'SSL Certificate Tracking',
      description: 'Track SSL certificate changes and detect suspicious certificates issued for your domains.',
    },
    {
      icon: Bell,
      title: 'Real-Time Threat Alerts',
      description: 'Instant notifications via email, Slack, or webhook when critical threats are detected.',
    },
    {
      icon: Clock,
      title: 'Alert History & Timeline',
      description: 'Complete audit trail of all detected threats, actions taken, and security posture over time.',
    },
  ]

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Core Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Comprehensive threat detection and monitoring for small and medium businesses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="p-8 border-border bg-background hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
