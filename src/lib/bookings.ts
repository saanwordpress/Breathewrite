import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createZoomMeeting } from '@/lib/zoom'
import { sendBookingEmails } from '@/lib/email'
import { formatLongDate, formatTime12h, minutesBetween, ukDateTimeToUtc } from '@/lib/time'
import type { MembershipStatus } from '@/lib/membership'
import { getCalendarEventById } from '@/app/actions/calendar'
import {
  jsonCreateBooking,
  jsonFindBooking,
  jsonFindUserBySubscription,
  jsonGetUser,
  jsonUpdateUser,
  type BookingData,
} from '@/lib/json-db'

export type BookableEvent = NonNullable<Awaited<ReturnType<typeof getCalendarEventById>>>

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || ''
  return key.startsWith('sk_') && !key.includes('dummyKey') && !key.includes('placeholder')
}

export function getMembership(userId: string): MembershipStatus {
  const user = jsonGetUser(userId)
  if (!user?.isMember) return { active: false, expiresAt: null }
  const expiresAt = user.membershipExpiresAt ?? null
  const active = !expiresAt || new Date(expiresAt).getTime() > Date.now()
  return { active, expiresAt }
}

export function findUserBookingForEvent(userId: string, eventId: string) {
  return jsonFindBooking(b => b.userId === userId && b.calendarEventId === eventId && b.status === 'CONFIRMED')
}

export function oneMonthFromNow(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d
}

export function activateMembership(
  userId: string,
  expiresAt: Date,
  stripeIds: { stripeCustomerId?: string; subscriptionId?: string } = {}
) {
  jsonUpdateUser(userId, {
    isMember: true,
    membershipExpiresAt: expiresAt.toISOString(),
    ...stripeIds,
  })

  if (prisma) {
    prisma.user
      .update({ where: { id: userId }, data: { isMember: true, ...stripeIds } })
      .catch(err => console.warn('Prisma membership update skipped:', err?.message))
  }
}

// Guards against the webhook and the success-page sync fulfilling the same checkout at once.
const inFlight = new Map<string, Promise<BookingData>>()

export async function fulfillBooking(args: {
  userId: string
  customerEmail: string
  customerName: string
  event: BookableEvent
  pricePaid: number
  paymentLabel: string
  stripeSessionId?: string
}): Promise<BookingData> {
  const key = args.stripeSessionId ?? `${args.userId}:${args.event.id}`
  const pending = inFlight.get(key)
  if (pending) return pending

  const work = doFulfillBooking(args).finally(() => inFlight.delete(key))
  inFlight.set(key, work)
  return work
}

async function doFulfillBooking({
  userId,
  customerEmail,
  customerName,
  event,
  pricePaid,
  paymentLabel,
  stripeSessionId,
}: Parameters<typeof fulfillBooking>[0]): Promise<BookingData> {
  const existing =
    (stripeSessionId && jsonFindBooking(b => b.stripeSessionId === stripeSessionId)) ||
    findUserBookingForEvent(userId, event.id)
  if (existing) return existing

  const durationMins = minutesBetween(event.startTime, event.endTime) > 0
    ? minutesBetween(event.startTime, event.endTime)
    : 60

  const zoom = await createZoomMeeting({
    topic: `Breathe Write: ${event.title} – ${customerName}`,
    date: event.date,
    startTime: event.startTime,
    durationMins,
  })

  const booking = jsonCreateBooking({
    userId,
    offeringSlug: event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    pricePaid,
    status: 'CONFIRMED',
    stripeSessionId,
    calendarEventId: event.id,
    customerEmail,
    meetingUrl: zoom?.joinUrl,
    startUrl: zoom?.startUrl,
    zoomMeetingId: zoom?.meetingId,
    zoomPassword: zoom?.password,
  })

  if (prisma) {
    try {
      await prisma.booking.create({
        data: {
          userId,
          offeringSlug: booking.offeringSlug,
          startTime: ukDateTimeToUtc(event.date, event.startTime),
          endTime: ukDateTimeToUtc(event.date, event.endTime),
          pricePaid,
          status: 'CONFIRMED',
          stripeSessionId,
          calendarEventId: event.id,
        },
      })
      await prisma.notification.create({
        data: { message: `New Booking: ${customerName} booked ${event.title} on ${event.date} at ${event.startTime} (${paymentLabel}).` },
      })
    } catch (err) {
      console.warn('Prisma booking record skipped:', (err as Error)?.message)
    }
  }

  await sendBookingEmails({
    customerEmail,
    customerName,
    className: event.title,
    date: formatLongDate(event.date),
    time: `${formatTime12h(event.startTime)} – ${formatTime12h(event.endTime)}`,
    durationMins,
    paymentLabel,
    zoom,
  })

  return booking
}

