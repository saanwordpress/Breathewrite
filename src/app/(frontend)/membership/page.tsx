import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { MEMBERSHIP_PERKS, MEMBERSHIP_PRICE_GBP } from '@/lib/membership'

const FEATURES = [...MEMBERSHIP_PERKS, 'Ongoing monthly membership. Cancel with one month’s notice.']

export default function MembershipPage() {
  return (
    <div className="flex flex-col w-full bg-background pt-12 pb-24">
      {/* Hero */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-heading mb-6">The Breathwork Membership</h1>
          <p className="text-xl font-light text-primary-foreground/80 max-w-2xl mx-auto">
            A sanctuary for consistent practice. Join to take unlimited live online group classes every month, with 20% off private classes and online courses.
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-primary h-1/2 z-0" />
        <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-2xl">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading mb-4 text-foreground">Monthly Membership</h2>
              <div className="flex items-end justify-center gap-2 text-foreground">
                <span className="text-6xl font-medium">£{MEMBERSHIP_PRICE_GBP}</span>
                <span className="text-foreground/60 mb-2">/ month</span>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/80 font-light leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            <Button asChild size="lg" className="w-full rounded-full py-6 text-lg">
              <Link href="/book?membership=true">Become a Member</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-6 font-light">
              You&rsquo;ll create an account first. Secure payment via Mollie. Cancel from your member dashboard with one month&rsquo;s notice.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ specific to membership */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <h2 className="text-4xl font-heading mb-12">Membership Questions</h2>
          <div className="space-y-8 text-left">
            <div className="bg-muted/30 p-8 rounded-2xl">
              <h3 className="text-xl font-medium mb-3">How do I book classes as a member?</h3>
              <p className="font-light text-foreground/80 leading-relaxed">Once you are a member, you simply log into your dashboard, select the online class you want to attend, and click "Reserve My Spot". Online group classes are included at no extra charge.</p>
            </div>
            <div className="bg-muted/30 p-8 rounded-2xl">
              <h3 className="text-xl font-medium mb-3">How does cancelling work?</h3>
              <p className="font-light text-foreground/80 leading-relaxed">Cancel from your member dashboard at any time with one month&rsquo;s notice. Your next monthly payment is still taken, your membership and discounts continue until a month after it, and nothing is charged after that.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
