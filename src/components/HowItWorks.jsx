'use client'

import { Card } from '@/components/ui/card'
import { Waves, Brain, AlertCircle, Bell, Search, Activity, Cpu, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Global Ingestion',
      description: 'Our collectors continuously crawl millions of public data points across Reddit, GitHub, and dark web forums.',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      number: '02',
      icon: Brain,
      title: 'Neural Filtering',
      description: 'Custom AI models filter 99.9% of noise, identifying specific threats targeting Indian infrastructure.',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      number: '03',
      icon: Cpu,
      title: 'Risk Scoring',
      description: 'Each detection is analyzed for impact and assigned a prioritized risk score based on severity.',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      number: '04',
      icon: ShieldCheck,
      title: 'Instant Containment',
      description: 'Receive real-time alerts with actionable remediation steps to neutralize threads before impact.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
  ]

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 bg-[#020617] border-y border-white/5">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0f172a]/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            The Intelligence <span className="text-blue-400">Engine</span>
          </motion.h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Our automated pipeline transforms massive amounts of public data into actionable security intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative z-10"
              >
                <div className="group flex flex-col items-center text-center space-y-6">
                  {/* Step Bubble */}
                  <div className="relative">
                    <div className={`h-20 w-20 rounded-full ${step.bg} border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-500 shadow-xl backdrop-blur-md`}>
                      <Icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    {/* Number label */}
                    <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-white text-[#020617] flex items-center justify-center text-[10px] font-black shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-wider">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
