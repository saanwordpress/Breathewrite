import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wind, Brain, Heart, Sparkles } from 'lucide-react'

const BENEFITS = [
  {
    title: 'Nervous System Regulation',
    description: 'Learn to shift from fight-or-flight into deep rest and restoration.',
    icon: Wind,
  },
  {
    title: 'Emotional Healing',
    description: 'Process stored emotions safely through guided breathwork techniques.',
    icon: Heart,
  },
  {
    title: 'Mental Clarity',
    description: 'Clear the mental fog and reconnect with your inner intuition.',
    icon: Brain,
  },
  {
    title: 'Creativity Awakens',
    description: 'Unlock creative flow by bypassing the analytical mind.',
    icon: Sparkles,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Placeholder for large calming photography */}
        <div className="absolute inset-0 z-0 bg-secondary/10" />
        <div className="container relative z-10 mx-auto px-6 md:px-12 py-24 text-center max-w-4xl">
          <span className="text-accent uppercase tracking-[0.2em] text-sm font-semibold mb-6 block">
            Breathe Write
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading mb-8 leading-tight">
            Take A Breath.
          </h1>
          <p className="text-xl md:text-2xl font-light text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            A safe space where people disconnect from the noise of everyday life and reconnect with their intuition, creativity and inner calm.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto">
              <Link href="/book">
                Book Your First Session
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/membership">Explore Membership</Link>
            </Button>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm font-light text-foreground/60">
            <span>Certified Facilitator</span>
            <span className="hidden sm:inline">•</span>
            <span>20+ Years Experience</span>
            <span className="hidden sm:inline">•</span>
            <span>Hundreds of Guided Sessions</span>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="aspect-[4/5] bg-muted rounded-2xl relative overflow-hidden">
               {/* Placeholder for Rosalind's Photo */}
               <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-light">
                 Image: Rosalind in Morning Light
               </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-heading leading-tight">
                Healing begins. <br />
                <span className="text-secondary">Creativity awakens.</span>
              </h2>
              <div className="space-y-4 text-lg font-light text-foreground/80 leading-relaxed">
                <p>
                  After burnout, grief, and personal loss, Rosalind discovered Neurodynamic Breathwork. It became the anchor that allowed her to process what words could not.
                </p>
                <p>
                  With over 20 years in Film & TV as a writer and script development consultant, she now guides others to find their own stillness. Every breath becomes an invitation to surrender. Insight arrives. Peace becomes possible.
                </p>
              </div>
              <Button asChild variant="link" className="px-0 text-lg text-accent hover:text-primary transition-colors">
                <Link href="/about">Read Rosalind's Story &rarr;</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* HEALTH BENEFITS */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-heading mb-16">The Science of Breath</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon
              return (
                <div key={idx} className="bg-primary-foreground/5 p-8 rounded-3xl border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors text-left">
                  <div className="w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">{benefit.title}</h3>
                  <p className="text-primary-foreground/70 font-light leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FEATURED CLASSES / OFFERINGS */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="text-4xl md:text-5xl font-heading">Our Offerings</h2>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/offerings">View All Offerings</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mock Offering Cards */}
            {[
              { title: 'Breathe & Flow', time: '60 Mins', type: 'Online Group', image: '/offerings/breathe-and-flow.jpg', slug: 'breathe-and-flow' },
              { title: 'Neurodynamic Breathwork', time: '120 Mins', type: 'Online Group', image: '/offerings/neurodynamic-breathwork.jpg', slug: 'neurodynamic-breathwork' },
              { title: 'Private 1:1 Session | 60 mins', time: '60 Mins', type: 'Online Private', image: '/offerings/breathe-and-go.jpg', slug: 'private-11-online-session-60-mins' }
            ].map((offering, idx) => (
              <div key={idx} className="group relative rounded-3xl overflow-hidden border border-border bg-card p-1 flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
                <Link href={`/offerings/${offering.slug}`} className="block absolute inset-0 z-10">
                  <span className="sr-only">View {offering.title}</span>
                </Link>
                <div className="aspect-[4/3] bg-muted rounded-2xl mb-6 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={offering.image} alt={offering.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>
                <div className="px-6 pb-8 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-heading">{offering.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-light mb-6 flex-grow">
                    <span>{offering.time}</span>
                    <span>•</span>
                    <span>{offering.type}</span>
                  </div>
                  <Button asChild className="w-full rounded-full relative z-20">
                    <Link href="/book">View Schedule</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-secondary text-secondary-foreground text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <h2 className="text-5xl md:text-6xl font-heading mb-8">Ready to take a breath?</h2>
          <p className="text-xl font-light mb-12 text-secondary-foreground/80">
            Join our community and discover the transformative power of your own breath.
          </p>
          <Button asChild size="lg" className="rounded-full px-12 py-6 text-lg bg-background text-foreground hover:bg-accent hover:text-accent-foreground">
            <Link href="/book">Book Your First Session</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
