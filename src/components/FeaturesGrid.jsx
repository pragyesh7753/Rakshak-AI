'use client'

import { Card } from '@/components/ui/card'
import {
  Key,
  Link as LinkIcon,
  BarChart3,
  Bell,
  GitBranch,
  Timer,
  Search,
  Activity,
  ShieldAlert
} from 'lucide-react'
import { motion } from 'framer-motion'

export function FeaturesGrid() {
  const features = [
    {
      icon: Key,
      title: 'Credential Intel',
      description: 'Real-time detection of usernames, passwords, and sensitive keys exposed in data breaches.',
    },
    {
      icon: LinkIcon,
      title: 'Phishing Guardian',
      description: 'Advanced heuristic analysis to identify and block malicious phishing infrastructure.',
    },
    {
      icon: Bell,
      title: 'Instant Alerts',
      description: 'Cloud-delivered notifications via Discord, Slack, or Email the moment a threat is spotted.',
    },
    {
      icon: GitBranch,
      title: 'Secret Scanning',
      description: 'Deep repo analysis to find accidentally committed secrets before they are exploited.',
    },
    {
      icon: BarChart3,
      title: 'Risk Posture',
      description: 'Comprehensive dashboarding to track your organizational security health over time.',
    },
    {
      icon: Timer,
      title: 'Incident Timeline',
      description: 'Audit-ready chronological history of every detection and neutralization event.',
    },
  ]

  return (
    <section id="features" className="relative py-24 md:py-32 bg-[#020617]">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight"
          >
            Built for <span className="text-blue-400 underline decoration-blue-500/30 underline-offset-8">Total Visibility.</span>
          </motion.h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A comprehensive suite of intelligence tools to monitor, detect, and respond to cyber threats in real-time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative p-8 bg-white/[0.02] border-white/5 backdrop-blur-3xl hover:bg-white/[0.05] transition-all duration-300 hover:border-blue-500/30 h-full">
                  <div className="flex flex-col gap-6">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                      <Icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 leading-relaxed text-sm">
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
