'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Sparkles, Video, AlertCircle } from 'lucide-react'
import { createCheckoutSession } from '@/app/actions/checkout'
import { MEMBERSHIP_PRICE_GBP, type MembershipStatus } from '@/lib/membership'
import { formatLongDate, formatTime12h, minutesBetween } from '@/lib/time'

type BookingEvent = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  price: number
}

type Props = {
  eventId: string | null
  event: BookingEvent | null
  membershipOnly: boolean
  isLoggedIn: boolean
  membership: MembershipStatus
  isPast: boolean
  alreadyBooked: boolean
  coveredByMembership: boolean
  canceled: boolean
  meetingLabel: string
}

function Notice({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-10 shadow-xl text-center space-y-4">
      <h2 className="text-2xl font-heading">{title}</h2>
      <p className="text-foreground/70 font-light">{body}</p>
      <Button asChild className="rounded-full px-8 mt-2">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm font-light text-foreground/80">
      <span>{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export function BookingWizard({
  eventId,
  event,
  membershipOnly,
  isLoggedIn,
  membership,
  isPast,
  alreadyBooked,
  coveredByMembership,
  canceled,
  meetingLabel,
}: Props) {
  const [addMembership, setAddMembership] = useState(membershipOnly)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const memberUntil = membership.expiresAt ? formatLongDate(membership.expiresAt.slice(0, 10)) : null

  if (eventId && !event) {
    return <Notice title="Class not found" body="This class is no longer available. Please pick another date from the calendar." href="/calendar" cta="Back to Calendar" />
  }
  if (event && isPast) {
    return <Notice title="This class has already taken place" body="Past classes can't be booked. Take a look at the upcoming dates instead." href="/calendar" cta="See Upcoming Classes" />
  }
  if (event && alreadyBooked) {
    return <Notice title="You're already booked" body="Your joining link is in your confirmation email and on your dashboard." href="/dashboard" cta="Go to My Dashboard" />
  }
  if (membershipOnly && membership.active) {
    return <Notice title="You're already a member" body={`Your membership is active${memberUntil ? ` until ${memberUntil}` : ''}. Pick any class on the calendar to reserve your spot at no charge.`} href="/calendar" cta="Browse Classes" />
  }

  const payingForMembership = membershipOnly || addMembership
  const isFreeForMember = !!event && coveredByMembership && !addMembership

  const handleCheckout = () => {
    setError(null)
    startTransition(async () => {
      const result = await createCheckoutSession(event?.id ?? null, payingForMembership)
      if (result?.error) setError(result.error)
    })
  }

  const buttonLabel = !isLoggedIn
    ? 'Sign in to Continue'
    : isFreeForMember
    ? 'Reserve My Spot (£0)'
    : payingForMembership
    ? `Checkout (£${MEMBERSHIP_PRICE_GBP}/month)`
    : `Checkout (£${event!.price.toFixed(2)})`

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-heading">Review & {isFreeForMember ? 'Reserve' : 'Checkout'}</h2>

      {canceled && (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-muted-foreground" />
          <span>Payment was cancelled and you have not been charged. You can try again below.</span>
        </div>
      )}

      {event && (
        <div className="bg-muted/30 p-6 rounded-2xl space-y-4">
          <h3 className="font-medium text-lg">Booking Summary</h3>
          <Row label="Class" value={event.title} />
          <Row label="Date" value={formatLongDate(event.date)} />
          <Row label="Time (UK)" value={`${formatTime12h(event.startTime)} – ${formatTime12h(event.endTime)}`} />
          <Row label="Duration" value={`${minutesBetween(event.startTime, event.endTime)} minutes`} />
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
            <Video className="w-4 h-4" /> Live on {meetingLabel}. Your joining link is emailed as soon as you book.
          </div>
          <div className="border-t border-border pt-4 flex justify-between font-medium">
            <span>Total</span>
            {isFreeForMember ? (
              <span className="flex items-center gap-2">
                <span className="line-through text-muted-foreground font-light">£{event.price.toFixed(2)}</span>
                £0.00
              </span>
            ) : payingForMembership ? (
              <span>£{MEMBERSHIP_PRICE_GBP}.00 / month</span>
            ) : (
              <span>£{event.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      )}

      {isFreeForMember && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#5B8260]/40 bg-[#5B8260]/10 p-5 text-sm">
          <Sparkles className="w-5 h-5 shrink-0 text-[#5B8260]" />
          <span>
            <strong>Included in your membership.</strong> No payment needed
            {memberUntil ? `. Your membership covers classes until ${memberUntil}.` : '.'}
          </span>
        </div>
      )}

      {event && membership.active && !coveredByMembership && memberUntil && (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-5 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-muted-foreground" />
          <span>This class is after your current membership period (ends {memberUntil}), so it isn&rsquo;t included yet. Once your membership renews it will be free to book.</span>
        </div>
      )}

      {membershipOnly && (
        <div className="bg-muted/30 p-6 rounded-2xl space-y-4">
          <h3 className="font-medium text-lg">Monthly Membership</h3>
          <p className="text-sm font-light text-foreground/80">
            Book any online group class on the calendar at no extra charge while your membership is active. Renews monthly; cancel anytime.
          </p>
          <div className="border-t border-border pt-4 flex justify-between font-medium">
            <span>Total</span>
            <span>£{MEMBERSHIP_PRICE_GBP}.00 / month</span>
          </div>
        </div>
      )}

      {event && !membership.active && (
        <button
          type="button"
          onClick={() => setAddMembership(!addMembership)}
          className={`w-full p-6 rounded-2xl border transition-all text-left flex items-start gap-4 ${addMembership ? 'border-accent bg-accent/10 ring-1 ring-accent' : 'border-border hover:border-accent/50'}`}
        >
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${addMembership ? 'bg-accent border-accent text-primary' : 'border-border'}`}>
            {addMembership && <Check className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="font-medium text-lg mb-1">Add Monthly Membership</h4>
            <p className="text-sm font-light text-foreground/70 mb-2">
              £{MEMBERSHIP_PRICE_GBP}/month for unlimited classes. This class is included free when you join today.
            </p>
            <span className="text-accent font-medium text-sm block">Highly Recommended</span>
          </div>
        </button>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <Button className="w-full rounded-full py-6 text-lg" onClick={handleCheckout} disabled={isPending}>
          {isPending ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
          ) : (
            buttonLabel
          )}
        </Button>
        {!isFreeForMember && (
          <p className="text-center mt-4 text-sm font-light text-muted-foreground">Secure checkout via Stripe</p>
        )}
      </div>
    </div>
  )
}