async function subscriptionPeriodEnd(subscriptionId: string): Promise<{ end: Date; userId?: string; customerId?: string }> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId)
  const endSecs = sub.items.data[0]?.current_period_end
  return {
    end: endSecs ? new Date(endSecs * 1000) : oneMonthFromNow(),
    userId: sub.metadata?.userId,
    customerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
  }
}

export async function fulfillStripeCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return

  const meta = session.metadata || {}
  const userId = meta.userId
  if (!userId) return

  const customerEmail = meta.customerEmail || session.customer_details?.email || ''
  const customerName = meta.customerName || session.customer_details?.name || 'Valued Customer'

  if (meta.type === 'membership') {
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
    const { end, customerId } = subscriptionId
      ? await subscriptionPeriodEnd(subscriptionId)
      : { end: oneMonthFromNow(), customerId: undefined }
    activateMembership(userId, end, { stripeCustomerId: customerId, subscriptionId })

    if (!meta.eventId) return
    const event = await getCalendarEventById(meta.eventId)
    if (!event) return console.error(`[CHECKOUT] Event ${meta.eventId} not found for membership session ${session.id}`)
    await fulfillBooking({
      userId,
      customerEmail,
      customerName,
      event,
      pricePaid: 0,
      paymentLabel: 'Included with new monthly membership',
      stripeSessionId: session.id,
    })
    return
  }

  if (meta.type === 'booking' && meta.eventId) {
    const event = await getCalendarEventById(meta.eventId)
    if (!event) return console.error(`[CHECKOUT] Event ${meta.eventId} not found for session ${session.id}`)
    const pricePaid = (session.amount_total ?? 0) / 100
    await fulfillBooking({
      userId,
      customerEmail,
      customerName,
      event,
      pricePaid,
      paymentLabel: `Paid £${pricePaid.toFixed(2)} via Stripe`,
      stripeSessionId: session.id,
    })
  }
}

export async function syncSubscriptionRenewal(subscriptionId: string) {
  const { end, userId, customerId } = await subscriptionPeriodEnd(subscriptionId)
  const ownerId = userId || jsonFindUserBySubscription(subscriptionId)?.id
  if (!ownerId) return
  activateMembership(ownerId, end, { stripeCustomerId: customerId, subscriptionId })
}

export function endMembershipForSubscription(subscriptionId: string) {
  const user = jsonFindUserBySubscription(subscriptionId)
  if (user) jsonUpdateUser(user.id, { isMember: false })

  if (prisma) {
    prisma.user
      .updateMany({ where: { subscriptionId }, data: { isMember: false, subscriptionId: null } })
      .catch(err => console.warn('Prisma membership cancel skipped:', err?.message))
  }
}

// Fallback for when the success redirect lands before (or without) the webhook, e.g. local dev without `stripe listen`.
export async function confirmCheckoutForUser(sessionId: string, userId: string) {
  if (!isStripeConfigured() || !sessionId.startsWith('cs_')) return
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.metadata?.userId !== userId) return
    await fulfillStripeCheckoutSession(session)
  } catch (err) {
    console.error('[CHECKOUT] Could not confirm session on return:', err)
  }
}
