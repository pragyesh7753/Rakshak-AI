import { Card } from '@/components/ui/card'
import { Activity, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'

export function DashboardPreview() {
  return (
    <section id="demo" className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Intelligent Threat Intelligence Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            A unified dashboard to monitor, analyze, and respond to cyber threats in real-time.
          </p>
        </div>

        <div className="relative">
          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 blur-3xl rounded-3xl" />
          
          {/* Dashboard mockup */}
          <div className="relative bg-card rounded-3xl border border-border overflow-hidden shadow-2xl">
            <div className="p-8 md:p-12">
              {/* Dashboard header */}
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-border">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Security Dashboard</h3>
                  <p className="text-sm text-muted-foreground mt-1">Real-time threat monitoring & analysis</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">All systems secure</span>
                </div>
              </div>

              {/* Dashboard grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Security Score Card */}
                <Card className="p-6 border-border bg-background">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Security Score</p>
                      <h4 className="text-3xl font-bold text-foreground">8.9<span className="text-lg text-muted-foreground">/10</span></h4>
                    </div>
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-medium">89%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[89%] bg-gradient-to-r from-primary to-secondary rounded-full" />
                    </div>
                  </div>
                </Card>

                {/* Threats Overview Card */}
                <Card className="p-6 border-border bg-background">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Active Threats</p>
                      <h4 className="text-3xl font-bold text-foreground">2<span className="text-lg text-muted-foreground"> found</span></h4>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">1 requires action, 1 under monitoring</p>
                </Card>
              </div>

              {/* Alerts list */}
              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">Credential exposed on Reddit</p>
                    <p className="text-xs text-muted-foreground mt-1">Your email was mentioned in a public forum discussing data leaks. Review and change password if needed.</p>
                  </div>
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 whitespace-nowrap">2h ago</span>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">GitHub secret scan completed</p>
                    <p className="text-xs text-muted-foreground mt-1">Scanned 45 repositories. No secrets found. Status: All clear.</p>
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">1h ago</span>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">Previous threat resolved</p>
                    <p className="text-xs text-muted-foreground mt-1">Password changed and verified. No further exposure detected.</p>
                  </div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 whitespace-nowrap">5h ago</span>
                </div>
              </div>

              {/* Analytics placeholder */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">Threat Trends</h4>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="h-24 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="flex items-end gap-1 h-16 w-full px-4">
                    {[0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.7].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t opacity-60 hover:opacity-100 transition-opacity"
                        style={{ height: `${height * 100}%` }}
                      />
                    ))}
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
