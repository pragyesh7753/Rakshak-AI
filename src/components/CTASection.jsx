'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function CTASection() {
  return (
    <section id="get-started" className="relative py-24 md:py-32 bg-[#020617] overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-16 text-center backdrop-blur-2xl shadow-2xl"
        >
          <div className="space-y-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
              <Zap className="h-4 w-4" />
              <span>Start Monitoring Today</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Stop reacting to attacks.
              <br />
              <span className="text-blue-500">Start detecting them early.</span>
            </h2>

            {/* Subheading */}
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Rakshak AI continuously monitors the internet to detect cyber
              threats targeting your organization and alerts you before
              attackers strike.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
              <Button asChild size="xl" className="h-16 px-10 bg-white text-[#020617] hover:bg-slate-200 rounded-xl font-semibold text-lg">
                <Link href="/register" className="flex items-center">
                  Start Monitoring Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="xl" className="h-16 px-10 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-lg">
                <Link href="#demo">
                  View Demo
                </Link>
              </Button>
            </div>

            {/* trust bullets */}
            <div className="pt-10 border-t border-white/5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                '24/7 Threat Monitoring',
                'AI Threat Intelligence',
                'Real-time Alerts'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{item}</span>
                </div>
              ))}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
