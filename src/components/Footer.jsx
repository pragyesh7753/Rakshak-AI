import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'How it Works', href: '#how-it-works' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Security', href: '#' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#contact' },
    ],
    legal: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Compliance', href: '#' },
    ],
  }

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <div className="relative h-16 w-40">
                <Image src="/logo.png" alt="Rakshak AI" fill className="object-contain" />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your personal AI-powered cybersecurity assistant.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="py-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Rakshak AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.29 20a11.844 11.844 0 0011.843-11.844c0-.18 0-.36-.012-.538A8.505 8.505 0 0020 3.92a8.412 8.412 0 01-2.437.667A4.266 4.266 0 0019.54 2.74a8.514 8.514 0 01-2.702 1.032 4.261 4.261 0 00-7.377 3.889 12.088 12.088 0 01-8.77-4.442 4.266 4.266 0 001.32 5.686 4.245 4.245 0 01-1.932-.533v.053a4.265 4.265 0 003.42 4.179 4.251 4.251 0 01-1.927.073 4.267 4.267 0 003.985 2.963A8.547 8.547 0 010 18.272a12.052 12.052 0 008.29 3.06" />
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.186.092-.923.35-1.555.636-1.914-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817a9.568 9.568 0 012.502.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.192 20 14.44 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18.656 0H1.344C.6 0 0 .6 0 1.344v17.312C0 19.4.6 20 1.344 20h17.312c.744 0 1.344-.6 1.344-1.344V1.344C20 .6 19.4 0 18.656 0zM5.906 17.044H2.97V7.497h2.936v9.547zM4.438 6.198a1.704 1.704 0 110 -3.408 1.704 1.704 0 010 3.408zM17.044 17.044h-2.936v-4.64c0-1.107-.02-2.53-1.542-2.53-1.544 0-1.78 1.205-1.78 2.45v4.72h-2.936V7.497h2.82v1.304h.04c.392-.742 1.35-1.523 2.779-1.523 2.97 0 3.519 1.954 3.519 4.5v5.266z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
