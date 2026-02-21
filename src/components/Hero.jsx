'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-background via-background to-muted/30 pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary font-medium">
                <Shield className="h-4 w-4" />
                <span>4-Layer AI-Powered Detection</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight text-foreground">
                Detect Cyber Threats
                <span className="block bg-linear-to-r from-primary via-secondary to-primary/80 bg-clip-text text-transparent">
                  Before They Strike
                </span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed text-balance">
                Real-time OSINT monitoring for SMBs. Rakshak AI scans Reddit, GitHub, and the dark web for leaked credentials, API keys, and vulnerabilities targeting your business.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/register" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Continuous Scanning</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">4-Layer</div>
                <div className="text-sm text-muted-foreground">AI Pipeline</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">&lt;5min</div>
                <div className="text-sm text-muted-foreground">Setup Time</div>
              </div>
            </div>
          </div>

          {/* Right column - Dashboard Preview */}
          <div className="relative hidden md:block">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-secondary/20 blur-3xl rounded-2xl" />

              {/* Dashboard mockup */}
              <div className="relative bg-card rounded-2xl border border-border p-8 shadow-2xl">
                <div className="space-y-4">
                  {/* Dashboard header */}
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Security Dashboard</h3>
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  </div>

                  {/* Security Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Security Score</span>
                      <span className="font-bold text-lg text-primary">8.9/10</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[89%] bg-linear-to-r from-primary to-secondary rounded-full" />
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="space-y-2 pt-4">
                    <p className="text-sm font-medium text-foreground">Recent Alerts</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                        <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <div className="text-xs text-muted-foreground">Admin access offer detected</div>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                        <div className="text-xs text-muted-foreground">SSL certificate expiring soon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
