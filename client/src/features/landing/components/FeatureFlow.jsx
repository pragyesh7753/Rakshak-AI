import { MessageSquare, Globe, Mail } from 'lucide-react'

export function FeatureFlow() {
  const steps = [
    {
      id: 1,
      title: 'Social Intelligence',
      subtitle: 'Early Signal Detection',
      icon: MessageSquare,
      points: [
        'Monitor social media, forums, and public discussions',
        'Detect suspicious conversations related to your organization',
        'Identify early intent of attackers'
      ],
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 2,
      title: 'Domain Intelligence',
      subtitle: 'Attack Preparation Detection',
      icon: Globe,
      points: [
        'Detect typosquatting and lookalike domains',
        'Monitor WHOIS records and SSL certificate issuance',
        'Identify domains before they are weaponized'
      ],
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30'
    },
    {
      id: 3,
      title: 'Email Intelligence',
      subtitle: 'Attack Execution Detection',
      icon: Mail,
      points: [
        'Analyze suspicious forwarded emails',
        'Detect phishing patterns and malicious content',
        'Alert organizations in real-time'
      ],
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30'
    }
  ]

  return (
    <section className="py-24 bg-background relative border-t border-border/50 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            From Signal to Attack — <br className="hidden md:block"/> Rakshak AI Covers It All
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A continuous intelligence pipeline that connects the dots across the entire attack lifecycle.
          </p>
        </div>

        <div className="relative">
          {/* Main vertical line connecting steps */}
          <div className="absolute left-8 md:left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500/50 via-emerald-500/50 to-amber-500/50 md:-translate-x-1/2" />

          <div className="space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 1

              return (
                <div key={step.id} className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16">
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center -translate-x-[7.5px] md:-translate-x-[8px]">
                    <div className={`h-4 w-4 rounded-full bg-background border-2 z-10 shadow-[0_0_15px_currentColor] ${step.borderColor.replace('border-', 'border-').replace('/30', '')} ${step.color}`} />
                  </div>

                  {/* Left Side (Content or Empty space) */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:order-2 md:pl-16' : 'md:text-right md:pr-16'}`}>
                    <div className="space-y-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${step.bgColor} ${step.color} border ${step.borderColor}`}>
                        {step.subtitle}
                      </div>
                      <h3 className="text-3xl font-bold text-foreground">{step.title}</h3>
                      <ul className={`space-y-3 ${isEven ? '' : 'md:items-end'} flex flex-col`}>
                        {step.points.map((point, i) => (
                          <li key={i} className={`flex items-start gap-3 text-muted-foreground text-base ${isEven ? 'text-left' : 'md:text-right md:flex-row-reverse text-left'}`}>
                            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${step.bgColor.split('/')[0].replace('bg-', 'bg-')}`} />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Side (Visuals) */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:order-1 md:pr-16 md:flex md:justify-end' : 'md:pl-16'}`}>
                    <div className={`h-40 w-full max-w-sm rounded-xl border ${step.borderColor} ${step.bgColor} backdrop-blur-md flex items-center justify-center relative overflow-hidden group mx-auto md:mx-0`}>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Icon className={`h-16 w-16 ${step.color} opacity-80 group-hover:scale-110 transition-transform duration-500`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
