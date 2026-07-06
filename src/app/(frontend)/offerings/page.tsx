import Link from 'next/link'
import { Button } from '@/components/ui/button'

const OFFERINGS = [
  { slug: 'breathe-and-flow', title: 'Breathe & Flow', time: '60 Mins', type: 'Online Group', description: 'A gentle, flowing breathwork session designed to help you release tension and ground your nervous system.', image: '/offerings/breathe-and-flow.jpg' },
  { slug: 'breathe-and-go', title: 'Breathe & Go', time: '30 Mins', type: 'Online Group', description: 'Short and effective. Perfect for a midday reset to clear mental fog and regain focus.', image: '/offerings/breathe-and-go.jpg' },
  { slug: 'breathe-and-write', title: 'Breathe & Write', time: '90 Mins', type: 'Online Group', description: 'Combine breathwork with guided journaling to bypass the inner critic and access deep creative insights.', image: '/offerings/breathe-and-write.jpg' },
  { slug: 'neurodynamic-breathwork', title: 'Neurodynamic Breathwork', time: '120 Mins', type: 'Online Group', description: 'A profound, music-driven breathwork journey for deep emotional release and expanded states of awareness.', image: '/offerings/neurodynamic-breathwork.jpg' },
  { slug: 'private-11-online-session-60-mins', title: 'Private 1:1 Session | 60 mins', time: '60 Mins', type: 'Online Private', description: 'Personalized breathwork tailored to your specific emotional and physical needs.', image: '/offerings/breathe-and-go.jpg' },
  { slug: 'private-11-onlinesession-120-mins', title: 'Private 1:1 Session | 120 mins', time: '120 Mins', type: 'Online Private', description: 'An extended private session allowing for deeper exploration and integration.', image: '/offerings/corporate-wellness.jpg' },
  { slug: 'corporate-wellness', title: 'Corporate Wellness', time: 'Custom', type: 'Online/In-Person', description: 'Custom breathwork programs for teams to reduce burnout and improve focus.', image: '/offerings/corporate-wellness.jpg' },
  { slug: 'breathe-and-move', title: 'Breathe & Move', time: '60 Mins', type: 'Online Group', description: 'Integrating somatic movement with conscious breathing to release trauma stored in the body.', image: null },
  { slug: 'in-person-events', title: 'In Person Events', time: 'Varies', type: 'In-Person', description: 'Live, immersive breathwork experiences in beautiful physical spaces.', image: null },
]

export default function OfferingsPage() {
  return (
    <div className="flex flex-col w-full bg-background pt-12">
      {/* Hero */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-heading mb-6">Our Offerings</h1>
          <p className="text-xl font-light text-primary-foreground/80 max-w-2xl mx-auto">
            Discover a variety of breathwork practices tailored to your needs. Whether you seek deep emotional healing, stress relief, or a creative breakthrough, there is a session for you.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {OFFERINGS.map((offering) => (
              <div key={offering.slug} className="group relative rounded-3xl overflow-hidden border border-border bg-card p-1 flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-[4/3] bg-muted rounded-2xl mb-6 relative overflow-hidden flex-shrink-0">
                  {offering.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={offering.image} alt={offering.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 bg-accent/5 font-medium uppercase tracking-widest text-xs">
                       Coming Soon
                    </div>
                  )}
                </div>
                <div className="px-6 pb-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
                    <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full">{offering.time}</span>
                    <span className="bg-primary/5 text-primary px-3 py-1 rounded-full">{offering.type}</span>
                  </div>
                  <h3 className="text-2xl font-heading mb-3">{offering.title}</h3>
                  <p className="text-foreground/70 font-light text-sm mb-8 flex-grow">
                    {offering.description}
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <Button asChild variant="outline" className="w-full rounded-full border-border hover:bg-secondary hover:text-secondary-foreground hover:border-secondary">
                      <Link href={`/offerings/${offering.slug}`}>Details</Link>
                    </Button>
                    <Button asChild className="w-full rounded-full">
                      <Link href="/book">Book Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
