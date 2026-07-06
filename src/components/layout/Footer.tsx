import Link from 'next/link'
import { Camera, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="font-heading text-3xl font-semibold tracking-wide block">
            Breathe Write
          </Link>
          <p className="text-primary-foreground/80 max-w-sm text-lg font-light leading-relaxed">
            Take A Breath. Reconnect with your intuition, creativity and inner calm through breathwork.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-colors">
              <Camera className="w-5 h-5" />
            </a>
            <a href="mailto:hello@breathewrite.com" className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-heading text-xl mb-6 text-accent">Explore</h3>
          <ul className="space-y-4 font-light">
            <li>
              <Link href="/offerings" className="hover:text-accent transition-colors">Offerings</Link>
            </li>
            <li>
              <Link href="/calendar" className="hover:text-accent transition-colors">Calendar</Link>
            </li>
            <li>
              <Link href="/membership" className="hover:text-accent transition-colors">Membership</Link>
            </li>
            <li>
              <Link href="/journal" className="hover:text-accent transition-colors">Journal</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-accent transition-colors">About Rosalind</Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-heading text-xl mb-6 text-accent">Legal</h3>
          <ul className="space-y-4 font-light text-primary-foreground/70">
            <li>
              <Link href="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
            </li>
            <li>
              <Link href="/refunds" className="hover:text-primary-foreground transition-colors">Refund Policy</Link>
            </li>
            <li>
              <Link href="/accessibility" className="hover:text-primary-foreground transition-colors">Accessibility</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-primary-foreground/10 text-center text-primary-foreground/50 text-sm">
        © {new Date().getFullYear()} Breathe Write. All rights reserved.
      </div>
    </footer>
  )
}
