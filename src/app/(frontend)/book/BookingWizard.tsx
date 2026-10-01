'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Video, AlertCircle, Sparkles, MapPin } from 'lucide-react'
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
  inPerson: boolean
  location: string | null
}

type Props = {
  eventId: string | null
  event: BookingEvent | null
  membershipOnly: boolean
  isPast: boolean
  canceled: boolean
  meetingLabel: string
  account: { name: string; email: string } | null
  membership: MembershipStatus
  alreadyBooked: boolean
  coveredByMembership: boolean
  returnTo: string
  initialAddMembership: boolean
}

const input = 'px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent w-full font-light'

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
  eventId, event, membershipOnly, isPast, canceled, meetingLabel,
  account, membership, alreadyBooked, coveredByMembership, returnTo, initialAddMembership,
}: Props) {
  const [addMembership, setAddMembership] = useState(membershipOnly || (initialAddMembership && !membership.active))
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (eventId && !event) {
    return <Notice title="Class not found" body="This class is no longer available. Please pick another date from the calendar." href="/calendar" cta="Back to Calendar" />
  }
  if (event && isPast) {
    return <Notice title="This class has already taken place" body="Past classes can't be booked. Take a look at the upcoming dates instead." href="/calendar" cta="See Upcoming Classes" />
  }
  if (event && alreadyBooked) {
    return <Notice title="You're already booked" body="Your joining link is in your confirmation email and on your account page." href="/dashboard" cta="My Account" />
  }
  if (membershipOnly && membership.active) {
    return <Notice title="You're already a member" body="Your membership is active. Pick any class on the calendar and book it free while logged in." href="/calendar" cta="Browse Classes" />
  }

  const payingForMembership = membershipOnly || addMembership
  const isFreeForMember = !!event && coveredByMembership && !addMembership
  const needsAccount = payingForMembership && !account
  const authReturn = encodeURIComponent(event && addMembership ? `${returnTo}&addMembership=1` : returnTo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createCheckoutSession(event?.id ?? null, payingForMembership, account ? undefined : { name, email })
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-heading">Review & Checkout</h2>

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
          {event.inPerson ? (
            <div className="flex items-start gap-2 text-sm text-muted-foreground font-light">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span>In person{event.location ? ` at ${event.location}` : ''}. Your confirmation is emailed to you as soon as you book.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
              <Video className="w-4 h-4 shrink-0" /> Live on {meetingLabel}. Your joining link is emailed to you as soon as you book.
            </div>
          )}
          <div className="border-t border-border pt-4 flex justify-between font-medium">
            <span>Total</span>
            {isFreeForMember ? (
              <span className="flex items-center gap-2">
                <span className="line-through text-muted-foreground font-light">£{event.price.toFixed(2)}</span> £0.00
              </span>
            ) : (
              <span>{payingForMembership ? `£${MEMBERSHIP_PRICE_GBP}.00 / month` : `£${event.price.toFixed(2)}`}</span>
            )}
          </div>
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

      {isFreeForMember && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#5B8260]/40 bg-[#5B8260]/10 p-5 text-sm">
          <Sparkles className="w-5 h-5 shrink-0 text-[#5B8260]" />
          <span><strong>Included in your membership.</strong> No payment needed.</span>
        </div>
      )}

      {account ? (
        <p className="text-sm text-muted-foreground font-light">
          Booking as <span className="font-medium text-foreground">{account.name || account.email}</span> ({account.email}).{' '}
          <Link href="/dashboard" className="underline underline-offset-4">My account</Link>
        </p>
      ) : needsAccount ? (
        <div className="rounded-2xl border border-border p-6 space-y-4 text-center">
          <h3 className="font-medium text-lg">Membership needs an account</h3>
          <p className="text-sm font-light text-foreground/80">
            Create an account (or log in) so you can book any class free while your membership is active. You&rsquo;ll come straight back here to pay.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="rounded-full px-8"><Link href={`/signup?callbackUrl=${authReturn}`}>Create Account</Link></Button>
            <Button asChild variant="outline" className="rounded-full px-8"><Link href={`/login?callbackUrl=${authReturn}`}>Log In</Link></Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Your Details</h3>
          <label className="block text-sm font-medium">
            Full name
            <input value={name} onChange={e => setName(e.target.value)} required maxLength={100} autoComplete="name" className={`${input} mt-2`} />
          </label>
          <label className="block text-sm font-medium">
            Email address
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className={`${input} mt-2`} />
            <span className="block mt-2 text-xs font-light text-muted-foreground">
              {event?.inPerson ? 'Your booking confirmation will be sent here.' : `Your ${meetingLabel} link will be sent here.`}
            </span>
          </label>
          <p className="flex items-start gap-2 text-xs text-muted-foreground font-light">
            <Sparkles className="w-4 h-4 shrink-0 text-[#5B8260]" />
            <span>
              Already a member? <Link href={`/login?callbackUrl=${encodeURIComponent(returnTo)}`} className="underline underline-offset-4">Log in</Link> to book this class free.
            </span>
          </p>
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

      {!needsAccount && (
        <div>
          <Button type="submit" className="w-full rounded-full py-6 text-lg" disabled={isPending}>
            {isPending ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
            ) : isFreeForMember ? (
              'Reserve My Spot (£0)'
            ) : payingForMembership ? (
              `Continue to Payment (£${MEMBERSHIP_PRICE_GBP}/month)`
            ) : (
              `Continue to Payment (£${event!.price.toFixed(2)})`
            )}
          </Button>
          {!isFreeForMember && <p className="text-center mt-4 text-sm font-light text-muted-foreground">Secure checkout via Stripe</p>}
        </div>
      )}
    </form>
  )
}
