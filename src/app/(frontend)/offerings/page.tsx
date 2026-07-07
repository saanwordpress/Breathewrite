import Link from 'next/link'
import { Button } from '@/components/ui/button'

const OFFERINGS = [
  { slug: 'breathe-and-flow', title: 'Breathe & Flow', time: '60 Mins', type: 'Online Group', description: 'A gentle, flowing breathwork session designed to help you release tension and ground your nervous system.', image: '/offerings/Breathe-Flow-icon.png' },
  { slug: 'breathe-and-go', title: 'Breathe & Go', time: '30 Mins', type: 'Online Group', description: 'Short and effective. Perfect for a midday reset to clear mental fog and regain focus.', image: '/offerings/Breathe-go-icon.png' },
  { slug: 'breathe-and-write', title: 'Breathe & Write', time: '90 Mins', type: 'Online Group', description: 'Combine breathwork with guided journaling to bypass the inner critic and access deep creative insights.', image: '/offerings/Breathe-Write-icon.png' },
  { slug: 'neurodynamic-breathwork', title: 'Neurodynamic Breathwork', time: '120 Mins', type: 'Online Group', description: 'A profound, music-driven breathwork journey for deep emotional release and expanded states of awareness.', image: '/offerings/Neurodynamic-Breathwork-icon.png' },
  { slug: 'private-11-online-session-60-mins', title: 'Private 1:1 Session | 60 mins', time: '60 Mins', type: 'Online Private', description: 'Personalized breathwork tailored to your specific emotional and physical needs.', image: '/offerings/Private-11-Online-Session-60mins-icon.png' },
  { slug: 'private-11-onlinesession-120-mins', title: 'Private 1:1 Session | 120 mins', time: '120 Mins', type: 'Online Private', description: 'An extended private session allowing for deeper exploration and integration.', image: '/offerings/Private-11-Online-Session-120-mins-icon.png' },
  { slug: 'corporate-wellness', title: 'Corporate Wellness', time: 'Custom', type: 'Online/In-Person', description: 'Custom breathwork programs for teams to reduce burnout and improve focus.', image: '/offerings/Corporate-Wellness-icon.png' },
  { slug: 'breathe-and-move', title: 'Breathe & Move', time: '60 Mins', type: 'Online Group', description: 'Integrating somatic movement with conscious breathing to release trauma stored in the body.', image: '/offerings/Breathe-Move-icon (1).png' },
  { slug: 'in-person-events', title: 'In Person Events', time: 'Varies', type: 'In-Person', description: 'Live, immersive breathwork experiences in beautiful physical spaces.', image: '/offerings/In-Person-Events-icon.png' },
]

export default function OfferingsPage() {
  return (
    <div className="flex flex-col w-full bg-background pt-12">
      {/* Hero */}
      <section className="relative py-32 md:py-48 text-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/offerings/offering-bg.jpeg" 
            alt="Offerings Background" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        
        <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-4xl text-white">
          <h1 className="text-5xl md:text-7xl font-heading mb-6 drop-shadow-lg">Our Offerings</h1>
          <p className="text-xl font-light text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Discover a variety of breathwork practices tailored to your needs. Whether you seek deep emotional healing, stress relief, or a creative breakthrough, there is a session for you.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {OFFERINGS.map((offering) => (
              <div key={offering.slug} className="group relative rounded-[2rem] overflow-hidden border border-border bg-white shadow-sm flex flex-col h-full hover:shadow-2xl transition-all duration-500">
                <div className="aspect-[4/3] bg-[#F9F8F6] relative overflow-hidden flex-shrink-0 flex items-center justify-center p-12 border-b border-border/50">
                  {offering.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={offering.image} alt={offering.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-sm" />
                  ) : (
                    <div className="flex items-center justify-center text-muted-foreground/50 bg-accent/5 font-medium uppercase tracking-widest text-xs w-full h-full rounded-2xl">
                       Coming Soon
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wider mb-4">
                    <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full">{offering.time}</span>
                    <span className="bg-primary/5 text-primary px-3 py-1 rounded-full">{offering.type}</span>
                  </div>
                  <h3 className="text-2xl font-heading mb-3 text-primary">{offering.title}</h3>
                  <p className="text-muted-foreground font-light text-sm mb-8 flex-grow leading-relaxed">
                    {offering.description}
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <Button asChild variant="outline" className="w-full rounded-full border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary">
                      <Link href={`/offerings/${offering.slug}`}>Details</Link>
                    </Button>
                    <Button asChild className="w-full rounded-full">
                      <Link href={`/book/${offering.slug}`}>Book Now</Link>
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
