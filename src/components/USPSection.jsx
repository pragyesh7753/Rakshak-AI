'use client'

import { Card } from '@/components/ui/card'
import { Map, Zap, Inbox, Brain, Sparkles, Target, BarChart, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export function USPSection() {
  const features = [
    {
      icon: Target,
      title: 'Precision Exposure Mapping',
      description: 'Visualize your entire digital footprint across the web. See exactly where your data appears and what\'s at risk with granular detail.',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      icon: Sparkles,
      title: 'Predictive Threat Intel',
      description: 'Advanced AI models forecast potential attacks before they materialize based on emerging underground patterns.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      icon: BarChart,
      title: 'Security Orchestration',
      description: 'Manage all your security alerts, incidents, and remediation tasks in one intelligent, unified workspace.',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      icon: Brain,
      title: 'Contextual AI Insights',
      description: 'No more cryptic logs. Our AI explains each finding in plain language with business impact and context.',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
  ]

  return (
    <section className="relative py-24 md:py-32 bg-[#020617] overflow-hidden border-t border-white/5">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs text-blue-400 font-bold uppercase tracking-widest mb-6"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>The Rakshak Edge</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight"
          >
            Smarter Intelligence. <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Better Protection.</span>
          </motion.h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Go beyond basic monitoring with advanced features designed for modern threat hunters.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group relative p-10 bg-white/[0.02] border-white/5 backdrop-blur-3xl hover:bg-white/[0.04] transition-all duration-500 hover:border-blue-500/20 overflow-hidden h-full ring-1 ring-white/5">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="flex gap-8 relative z-10">
                    <div className={`shrink-0 h-16 w-16 rounded-2xl ${feature.bg} flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-500`}>
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
