'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button, buttonVariants } from '../ui/button'

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Offerings', href: '/offerings' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Membership', href: '/membership' },
  { name: 'Testimonials', href: '/testimonials' },
  { name: 'Journal', href: '/journal' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-heading text-2xl font-semibold tracking-wide text-primary">
          Breathe Write
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm tracking-wide transition-colors hover:text-accent ${
                pathname === link.href ? 'text-primary font-medium' : 'text-secondary'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-primary hover:text-accent transition-colors">
            Login
          </Link>
          <Link href="/book" className={buttonVariants({ className: "rounded-full px-6 py-5 text-sm tracking-wide" })}>
            Book Session
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-primary p-2"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[#F9F8F6] flex flex-col pt-6 px-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-12">
              <Link href="/" className="font-heading text-2xl font-semibold tracking-wide text-primary">
                Breathe Write
              </Link>
              <button
                className="text-primary p-2"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-2xl font-heading text-primary"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px w-full bg-border my-4" />
              <Link href="/login" className="text-xl font-heading text-secondary">
                Login
              </Link>
              <Link href="/book" className={buttonVariants({ className: "rounded-full w-full py-6 text-lg mt-4" })}>
                Book Session
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
