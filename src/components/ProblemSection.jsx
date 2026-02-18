'use client'

import { Card } from '@/components/ui/card'
import { AlertTriangle, Zap, Eye, ShieldX, Fingerprint, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export function ProblemSection() {
  const problems = [
    {
      icon: Fingerprint,
      title: 'Digital Identity Leaks',
      description: 'Millions of Indian credentials are leaked daily across public sources like Reddit, GitHub, and dark web forums.',
      color: 'text-red-400',
      bg: 'bg-red-400/10'
    },
    {
      icon: Zap,
      title: 'Immediate Exposure',
      description: 'Passwords, API keys, and sensitive financial data are often compromised for months before discovery.',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      icon: Eye,
      title: 'Public Attack Planning',
      description: 'Threat actors openly discuss vulnerabilities in Indian organizational infrastructure on social platforms.',
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
  ]

  return (
    <section className="relative py-24 md:py-32 bg-[#020617] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-600/5 blur-[100px] rounded-full" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1.5 text-sm text-red-400 font-medium mb-6"
          >
            <ShieldX className="h-4 w-4" />
            <span>The Silent Crisis</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Traditional Security is <span className="text-red-500">Failing.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            While you secure your firewall, your sensitive data is being discussed and traded in open forums.
            You can't protect what you aren't monitoring.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group relative p-8 bg-white/[0.02] border-white/5 backdrop-blur-xl hover:bg-white/[0.04] transition-all duration-500 hover:border-red-500/30 overflow-hidden h-full">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col gap-6 relative z-10">
                    <div className={`h-14 w-14 rounded-2xl ${problem.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className={`h-7 w-7 ${problem.color}`} />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors uppercase tracking-tight">
                        {problem.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {problem.description}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-red-500/50 transition-colors">
                      <Lock className="h-3 w-3" />
                      Status: Critical
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
