import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { sendBookingEmails } from '@/lib/email'
import { ensureClassMeeting } from '@/lib/meetings'
import { formatLongDate, formatTime12h, minutesBetween, ukDateTimeToUtc } from '@/lib/time'
import type { MembershipStatus } from '@/lib/membership'
import { getCalendarEventById } from '@/app/actions/calendar'
import {
  addAdminNotification,
  createBooking,
  findBookingByStripeSession,
  findMemberIdBySubscription,
  findUserBookingForEvent,
  getMember,
  updateMember,
  type BookingRecord,
} from '@/lib/store'

export { findUserBookingForEvent }

export type BookableEvent = NonNullable<Awaited<ReturnType<typeof getCalendarEventById>>>

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || ''
  return key.startsWith('sk_') && !key.includes('dummyKey') && !key.includes('placeholder')
}

export async function getMembership(userId: string): Promise<MembershipStatus> {
  const user = await getMember(userId)
  if (!user?.isMember) return { active: false, expiresAt: null }
  const expiresAt = user.membershipExpiresAt
  const active = !expiresAt || new Date(expiresAt).getTime() > Date.now()
  return { active, expiresAt }
}

export function oneMonthFromNow(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d
}

export async function activateMembership(
  userId: string,
  expiresAt: Date,
  stripeIds: { stripeCustomerId?: string; subscriptionId?: string } = {}
) {
  await updateMember(userId, { isMember: true, membershipExpiresAt: expiresAt, ...stripeIds })
}

// Guards against the webhook and the success-page sync fulfilling the same checkout at once.
const inFlight = new Map<string, Promise<BookingRecord>>()

type FulfillArgs = {
  userId: string
  customerEmail: string
  customerName: string
  event: BookableEvent
  pricePaid: number
  paymentLabel: string
  stripeSessionId?: string
}

export async function fulfillBooking(args: FulfillArgs): Promise<BookingRecord> {
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
}: FulfillArgs): Promise<BookingRecord> {
  const existing =
    (stripeSessionId && (await findBookingByStripeSession(stripeSessionId))) ||
    (await findUserBookingForEvent(userId, event.id))
  if (existing) return existing

  const meeting = await ensureClassMeeting(event)

  const booking = await createBooking({
    userId,
    calendarEventId: event.id,
    offeringSlug: event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    startUtc: ukDateTimeToUtc(event.date, event.startTime),
    endUtc: ukDateTimeToUtc(event.date, event.endTime),
    pricePaid,
    customerEmail,
    stripeSessionId,
    meeting,
  })

  await addAdminNotification(
    `New Booking: ${customerName} booked ${event.title} on ${event.date} at ${event.startTime} (${paymentLabel}).`
  )

  const durationMins = minutesBetween(event.startTime, event.endTime)
  await sendBookingEmails({
    customerEmail,
    customerName,
    className: event.title,
    date: formatLongDate(event.date),
    time: `${formatTime12h(event.startTime)} – ${formatTime12h(event.endTime)}`,
    durationMins: durationMins > 0 ? durationMins : 60,
    paymentLabel,
    meeting,
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
    await activateMembership(userId, end, { stripeCustomerId: customerId, subscriptionId })

    if (!meta.eventId) {
      await addAdminNotification(`New Membership: ${customerName} (${customerEmail}) joined the monthly membership.`)
      return
    }
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
  const ownerId = userId || (await findMemberIdBySubscription(subscriptionId))
  if (!ownerId) return
  await activateMembership(ownerId, end, { stripeCustomerId: customerId, subscriptionId })
}

export async function endMembershipForSubscription(subscriptionId: string) {
  const userId = await findMemberIdBySubscription(subscriptionId)
  if (userId) await updateMember(userId, { isMember: false, subscriptionId: null })
}

// Runs on the success page too, in case the customer returns before (or without) the webhook.
export async function confirmCheckoutSession(sessionId: string): Promise<{ type: string; booking: BookingRecord | null; email: string } | null> {
  if (!isStripeConfigured() || !sessionId.startsWith('cs_')) return null
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    await fulfillStripeCheckoutSession(session)
    const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
    return {
      type: paid ? session.metadata?.type ?? 'booking' : 'unpaid',
      booking: await findBookingByStripeSession(session.id),
      email: session.metadata?.customerEmail || session.customer_details?.email || '',
    }
  } catch (err) {
    console.error('[CHECKOUT] Could not confirm session on return:', err)
    return null
  }
}

export async function createBillingPortalUrl(stripeCustomerId: string, returnUrl: string): Promise<string | null> {
  if (!isStripeConfigured()) return null
  try {
    const portal = await stripe.billingPortal.sessions.create({ customer: stripeCustomerId, return_url: returnUrl })
    return portal.url
  } catch (err) {
    console.error('[STRIPE] Billing portal error:', err)
    return null
  }
}
