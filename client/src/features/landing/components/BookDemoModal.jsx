import { useState } from 'react'
import { X, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '500+']
const USE_CASES = ['Threat Detection', 'Incident Response', 'Compliance & Audit', 'Vulnerability Management', 'Other']

export function BookDemoModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    size: '',
    useCase: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!open) return null

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate async submission
    await new Promise((r) => setTimeout(r, 1800))
    setLoading(false)
    setSubmitted(true)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', email: '', company: '', size: '', useCase: '', message: '' })
    }, 300)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        style={{ animation: 'slideUp 0.25s ease' }}
      >
        <div className="relative w-full max-w-lg rounded-3xl border border-border/60 bg-card/90 backdrop-blur-2xl shadow-2xl overflow-hidden">

          {/* Top glow accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-48 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="p-8">
            {submitted ? (
              /* ── Success State ── */
              <div className="flex flex-col items-center text-center py-8 gap-5">
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
                  <CheckCircle className="text-primary" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">You're on the list!</h3>
                  <p className="text-muted-foreground">
                    Thanks, <span className="text-foreground font-medium">{form.name}</span>. Our team will reach out to{' '}
                    <span className="text-foreground font-medium">{form.email}</span> within 24 hours to schedule your demo.
                  </p>
                </div>
                <Button onClick={handleClose} className="rounded-full px-8 mt-2">
                  Close
                </Button>
              </div>
            ) : (
              /* ── Form State ── */
              <>
                <div className="mb-7">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Book a Demo</h2>
                  <p className="text-sm text-muted-foreground">
                    See Rakshak AI in action. Fill in your details and we'll set up a personalised walkthrough.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Jane Smith"
                        className="h-10 px-3 rounded-xl border border-border bg-input/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Work Email <span className="text-destructive">*</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="jane@company.com"
                        className="h-10 px-3 rounded-xl border border-border bg-input/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>
                  </div>

                  {/* Company + Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Company <span className="text-destructive">*</span>
                      </label>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        required
                        placeholder="Acme Corp"
                        className="h-10 px-3 rounded-xl border border-border bg-input/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Company Size
                      </label>
                      <select
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        className="h-10 px-3 rounded-xl border border-border bg-input/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      >
                        <option value="">Select…</option>
                        {COMPANY_SIZES.map((s) => (
                          <option key={s} value={s}>{s} employees</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Use Case */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Primary Use Case
                    </label>
                    <select
                      name="useCase"
                      value={form.useCase}
                      onChange={handleChange}
                      className="h-10 px-3 rounded-xl border border-border bg-input/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    >
                      <option value="">Select…</option>
                      {USE_CASES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Anything else?
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tell us about your security challenges…"
                      className="px-3 py-2.5 rounded-xl border border-border bg-input/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full rounded-full h-12 font-semibold text-base mt-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Request Demo <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </>
  )
}
