import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { getEvents } from '@/lib/mock-db'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const events = await getEvents()
  const UPCOMING_EVENTS = events.filter(e => e.status !== 'PAST')
  return (
    <div className="flex flex-col w-full bg-background pt-12 pb-24">
      <section className="py-24 text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-heading mb-6">Upcoming Sessions</h1>
          <p className="text-xl font-light text-foreground/80 max-w-2xl mx-auto">
            Find a time to reconnect. All times are automatically shown in your local timezone.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <div className="flex flex-col gap-6">
            {UPCOMING_EVENTS.map((event) => {
              const eventDate = new Date(event.date)
              const formattedDate = eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

              return (
                <div key={event.id} className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-lg transition-shadow">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                      <span className="text-accent font-medium uppercase tracking-wider text-sm flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {formattedDate}
                      </span>
                      <span className="hidden md:inline text-border">•</span>
                      <span className="text-foreground/60 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {event.time} (60 Mins)
                      </span>
                    </div>
                    <h2 className="text-2xl font-heading mb-2">{event.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground font-light">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.type || 'Online Group'}</span>
                      <span>•</span>
                      <span>{event.capacity || 'Available'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                    <div className="text-xl font-medium w-full sm:w-auto text-center sm:text-right">
                      ${event.price}
                    </div>
                    <Button asChild className="rounded-full px-8 w-full sm:w-auto">
                      <Link href={`/book?eventId=${event.id}`}>Book Now</Link>
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
