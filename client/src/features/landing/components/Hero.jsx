import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldAlert, Activity } from 'lucide-react'
import { BookDemoModal } from './BookDemoModal'

export function Hero() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      <section className="relative overflow-hidden bg-background pt-24 pb-20 md:pt-36 md:pb-32">
      {/* Cyber gradient background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-blue-500/30 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <div className="flex flex-col space-y-8 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-muted-foreground w-fit mx-auto lg:mx-0 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Proactive Cyber Intelligence Platform
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
              Detect Cyber Threats <br/>
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Before They Reach You
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Rakshak AI continuously monitors the internet — from social signals to phishing emails — to stop attacks early.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-12 px-8 font-medium">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                onClick={() => setDemoOpen(true)}
                variant="outline"
                size="lg"
                className="rounded-full h-12 px-8 font-medium border-border hover:text-foreground backdrop-blur-sm"
              >
                Request Demo
              </Button>
            </div>
          </div>

          {/* Premium Visual / Mockup */}
          <div className="relative hidden lg:block z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 blur-3xl rounded-full" />
            <div className="relative rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3 bg-muted/20">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-auto flex h-6 w-1/2 items-center justify-center rounded-md bg-muted/40 text-[10px] text-muted-foreground font-mono">
                  app.rakshakai.com
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Global Threat Surface</div>
                    <div className="text-2xl font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-emerald-400" /> Scanning Active
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                </div>

                <div className="space-y-3">
                  {[
                    { title: "Suspicious Domain Registered", time: "2 min ago", type: "Domain", color: "text-amber-400", bg: "bg-amber-400/10" },
                    { title: "Dark Web Mention Detected", time: "15 min ago", type: "Social", color: "text-rose-400", bg: "bg-rose-400/10" },
                    { title: "Lookalike Email Blocked", time: "1 hr ago", type: "Email", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors cursor-default">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${alert.bg}`}>
                          <ShieldAlert className={`h-4 w-4 ${alert.color}`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{alert.title}</div>
                          <div className="text-xs text-muted-foreground">{alert.time} • {alert.type} Intel</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground px-2 py-1 rounded-full border border-border/50 bg-muted/30">Action Required</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
    </>
  )
}
