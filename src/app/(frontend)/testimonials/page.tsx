import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TESTIMONIALS } from './data'
import { FeaturedTestimonial } from './components/FeaturedTestimonial'
import { TestimonialCarousel } from './components/TestimonialCarousel'
import { VideoTestimonials } from './components/VideoTestimonials'
import { SocialProofStats } from './components/SocialProofStats'
import { SuccessStoryTimeline } from './components/SuccessStoryTimeline'
import { MemberStories } from './components/MemberStories'
import { FloatingQuote } from './components/FloatingQuote'

export default function TestimonialsPage() {
  const featuredTestimonial = TESTIMONIALS[0]
  const remainingTestimonials = TESTIMONIALS.slice(1)

  return (
    <div className="flex flex-col w-full bg-background selection:bg-accent/20">
      {/* HERO SECTION */}
      <section className="pt-32 pb-16 text-center px-6">
        <div className="container mx-auto max-w-3xl">
          <span className="text-accent uppercase tracking-[0.2em] text-sm font-semibold mb-6 block">
            Loved by Our Community
          </span>
          <h1 className="text-5xl md:text-7xl font-heading mb-6 leading-tight text-primary">
            Every breath tells a story.
          </h1>
          <p className="text-xl font-light text-foreground/70 max-w-2xl mx-auto">
            Discover how our community is finding calm, clarity, and creative breakthroughs through the power of guided breathwork.
          </p>
        </div>
      </section>

      <FeaturedTestimonial 
        quote={featuredTestimonial.quote}
        name={featuredTestimonial.name}
        role={featuredTestimonial.role}
      />

      <SocialProofStats />

      <TestimonialCarousel testimonials={remainingTestimonials} />

      <FloatingQuote quote="I finally felt like myself again." />

      <VideoTestimonials />

      <SuccessStoryTimeline />

      <FloatingQuote quote="The time came when the risk to remain tight in a bud was more painful than the risk it took to blossom." />

      <MemberStories />

      {/* CONVERSION CTA SECTION */}
      <section className="py-32 bg-secondary text-secondary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent opacity-60" />
        <div className="container mx-auto px-6 md:px-12 max-w-3xl relative z-10">
          <h2 className="text-5xl md:text-6xl font-heading mb-8">Ready to Experience This Yourself?</h2>
          <p className="text-xl font-light mb-12 text-secondary-foreground/80 leading-relaxed">
            Join hundreds of people who have discovered calm, clarity and creativity through breathwork.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-12 py-6 text-lg bg-background text-foreground hover:bg-accent hover:text-accent-foreground shadow-xl">
              <Link href="/calendar">Book Your First Session</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-12 py-6 text-lg bg-transparent border-secondary-foreground/50 text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
              <Link href="/membership">Explore Membership</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
