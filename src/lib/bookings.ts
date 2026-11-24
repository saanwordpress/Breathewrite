import {
  cancelSubscription,
  createSubscription,
  getPayment,
  getSubscription,
  gbp,
  isMollieConfigured,
  listSubscriptions,
  type MolliePayment,
} from '@/lib/mollie'
import { sendBookingEmails } from '@/lib/email'
import { ensureClassMeeting } from '@/lib/meetings'
import { formatLongDate, formatTime12h, minutesBetween, ukDateTimeToUtc } from '@/lib/time'
import { MEMBERSHIP_PRICE_GBP, type MembershipStatus } from '@/lib/membership'
import { getCalendarEventById } from '@/app/actions/calendar'
import {
  addAdminNotification,
  createBooking,
  findBookingByPaymentId,
  findMemberIdBySubscription,
  findUserBookingForEvent,
  getMember,
  updateMember,
  type BookingRecord,
} from '@/lib/store'

export { findUserBookingForEvent }

export type BookableEvent = NonNullable<Awaited<ReturnType<typeof getCalendarEventById>>>

export const isPaymentConfigured = isMollieConfigured

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
  paymentIds: { paymentCustomerId?: string; subscriptionId?: string } = {}
) {
  await updateMember(userId, { isMember: true, membershipExpiresAt: expiresAt, ...paymentIds })
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
  paymentId?: string
}

export async function fulfillBooking(args: FulfillArgs): Promise<BookingRecord> {
  const key = args.paymentId ?? `${args.userId}:${args.event.id}`
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
  paymentId,
}: FulfillArgs): Promise<BookingRecord> {
  const existing =
    (paymentId && (await findBookingByPaymentId(paymentId))) ||
    (await findUserBookingForEvent(userId, event.id))
  if (existing) return existing

  const inPerson = event.deliveryMode === 'IN_PERSON'
  const meeting = inPerson ? null : await ensureClassMeeting(event)

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
    paymentId,
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
    inPerson,
    location: event.location ?? null,
  })

  return booking
}

// Members keep access for a few days past the renewal date, so a slow or retried renewal doesn't lock them out.
const MEMBERSHIP_GRACE_DAYS = 3

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function expiryWithGrace(renewalDate: string): Date {
  const d = new Date(`${renewalDate}T23:59:59Z`)
  d.setUTCDate(d.getUTCDate() + MEMBERSHIP_GRACE_DAYS)
  return d
}

// Mollie must be able to reach the webhook, so it is left out when running on localhost.
export function mollieWebhookUrl(baseUrl: string): string | undefined {
  return /\/\/(localhost|127\.0\.0\.1)/.test(baseUrl) ? undefined : `${baseUrl}/api/webhooks/mollie`
}

// After the first membership payment: set up the monthly repeat payment (once) and activate the membership.
async function startMembershipSubscription(userId: string, payment: MolliePayment, baseUrl: string): Promise<boolean> {
  const customerId = payment.customerId
  if (!customerId) throw new Error(`Membership payment ${payment.id} has no Mollie customer`)

  const existing = (await listSubscriptions(customerId)).find(s => s.status === 'active' || s.status === 'pending')
  const startDate = ymd(oneMonthFromNow())
  const subscription =
    existing ??
    (await createSubscription(
      customerId,
      {
        amount: gbp(MEMBERSHIP_PRICE_GBP),
        interval: '1 month',
        startDate,
        // Mollie requires a description that is unique per customer.
        description: `Breathe Write Monthly Membership (from ${startDate})`,
        webhookUrl: mollieWebhookUrl(baseUrl),
        metadata: { type: 'membership-renewal', userId },
      },
      `subscription-${payment.id}`
    ))

  await activateMembership(userId, expiryWithGrace(subscription.nextPaymentDate ?? startDate), {
    paymentCustomerId: customerId,
    subscriptionId: subscription.id,
  })
  return !existing
}

