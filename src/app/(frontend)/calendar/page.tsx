import { PublicCalendar } from './PublicCalendar'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  return (
    <div className="flex flex-col w-full bg-[#F9F8F6] pt-12 pb-24 min-h-screen">
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-heading mb-6 text-primary">Session Calendar</h1>
          <p className="text-xl font-light text-muted-foreground max-w-2xl mx-auto">
            Browse upcoming classes and find the perfect time to reconnect. Click any class to book your spot.
          </p>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-12 max-w-6xl">
          <PublicCalendar />
        </div>
      </section>
    </div>
  )
}
