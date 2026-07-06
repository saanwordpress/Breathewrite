import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const FEATURES = [
  'Unlimited access to all Online Group Sessions',
  'Exclusive member-only recordings library',
  'Priority booking for special events & retreats',
  '20% discount on Private 1:1 Sessions',
  'Access to the private community dashboard',
  'Cancel anytime. No lock-in contracts.',
]

export default function MembershipPage() {
  return (
    <div className="flex flex-col w-full bg-background pt-12 pb-24">
      {/* Hero */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-heading mb-6">The Breathwork Membership</h1>
          <p className="text-xl font-light text-primary-foreground/80 max-w-2xl mx-auto">
            A sanctuary for consistent practice. Join our community to access unlimited live sessions, on-demand recordings, and deeper healing.
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
                <span className="text-6xl font-medium">$45</span>
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
              Secure payment via Stripe. Cancel your subscription anytime from your member dashboard.
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
              <p className="font-light text-foreground/80 leading-relaxed">Once you are a member, you simply log into your dashboard, select the class you want to attend, and click "Reserve My Spot". You will not be charged again.</p>
            </div>
            <div className="bg-muted/30 p-8 rounded-2xl">
              <h3 className="text-xl font-medium mb-3">Can I cancel anytime?</h3>
              <p className="font-light text-foreground/80 leading-relaxed">Yes, you have full control over your subscription through the Stripe Customer Portal in your dashboard. You can cancel or pause with one click.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
