import { Card } from '@/components/ui/card'
import { Waves, Brain, AlertCircle, Bell } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      number: '1',
      icon: Waves,
      title: 'We Scan Reddit & GitHub',
      description: 'Our AI continuously monitors millions of public posts and repositories across the web.',
    },
    {
      number: '2',
      icon: Brain,
      title: 'Smart Threat Filtering',
      description: 'Advanced algorithms filter noise and identify potential security risks related to your digital identity.',
    },
    {
      number: '3',
      icon: AlertCircle,
      title: 'AI Analyzes & Scores Risk',
      description: 'Machine learning models analyze each threat and assign a risk score based on severity and relevance.',
    },
    {
      number: '4',
      icon: Bell,
      title: 'Real-Time Alerts & Guidance',
      description: 'Receive instant notifications with actionable security recommendations and remediation steps.',
    },
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            How CyberSentinel AI Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Our four-step process keeps you protected from emerging threats.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-12 left-[calc(50%+24px)] right-[calc(-100%+24px)] h-0.5 bg-gradient-to-r from-primary to-secondary hidden md:block" />
                )}

                <Card className="relative p-8 border-border bg-background h-full">
                  {/* Step number badge */}
                  <div className="absolute -top-4 -left-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm">
                      {step.number}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
