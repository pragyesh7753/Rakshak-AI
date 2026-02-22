import { Card } from '@/components/ui/card'
import { AlertTriangle, DollarSign, Clock } from 'lucide-react'

export function ProblemSection() {
  const problems = [
    {
      icon: AlertTriangle,
      title: 'SMBs Are Prime Targets',
      description: '43% of cyberattacks target small businesses, yet most lack dedicated security teams or monitoring tools.',
    },
    {
      icon: DollarSign,
      title: 'Breaches Are Expensive',
      description: 'Average cost of a data breach for SMBs is $2.98M. Early detection can prevent catastrophic losses.',
    },
    {
      icon: Clock,
      title: 'Threats Emerge 24/7',
      description: 'Credentials leak on paste sites, GitHub repos expose secrets, and attackers discuss targets in real-time.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Why SMBs Need Proactive Security
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Traditional security tools react after breaches happen. Rakshak AI detects threats before they strike.
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
