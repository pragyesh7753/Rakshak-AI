'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldAlert, Zap, Globe, Lock, Bell, Search, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggeredContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#020617] pt-28 pb-24 md:pt-32 md:pb-40">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE CONTENT */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggeredContainer}
            className="flex flex-col space-y-10"
          >
            <motion.div variants={fadeIn} className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-sm md:text-base text-blue-400 font-medium backdrop-blur-md">
                <ShieldAlert className="h-4 w-4 animate-pulse" />
                <span>Next-Gen AI Threat Intelligence</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                Neutralize Threats
                <span className="block mt-2 bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent italic">
                  Before Impact.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
                Rakshak AI scans the deep web, social forums, and code repositories
                to safeguard Indian enterprises from data leaks and coordinated cyber strikes.
              </p>
            </motion.div>

            {/* CTA BUTTONS */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5">
              <Button asChild size="xl" className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 text-lg">
                <Link href="/register" className="group">
                  Start Free Shield
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="xl" className="h-14 px-8 border-slate-700 hover:bg-slate-800/50 text-slate-300 rounded-xl backdrop-blur-sm text-lg transition-all">
                <Link href="#demo" className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  View Live Demo
                </Link>
              </Button>
            </motion.div>

            {/* TRUST INDICATORS */}
            <motion.div variants={fadeIn} className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-800/50 max-w-md">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-2xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">24/7</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Probing</div>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-2xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">99.9%</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">SLA Accuracy</div>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-2xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">10ms</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Alert Latency</div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: INTERACTIVE DASHBOARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Ambient glow behind card */}
            <div className="absolute -inset-4 bg-linear-to-tr from-blue-500/20 to-emerald-500/20 blur-3xl opacity-50 rounded-[2rem]" />

            <div className="relative group">
              {/* Main Dashboard Card */}
              <div className="relative bg-[#0f172a]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl overflow-hidden ring-1 ring-white/5 transition-all duration-500 hover:border-blue-500/30">
                {/* Dashboard Header */}
                <div className="flex items-center justify-betwe en mb-8 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Lock className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold leading-none">Security Center</h3>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Enterprise Instance #402</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">System Nominal</span>
                  </div>
                </div>

                {/* Threat Indicators */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:bg-white/10 transition-colors">
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Critical Scans</p>
                    <p className="text-2xl font-mono text-white">1,204</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:bg-white/10 transition-colors">
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Neutralized</p>
                    <p className="text-2xl font-mono text-emerald-400">892</p>
                  </div>
                </div>

                {/* Threat Feed */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Live Intel Feed</p>
                    <div className="text-[10px] text-blue-400 hover:underline cursor-pointer">Analyze all</div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: Bell, color: 'text-red-400', bg: 'bg-red-400/10', text: 'Credential dump detected on dark forum', time: '2m' },
                      { icon: Search, color: 'text-amber-400', bg: 'bg-amber-400/10', text: 'Unusual crawling activity on API origin', time: '14m' },
                      { icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10', text: 'Domain spoofing attempt blocked', time: '1h' },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 group/item cursor-pointer"
                      >
                        <div className={`p-2 rounded-lg ${item.bg}`}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 truncate font-medium">{item.text}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bottom decorative bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-transparent opacity-50" />
              </div>

              {/* Floaties / Decor */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hidden xl:flex items-center gap-3"
              >
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 leading-none">AI Throughput</p>
                  <p className="text-sm font-bold text-white">4.2 TB/s</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
