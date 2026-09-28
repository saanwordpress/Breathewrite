import { redirect } from 'next/navigation'
import { getCalendarEventById } from '@/app/actions/calendar'
import { isClassPast } from '@/lib/time'
import { activeMeetingProvider } from '@/lib/meetings'
import { BookingWizard } from './BookingWizard'

export const dynamic = 'force-dynamic'

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const eventId = typeof sp.eventId === 'string' ? sp.eventId : null
  const wantsMembership = sp.membership === 'true'

  if (!eventId && !wantsMembership) redirect('/calendar')

  const found = eventId ? await getCalendarEventById(eventId) : null
  const event = found && found.isPublished
    ? { id: found.id, title: found.title, date: found.date, startTime: found.startTime, endTime: found.endTime, price: found.price }
    : null

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-heading mb-4">
            {wantsMembership && !event ? 'Become a Member' : 'Book a Session'}
          </h1>
          <p className="text-foreground/70 font-light">
            Enter your details below to secure your spot. No account needed.
          </p>
        </div>

        <BookingWizard
          eventId={eventId}
          event={event}
          membershipOnly={wantsMembership && !eventId}
          isPast={event ? isClassPast(event.date, event.startTime) : false}
          canceled={sp.canceled === 'true'}
          meetingLabel={activeMeetingProvider() === 'zoom' ? 'Zoom' : 'Google Meet'}
        />
      </div>
    </div>
  )
}
