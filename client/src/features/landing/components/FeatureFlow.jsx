import { useRef, useEffect, useState } from 'react'
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
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/60',
      activeDot: 'border-blue-400 bg-blue-400/20',
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
      borderColor: 'border-emerald-500/30',
      glowColor: 'shadow-emerald-500/60',
      activeDot: 'border-emerald-400 bg-emerald-400/20',
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
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-amber-500/60',
      activeDot: 'border-amber-400 bg-amber-400/20',
    }
  ]

  const sectionRef = useRef(null)
  const lineTrackRef = useRef(null)
  const [progress, setProgress] = useState(0)   // 0 → 1
  const [activeStep, setActiveStep] = useState(-1)

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current
      const track = lineTrackRef.current
      if (!section || !track) return

      const { top, height } = section.getBoundingClientRect()
      const windowH = window.innerHeight

      // progress = 0 when top of section enters bottom of viewport
      // progress = 1 when bottom of section reaches top of viewport
      const raw = (windowH - top) / (height + windowH)
      const clamped = Math.min(1, Math.max(0, raw))
      setProgress(clamped)

      // Activate dots — section has 3 steps equally spaced
      // Step 0 active at ~20%, step 1 at ~50%, step 2 at ~75%
      const thresholds = [0.18, 0.45, 0.72]
      let active = -1
      thresholds.forEach((t, i) => { if (clamped >= t) active = i })
      setActiveStep(active)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      id="features-pipeline"
      ref={sectionRef}
      className="py-24 bg-background relative border-t border-border/50 overflow-hidden"
    >
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
          {/* ── Track line (static, dim) ── */}
          <div
            className="absolute left-8 md:left-1/2 md:-translate-x-px top-4 bottom-4 w-px bg-border/40"
            ref={lineTrackRef}
          />

          {/* ── Fill line (scroll-driven) ── */}
          <div
            className="absolute left-8 md:left-1/2 md:-translate-x-px top-4 bottom-4 w-px origin-top"
            style={{
              background: 'linear-gradient(to bottom, #60a5fa, #34d399, #fbbf24)',
              transform: `scaleY(${progress})`,
              transition: 'transform 0.1s linear',
              boxShadow: progress > 0.05
                ? `0 0 8px 1px rgba(96,165,250,${progress * 0.6})`
                : 'none',
            }}
          />

          <div className="space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 1
              const isActive = activeStep >= index

              return (
                <div key={step.id} className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16">

                  {/* ── Timeline dot ── */}
                  <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center -translate-x-[7.5px] md:-translate-x-[8px] z-20">
                    <div
                      className={`
                        h-4 w-4 rounded-full border-2 bg-background z-10
                        transition-all duration-500
                        ${isActive
                          ? `${step.activeDot} shadow-[0_0_14px_4px] ${step.glowColor}`
                          : 'border-border'
                        }
                      `}
                    />
                  </div>

                  {/* ── Content ── */}
                  <div
                    className={`
                      w-full md:w-1/2 pl-20 md:pl-0
                      transition-all duration-700
                      ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'}
                      ${isEven ? 'md:order-2 md:pl-16' : 'md:text-right md:pr-16'}
                    `}
                  >
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

                  {/* ── Visual card ── */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:order-1 md:pr-16 md:flex md:justify-end' : 'md:pl-16'}`}>
                    <div
                      className={`
                        h-40 w-full max-w-sm rounded-xl border backdrop-blur-md
                        flex items-center justify-center relative overflow-hidden group mx-auto md:mx-0
                        transition-all duration-700
                        ${isActive ? `${step.borderColor} ${step.bgColor} opacity-100` : 'border-border/30 bg-muted/10 opacity-40'}
                      `}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Icon className={`h-16 w-16 ${isActive ? step.color : 'text-muted-foreground/30'} opacity-80 group-hover:scale-110 transition-all duration-500`} />
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
