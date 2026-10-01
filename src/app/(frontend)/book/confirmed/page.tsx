import Link from 'next/link'
import { CheckCircle2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { confirmCheckoutSession } from '@/lib/bookings'
import { getBookingById, type BookingRecord } from '@/lib/store'
import { meetingProviderName } from '@/lib/meetings'
import { formatLongDate, formatTime12h } from '@/lib/time'

export const dynamic = 'force-dynamic'

function maskEmail(email: string | null | undefined) {
  if (!email) return 'your email'
  const [user, domain] = email.split('@')
  return `${user.slice(0, 2)}${'*'.repeat(Math.max(user.length - 2, 1))}@${domain}`
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl text-center space-y-6">
          <CheckCircle2 className="w-14 h-14 mx-auto text-[#5B8260]" />
          <h1 className="text-3xl md:text-4xl font-heading">{title}</h1>
          {children}
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href="/calendar">Back to Calendar</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ClassSummary({ booking }: { booking: BookingRecord }) {
  return (
    <div className="bg-muted/30 rounded-2xl p-6 text-left space-y-1">
      <p className="font-medium text-lg">{booking.title}</p>
      <p className="text-sm text-foreground/80 font-light">
        {formatLongDate(booking.date)} · {formatTime12h(booking.startTime)} – {formatTime12h(booking.endTime)} (UK time)
      </p>
      <p className="text-sm text-foreground/80 font-light">
        {booking.inPerson ? `In person${booking.location ? ` · ${booking.location}` : ''}` : 'Online via Zoom'}
      </p>
    </div>
  )
}

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams

  // Returning from Stripe: only the payer has this session id, so showing the link here is fine.
  if (typeof sp.session_id === 'string') {
    const result = await confirmCheckoutSession(sp.session_id)
    if (!result || result.type === 'unpaid') {
      return (
        <Shell title="Payment received">
          <p className="text-foreground/70 font-light">
            We&rsquo;re confirming your payment. Your confirmation and joining link will arrive by email in a few minutes.
          </p>
        </Shell>
      )
    }
    const { booking } = result
    return (
      <Shell title={booking ? "You're booked!" : 'Welcome to the membership!'}>
        {booking && <ClassSummary booking={booking} />}
        {booking?.meetingUrl && (
          <Button asChild className="rounded-full px-8 bg-[#4A6FA5] hover:bg-[#3B5B88] text-white">
            <a href={booking.meetingUrl} target="_blank" rel="noreferrer">
              <Video className="w-4 h-4 mr-2" /> Join {meetingProviderName(booking.meetingUrl)} link
            </a>
          </Button>
        )}
        <p className="text-foreground/70 font-light">
          {booking
            ? `A confirmation${booking.inPerson ? '' : ' with your joining link'} has been emailed to ${maskEmail(result.email)}.`
            : `Your membership is active. Book any class on the calendar using ${maskEmail(result.email)} and it's included.`}
        </p>
      </Shell>
    )
  }

  if (typeof sp.b === 'string') {
    const booking = await getBookingById(sp.b)
    if (booking) {
      return (
        <Shell title={sp.existing ? "You're already booked" : "You're booked!"}>
          <ClassSummary booking={booking} />
          <p className="text-foreground/70 font-light">
            Your {booking.inPerson ? 'booking confirmation' : 'joining link'} has been emailed to {maskEmail(booking.customerEmail)}. Please check your inbox (and spam folder).
            {sp.membership === 'new' && ' Your monthly membership is now active too.'}
          </p>
        </Shell>
      )
    }
  }

  if (sp.membership === 'active') {
    return (
      <Shell title="You're already a member">
        <p className="text-foreground/70 font-light">Your membership is active. Pick any class on the calendar and book with the same email — it&rsquo;s included.</p>
      </Shell>
    )
  }

  return (
    <Shell title="Welcome to the membership!">
      <p className="text-foreground/70 font-light">Your membership is active. Pick any class on the calendar and book with the same email — it&rsquo;s included.</p>
    </Shell>
  )
}
