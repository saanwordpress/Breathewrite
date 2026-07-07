import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Users, Heart } from 'lucide-react'

// Core 7 Offerings based on user specification
const CALENDAR_OFFERINGS = [
  { id: 'breathe-and-flow', title: 'Breathe & Flow', price: '35', duration: '60 Mins', type: 'Online Group Session', idealFor: 'Anyone feeling overwhelmed or stressed' },
  { id: 'breathe-and-go', title: 'Breathe & Go', price: '15', duration: '20 Mins', type: 'Online Session', idealFor: 'Midday reset to clear mental fog' },
  { id: 'breathe-and-write', title: 'Breathe & Write', price: '50', duration: '120 Mins', type: 'Online Group Session', idealFor: 'Accessing deep creative insights' },
  { id: 'neurodynamic-breathwork', title: 'Neurodynamic Breathwork', price: '45', duration: '90 - 120 Mins', type: 'Online Group Session', idealFor: 'Deep emotional release' },
  { id: 'private-11-online-session-60-mins', title: 'Private 1:1 Online Session (60 Min)', price: '120', duration: '60 Mins', type: 'Private 1:1 Session', idealFor: 'Personalized emotional healing' },
  { id: 'private-11-onlinesession-120-mins', title: 'Private 1:1 Online Session (120 Min)', price: '200', duration: '120 Mins', type: 'Private 1:1 Session', idealFor: 'Deeper exploration and integration' },
  { id: 'corporate-wellness', title: 'Corporate Wellness', price: 'Custom', duration: 'Custom', type: 'Group/Corporate', idealFor: 'Teams reducing burnout' },
]

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  return (
    <div className="flex flex-col w-full bg-[#F9F8F6] pt-12 pb-24 min-h-screen">
      <section className="py-24 text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-heading mb-6 text-primary">Session Calendar</h1>
          <p className="text-xl font-light text-muted-foreground max-w-2xl mx-auto">
            Find a time to reconnect. Browse our sessions below and view Rosalind's availability to secure your spot.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <div className="flex flex-col gap-6">
            {CALENDAR_OFFERINGS.map((offering) => {
              return (
                <div key={offering.id} className="bg-white border border-border/50 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex-1 space-y-3">
                    <h2 className="text-2xl font-heading text-primary">{offering.title}</h2>
                    
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5 bg-[#EBCBBA]/10 text-primary px-3 py-1 rounded-full border border-[#EBCBBA]/20">
                        <Clock className="w-4 h-4 text-[#EBCBBA]" /> {offering.duration}
                      </span>
                      <span className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20">
                        <Users className="w-4 h-4" /> {offering.type}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted-foreground font-light pt-2">
                      <Heart className="w-4 h-4 text-[#EBCBBA] mt-0.5 flex-shrink-0" />
                      <span><span className="font-medium text-primary">Ideal for:</span> {offering.idealFor}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-border/50 pl-0 md:pl-6">
                    <div className="text-3xl font-heading text-primary w-full sm:w-auto text-center sm:text-right">
                      {offering.price === 'Custom' ? 'Custom' : `$${offering.price}`}
                    </div>
                    <Button asChild className="rounded-full px-8 py-6 w-full sm:w-auto shadow-md hover:-translate-y-0.5 transition-transform">
                      <Link href={`/book/${offering.id}`}>Book Now</Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
