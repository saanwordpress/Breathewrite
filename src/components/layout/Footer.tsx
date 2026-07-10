import Link from 'next/link'
import { Camera, Mail, ArrowRight } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background ambient light effect for a premium feel */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      {/* Newsletter Section */}
      <div className="relative border-b border-primary-foreground/10 z-10">
        <div className="container mx-auto px-6 md:px-12 py-24 md:py-32 flex flex-col lg:flex-row lg:items-center justify-between gap-16">
          <div className="max-w-2xl group cursor-default">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold tracking-wide mb-6">
              Be the first to hear
            </h2>
            <p className="text-xl md:text-2xl font-light text-primary-foreground/80 leading-relaxed mb-8 flex items-center flex-wrap gap-2">
              Join our newsletter to be the first to hear about workshops, special events and new offerings
              <ArrowRight className="w-6 h-6 inline-block group-hover:translate-x-2 transition-transform duration-300 text-accent" />
            </p>
            <p className="text-base text-primary-foreground/50 font-light max-w-lg leading-relaxed">
              For all enquiries or to book a free 15 minute discovery call, please email Rosalind at <a href="mailto:info@breathewrite.co.uk" className="text-accent hover:text-accent/80 transition-colors border-b border-accent/30 hover:border-accent">info@breathewrite.co.uk</a>
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[450px]">
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-grow group">
                <Input 
                  type="email" 
                  placeholder="Email address..." 
                  className="w-full h-14 bg-primary-foreground/5 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 rounded-full px-6 focus-visible:ring-accent focus-visible:border-accent text-lg transition-all group-hover:bg-primary-foreground/10"
                  required
                />
              </div>
              <Button type="submit" className="h-14 rounded-full px-8 bg-accent text-primary font-medium hover:bg-accent/90 text-lg transition-all shadow-lg shadow-accent/10 hover:shadow-accent/25 hover:-translate-y-0.5">
                Subscribe
              </Button>
            </form>
            <p className="text-sm text-primary-foreground/40 mt-4 font-light text-center sm:text-left">
              Join our growing community. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="relative container mx-auto px-6 md:px-12 py-20 grid grid-cols-1 md:grid-cols-4 gap-12 z-10">
        {/* Brand */}
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="font-heading text-3xl font-semibold tracking-wide block hover:opacity-80 transition-opacity">
            Breathe Write
          </Link>
          <p className="text-primary-foreground/70 max-w-sm text-lg font-light leading-relaxed">
            Take A Breath. Reconnect with your intuition, creativity and inner calm through breathwork.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-3 bg-primary-foreground/5 rounded-full hover:bg-accent hover:text-primary transition-all duration-300 group">
              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
            <a href="mailto:info@breathewrite.co.uk" className="p-3 bg-primary-foreground/5 rounded-full hover:bg-accent hover:text-primary transition-all duration-300 group">
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-heading text-xl mb-8 text-accent">Explore</h3>
          <ul className="space-y-4 font-light text-[15px]">
            <li>
              <Link href="/offerings" className="text-primary-foreground/70 hover:text-accent transition-colors">Offerings</Link>
            </li>
            <li>
              <Link href="/calendar" className="text-primary-foreground/70 hover:text-accent transition-colors">Calendar</Link>
            </li>
            <li>
              <Link href="/membership" className="text-primary-foreground/70 hover:text-accent transition-colors">Membership</Link>
            </li>
            <li>
              <Link href="/journal" className="text-primary-foreground/70 hover:text-accent transition-colors">Journal</Link>
            </li>
            <li>
              <Link href="/about" className="text-primary-foreground/70 hover:text-accent transition-colors">About Rosalind</Link>
            </li>
            <li>
              <Link href="/testimonials" className="text-primary-foreground/70 hover:text-accent transition-colors">Testimonials</Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-heading text-xl mb-8 text-accent">Legal</h3>
          <ul className="space-y-4 font-light text-[15px]">
            <li>
              <Link href="/privacy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Terms of Service</Link>
            </li>
            <li>
              <Link href="/refunds" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Refund Policy</Link>
            </li>
            <li>
              <Link href="/accessibility" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Accessibility</Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="relative container mx-auto px-6 md:px-12 mt-4 pb-12 text-center md:text-left md:flex md:justify-between md:items-center text-primary-foreground/40 text-sm font-light z-10">
        <p>© {new Date().getFullYear()} Breathe Write. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Designed with intention.</p>
      </div>
    </footer>
  )
}
