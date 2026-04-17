import { Zap, ShieldCheck, Filter } from 'lucide-react'

export function AiRiskEngine() {
  return (
    <section className="py-24 bg-muted/20 relative border-t border-border/50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual Side */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
              <div className="text-center space-y-2 mb-8 pb-8 border-b border-border/50">
                <div className="text-sm font-medium text-muted-foreground">Unified Risk Score</div>
                <div className="text-7xl font-bold bg-gradient-to-br from-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
                  98<span className="text-4xl text-muted-foreground/50 font-normal">/100</span>
                </div>
                <div className="text-sm text-emerald-400 flex items-center justify-center gap-1 mt-2">
                  <ShieldCheck className="h-4 w-4" /> System Protected
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Social Signals</span>
                  <span className="font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Clean</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Domain Watch</span>
                  <span className="font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded">1 Lookalike</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email Threats</span>
                  <span className="font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">0 Blocked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-8 order-1 lg:order-2">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                One Unified Risk Score
              </h2>
              <p className="text-lg text-muted-foreground text-balance">
                Our AI Risk Engine aggregates data across all intelligence layers to give you a single, actionable score. Stop drowning in noise.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mt-1">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-foreground">Combine signals from all three layers</h4>
                  <p className="text-muted-foreground mt-1 text-balance">We correlate social chatter, domain registrations, and email activity to see the full picture.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1">
                  <Zap className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-foreground">Prioritize threats automatically</h4>
                  <p className="text-muted-foreground mt-1 text-balance">AI severity scoring ensures your team focuses on critical, imminent threats first.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mt-1">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-foreground">Reduce noise for security teams</h4>
                  <p className="text-muted-foreground mt-1 text-balance">Say goodbye to alert fatigue. We filter out false positives before they reach your dashboard.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
