'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Shield } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: 'Intelligence Feed', href: '#features' },
      { label: 'Threat Engine', href: '#how-it-works' },
      { label: 'Pricing Hub', href: '#pricing' },
      { label: 'API Access', href: '#' },
    ],
    company: [
      { label: 'Our Mission', href: '#' },
      { label: 'Intel Blog', href: '#' },
      { label: 'Security Research', href: '#' },
      { label: 'Contact OPS', href: '#contact' },
    ],
    legal: [
      { label: 'Privacy Protocol', href: '#' },
      { label: 'Service Terms', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Responsible Disclosure', href: '#' },
    ],
  }

  return (
    <footer className="relative bg-[#020617] border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 pb-20">
          {/* Brand focus */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">RAKSHAK AI</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Pioneering proactive threat intelligence for the Indian enterprise. Neutralizing cyber risks before they manifest.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, href: '#' },
                { icon: Github, href: '#' },
                { icon: Linkedin, href: '#' }
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className="h-9 w-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom utility section */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-slate-600 font-medium">
            &copy; {currentYear} Rakshak Threat Intelligence Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-xs text-slate-600 hover:text-white transition-colors">Global Status</Link>
            <Link href="#" className="text-xs text-slate-600 hover:text-white transition-colors">Uptime: 99.98%</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
