'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-primary">
              Rakshak AI
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-foreground hover:text-primary transition-colors">
              How it Works
            </Link>
            <Link href="#pricing" className="text-sm text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#contact" className="text-sm text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Button asChild className="ml-4 bg-primary hover:bg-primary/90">
              <Link href="#get-started">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="#features"
              className="block px-3 py-2 rounded-md text-base text-foreground hover:bg-muted"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="block px-3 py-2 rounded-md text-base text-foreground hover:bg-muted"
            >
              How it Works
            </Link>
            <Link
              href="#pricing"
              className="block px-3 py-2 rounded-md text-base text-foreground hover:bg-muted"
            >
              Pricing
            </Link>
            <Link
              href="#contact"
              className="block px-3 py-2 rounded-md text-base text-foreground hover:bg-muted"
            >
              Contact
            </Link>
            <Button asChild className="w-full mt-2 bg-primary hover:bg-primary/90">
              <Link href="#get-started">Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