async function renewMembership(payment: MolliePayment) {
  const { customerId, subscriptionId } = payment
  if (!customerId || !subscriptionId) return
  const subscription = await getSubscription(customerId, subscriptionId)
  const userId = subscription.metadata?.userId || (await findMemberIdBySubscription(subscriptionId))
  if (!userId) return console.error(`[MOLLIE] No member found for subscription ${subscriptionId}`)
  const renewal = subscription.nextPaymentDate ?? ymd(oneMonthFromNow())
  await activateMembership(userId, expiryWithGrace(renewal), { paymentCustomerId: customerId, subscriptionId })
}

// Called by the webhook and by the confirmation page. Safe to run more than once for the same payment.
export async function fulfillMolliePayment(payment: MolliePayment, baseUrl: string) {
  if (payment.status !== 'paid') return

  if (payment.sequenceType === 'recurring' && payment.subscriptionId) {
    await renewMembership(payment)
    return
  }

  const meta = payment.metadata || {}
  const userId = meta.userId
  if (!userId) return
  const customerEmail = meta.customerEmail || ''
  const customerName = meta.customerName || 'Valued Customer'

  if (meta.type === 'membership') {
    const isNew = await startMembershipSubscription(userId, payment, baseUrl)
    if (!meta.eventId) {
      if (isNew) await addAdminNotification(`New Membership: ${customerName} (${customerEmail}) joined the monthly membership.`)
      return
    }
    const event = await getCalendarEventById(meta.eventId)
    if (!event) return console.error(`[CHECKOUT] Event ${meta.eventId} not found for membership payment ${payment.id}`)
    await fulfillBooking({
      userId,
      customerEmail,
      customerName,
      event,
      pricePaid: 0,
      paymentLabel: 'Included with new monthly membership',
      paymentId: payment.id,
    })
    return
  }

  if (meta.type === 'booking' && meta.eventId) {
    const event = await getCalendarEventById(meta.eventId)
    if (!event) return console.error(`[CHECKOUT] Event ${meta.eventId} not found for payment ${payment.id}`)
    const pricePaid = Number(payment.amount.value)
    await fulfillBooking({
      userId,
      customerEmail,
      customerName,
      event,
      pricePaid,
      paymentLabel: `Paid £${pricePaid.toFixed(2)} online`,
      paymentId: payment.id,
    })
  }
}

// Runs on the confirmation page too, in case the customer returns before the webhook arrives.
export async function confirmPayment(
  paymentId: string,
  baseUrl: string
): Promise<{ type: string; booking: BookingRecord | null; email: string } | null> {
  if (!isPaymentConfigured() || !/^tr_\w+$/.test(paymentId)) return null
  try {
    const payment = await getPayment(paymentId)
    await fulfillMolliePayment(payment, baseUrl)
    const waiting = payment.status === 'open' || payment.status === 'pending' || payment.status === 'authorized'
    return {
      type: payment.status === 'paid' ? payment.metadata?.type ?? 'booking' : waiting ? 'pending' : 'failed',
      booking: await findBookingByPaymentId(payment.id),
      email: payment.metadata?.customerEmail || '',
    }
  } catch (err) {
    console.error('[CHECKOUT] Could not confirm payment on return:', err)
    return null
  }
}

// Stops future monthly payments. The member keeps access until the end of the period already paid for.
export async function cancelMembership(userId: string): Promise<boolean> {
  const member = await getMember(userId)
  if (!member?.paymentCustomerId || !member.subscriptionId) return false
  try {
    await cancelSubscription(member.paymentCustomerId, member.subscriptionId)
  } catch (err) {
    // Already cancelled in Mollie (e.g. from the Mollie dashboard) is fine; anything else is a real failure.
    if (!/\((404|410|422)\)/.test((err as Error).message)) {
      console.error('[MOLLIE] Cancel subscription failed:', err)
      return false
    }
  }
  await updateMember(userId, { subscriptionId: null })
  await addAdminNotification(`Membership cancelled: member ${userId} cancelled their monthly membership (access until it expires).`)
  return true
}
