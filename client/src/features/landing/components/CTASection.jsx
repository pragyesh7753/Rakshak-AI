import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { BookDemoModal } from './BookDemoModal'

export function CTASection() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />

      <section id="contact" className="py-24 relative overflow-hidden bg-background border-t border-border/50">
        {/* Background glow */}
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Be Proactive. <br className="hidden sm:block"/>
            <span className="text-muted-foreground">Not Reactive.</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop waiting for the breach. Join the next generation of proactive security teams today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full h-14 px-8 font-medium text-lg">
              <Link to="/register">
                Start Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              onClick={() => setDemoOpen(true)}
              variant="outline"
              size="lg"
              className="rounded-full h-14 px-8 font-medium text-lg border-border hover:bg-muted/50 backdrop-blur-sm"
            >
              Book Demo
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
