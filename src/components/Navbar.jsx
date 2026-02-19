"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  // 👇 Add scroll effect (makes navbar feel premium)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <nav
          className={cn(
            "transition-all duration-300",
            "border border-border backdrop-blur-xl bg-background/4  0 shadow-lg",
            "px-6 h-16 flex items-center",
            scrolled ? "rounded-2xl" : "rounded-full",
          )}
        >
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-24 w-52  ">
              <Image
                src="/logo.png"
                alt="Rakshak AI"
                fill
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-10 mx-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* DESKTOP CTA */}
          <div className="hidden md:block">
            <Button asChild className="rounded-full px-6">
              <Link href="#get-started">Get Started</Link>
            </Button>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden ml-auto p-2 rounded-full hover:bg-muted transition"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* MOBILE MENU */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0",
          )}
        >
          <div className="rounded-2xl border border-border bg-background/80 backdrop-blur-xl shadow-lg p-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="py-2 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                {item.name}
              </Link>
            ))}

            <Button asChild className="rounded-full mt-2">
              <Link href="#get-started" onClick={() => setIsOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}