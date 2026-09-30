import { redirect } from 'next/navigation'
import { getCalendarEventById } from '@/app/actions/calendar'
import { isClassPast, ukDateTimeToUtc } from '@/lib/time'
import { auth } from '@/auth'
import { getAccount } from '@/lib/store'
import { findUserBookingForEvent, getMembership } from '@/lib/bookings'
import { membershipCoversClass } from '@/lib/membership'
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

  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const account = session?.user?.id && role !== 'ADMIN' ? await getAccount(session.user.id) : null
  const membership = account ? await getMembership(account.id) : { active: false, expiresAt: null }
  const alreadyBooked = !!(account && event && (await findUserBookingForEvent(account.id, event.id)))
  const returnTo = eventId ? `/book?eventId=${eventId}` : '/book?membership=true'

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-heading mb-4">
            {wantsMembership && !event ? 'Become a Member' : 'Book a Session'}
          </h1>
          <p className="text-foreground/70 font-light">
            {wantsMembership && !event
              ? 'Create an account or log in, then pay securely with Stripe.'
              : 'Single classes don’t need an account. Members: log in to book for free.'}
          </p>
        </div>

        <BookingWizard
          eventId={eventId}
          event={event}
          membershipOnly={wantsMembership && !eventId}
          isPast={event ? isClassPast(event.date, event.startTime) : false}
          canceled={sp.canceled === 'true'}
          meetingLabel="Zoom"
          account={account?.email ? { name: account.name ?? '', email: account.email } : null}
          membership={membership}
          alreadyBooked={alreadyBooked}
          coveredByMembership={!!event && membershipCoversClass(membership, ukDateTimeToUtc(event.date, event.startTime))}
          returnTo={returnTo}
          initialAddMembership={sp.addMembership === '1'}
        />
      </div>
    </div>
  )
}
