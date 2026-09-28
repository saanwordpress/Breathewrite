import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getCalendarEventById } from '@/app/actions/calendar'
import { findUserBookingForEvent, getMembership } from '@/lib/bookings'
import { membershipCoversClass } from '@/lib/membership'
import { isClassPast, ukDateTimeToUtc } from '@/lib/time'
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

  const session = await auth()
  const userId = session?.user?.id ?? null

  const found = eventId ? await getCalendarEventById(eventId) : null
  const event = found && found.isPublished
    ? { id: found.id, title: found.title, date: found.date, startTime: found.startTime, endTime: found.endTime, price: found.price }
    : null

  const membership = userId ? getMembership(userId) : { active: false, expiresAt: null }

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-heading mb-4">
            {wantsMembership && !event ? 'Become a Member' : 'Book a Session'}
          </h1>
          <p className="text-foreground/70 font-light">
            Review your details below to secure your spot.
          </p>
        </div>

        <BookingWizard
          eventId={eventId}
          event={event}
          membershipOnly={wantsMembership && !eventId}
          isLoggedIn={!!userId}
          membership={membership}
          isPast={event ? isClassPast(event.date, event.startTime) : false}
          alreadyBooked={!!(userId && event && findUserBookingForEvent(userId, event.id))}
          coveredByMembership={!!event && membershipCoversClass(membership, ukDateTimeToUtc(event.date, event.startTime))}
          canceled={sp.canceled === 'true'}
        />
      </div>
    </div>
  )
}
