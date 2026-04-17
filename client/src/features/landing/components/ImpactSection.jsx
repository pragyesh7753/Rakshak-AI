import { Globe2 } from 'lucide-react'

export function ImpactSection() {
  return (
    <section className="py-24 bg-background relative border-t border-border/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background pointer-events-none" />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-2">
          <Globe2 className="h-10 w-10 text-blue-400" />
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold text-foreground text-balance">
          Building Safer Digital Infrastructure
        </h2>
        
        <div className="inline-block border border-border/50 bg-muted/50 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-medium text-muted-foreground">
          Aligned with UN Sustainable Development Goal 9
        </div>

        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
          Rakshak AI helps organizations strengthen their digital resilience and secure global innovation ecosystems, contributing to a safer, more sustainable technological future for everyone.
        </p>
      </div>
    </section>
  )
}
