import { Card } from '@/components/ui/card'
import { MessageSquare, Globe, Mail } from 'lucide-react'

export function ProblemSection() {
  const problems = [
    {
      icon: MessageSquare,
      title: 'Discussions on forums/social media',
      description: 'Attackers discuss targets, share leaked data, and plan attacks in public and private spaces long before execution.',
    },
    {
      icon: Globe,
      title: 'Fake domains being registered',
      description: 'Lookalike domains are set up days or weeks in advance to prepare for credential harvesting and phishing.',
    },
    {
      icon: Mail,
      title: 'Phishing emails being deployed',
      description: 'Targeted campaigns are sent to employees to breach the perimeter. By then, the attack is already in motion.',
    },
  ]

  return (
    <section id="features" className="py-20 md:py-28 bg-background relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Threats Start Outside Your Organization
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Most cyber attacks don't start with emails — they begin publicly and evolve. By focusing only on the perimeter, you miss the early warning signs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon
            return (
              <Card key={index} className="p-8 border-border/50 bg-card/40 backdrop-blur-sm hover:bg-muted/20 transition-all hover:-translate-y-1">
                <div className="flex flex-col gap-5">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground leading-snug">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{problem.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
      
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
    </section>
  )
}
