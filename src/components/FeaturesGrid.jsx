import { Card } from '@/components/ui/card'
import { 
  Key, 
  Link as LinkIcon, 
  BarChart3, 
  Bell, 
  GitBranch, 
  Timer 
} from 'lucide-react'

export function FeaturesGrid() {
  const features = [
    {
      icon: Key,
      title: 'Credential Leak Detection',
      description: 'Instantly detect if your usernames, passwords, or API keys have been exposed in data breaches.',
    },
    {
      icon: LinkIcon,
      title: 'Phishing Link Checker',
      description: 'Identify malicious links and phishing attempts targeting you across the web.',
    },
    {
      icon: BarChart3,
      title: 'Security Score Dashboard',
      description: 'Track your security health over time with an easy-to-understand security score.',
    },
    {
      icon: Bell,
      title: 'Real-Time Threat Alerts',
      description: 'Get instant notifications when threats are detected with recommended actions.',
    },
    {
      icon: GitBranch,
      title: 'GitHub Secret Scanner',
      description: 'Scan your repositories for accidentally committed secrets and API keys.',
    },
    {
      icon: Timer,
      title: 'Personal Threat Timeline',
      description: 'View a chronological history of all threats detected and how you responded.',
    },
  ]

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Powerful Features for Complete Protection
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Everything you need to monitor, detect, and respond to cyber threats.
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
