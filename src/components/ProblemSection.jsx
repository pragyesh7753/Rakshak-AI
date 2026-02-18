import { Card } from '@/components/ui/card'
import { AlertTriangle, Zap, Eye } from 'lucide-react'

export function ProblemSection() {
  const problems = [
    {
      icon: AlertTriangle,
      title: 'Data Breaches Happen Every Day',
      description: 'Millions of credentials are leaked daily across public sources like Reddit, GitHub, and dark web forums.',
    },
    {
      icon: Zap,
      title: 'Your Credentials May Already Be Exposed',
      description: 'Without monitoring, you won\'t know if your passwords, API keys, or sensitive data have been compromised.',
    },
    {
      icon: Eye,
      title: 'Hackers Plan Attacks Publicly Online',
      description: 'Attackers discuss vulnerabilities and targets in the open. We monitor these conversations to protect you.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            The Problem With Traditional Security
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Most people and organizations don't know their digital footprint is already exposed online.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon
            return (
              <Card key={index} className="p-8 border-border hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
