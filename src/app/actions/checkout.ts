'use server'

import { redirect } from "next/navigation"
import { appBaseUrl } from "@/lib/url"
import { createCustomer, createPayment, gbp, updatePayment } from "@/lib/mollie"
import { getCalendarEventById } from "@/app/actions/calendar"
import {
  activateMembership,
  findUserBookingForEvent,
  fulfillBooking,
  getMembership,
  isPaymentConfigured,
  mollieWebhookUrl,
  oneMonthFromNow,
} from "@/lib/bookings"
import { getAccount, getMember, updateMember, upsertCustomer } from "@/lib/store"
import { auth } from "@/auth"
import { MEMBERSHIP_PRICE_GBP, membershipCoversClass } from "@/lib/membership"
import { isClassPast, ukDateTimeToUtc, formatLongDate, formatTime12h } from "@/lib/time"

export type CheckoutResult = { error: string } | undefined

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// eventId: the calendar class being booked (null only when buying membership on its own).
export async function createCheckoutSession(
  eventId: string | null,
  wantsMembership: boolean,
  guest?: { name: string; email: string }
): Promise<CheckoutResult> {
  if (!eventId && !wantsMembership) return { error: 'Please choose a class from the calendar.' }

  // Logged-in member accounts book with their account; everyone else checks out as a guest.
  const session = await auth()
  const sessionRole = (session?.user as { role?: string } | undefined)?.role
  const account = session?.user?.id && sessionRole !== 'ADMIN' ? await getAccount(session.user.id) : null

  let customerName: string
  let customerEmail: string
  if (account?.email) {
    customerEmail = account.email
    customerName = account.name || account.email.split('@')[0]
  } else {
    if (wantsMembership) return { error: 'Please create an account or log in to buy a membership.' }
    customerName = String(guest?.name ?? '').trim().slice(0, 100)
    customerEmail = String(guest?.email ?? '').trim().toLowerCase()
    if (!customerName) return { error: 'Please enter your name.' }
    if (!EMAIL_RE.test(customerEmail) || customerEmail.length > 254) return { error: 'Please enter a valid email address.' }
  }

  const event = eventId ? await getCalendarEventById(eventId) : null
  if (eventId) {
    if (!event || !event.isPublished) return { error: 'This class is no longer available.' }
    if (isClassPast(event.date, event.startTime)) return { error: 'This class has already started and can no longer be booked.' }
  }

  const userId = account?.id ?? (await upsertCustomer(customerEmail, customerName))

  if (event) {
    const existing = await findUserBookingForEvent(userId, event.id)
    if (existing) redirect(`/book/confirmed?b=${existing.id}&existing=1`)
  }

  const membership = account ? await getMembership(userId) : { active: false, expiresAt: null }

  // Logged-in members book any class inside their membership period for free.
  if (event && !wantsMembership && membershipCoversClass(membership, ukDateTimeToUtc(event.date, event.startTime))) {
    const booking = await fulfillBooking({ userId, customerEmail, customerName, event, pricePaid: 0, paymentLabel: 'Monthly membership (no charge)' })
    redirect(`/book/confirmed?b=${booking.id}`)
  }

  if (event && !wantsMembership && event.price <= 0) {
    const booking = await fulfillBooking({ userId, customerEmail, customerName, event, pricePaid: 0, paymentLabel: 'Free class' })
    redirect(`/book/confirmed?b=${booking.id}`)
  }

  if (wantsMembership && membership.active && !event) {
    redirect('/book/confirmed?membership=active')
  }

  if (!isPaymentConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[CHECKOUT] MOLLIE_API_KEY is not configured.')
      return { error: 'Online payments are temporarily unavailable. Please contact us to book.' }
    }

    console.warn('[PAYMENTS DEV] No Mollie key configured — simulating a successful payment.')
    if (wantsMembership) {
      await activateMembership(userId, oneMonthFromNow())
      if (!event) redirect('/book/confirmed?membership=new')
      const booking = await fulfillBooking({ userId, customerEmail, customerName, event, pricePaid: 0, paymentLabel: 'Included with new monthly membership (simulated payment)' })
      redirect(`/book/confirmed?b=${booking.id}&membership=new`)
    }
    const booking = await fulfillBooking({ userId, customerEmail, customerName, event: event!, pricePaid: event!.price, paymentLabel: `£${event!.price.toFixed(2)} (simulated payment)` })
    redirect(`/book/confirmed?b=${booking.id}`)
  }

  const baseUrl = await appBaseUrl()
  const metadata: Record<string, string> = {
    type: wantsMembership ? 'membership' : 'booking',
    userId,
    customerEmail,
    customerName,
    ...(event ? { eventId: event.id } : {}),
  }

  let checkoutUrl: string | null = null
  try {
    // Memberships need a Mollie customer so the first payment can authorise the monthly repeat payments.
    let customerId: string | undefined
    if (wantsMembership) {
      customerId = (await getMember(userId))?.paymentCustomerId ?? undefined
      if (!customerId) {
        customerId = (await createCustomer(customerName, customerEmail, { userId })).id
        await updateMember(userId, { paymentCustomerId: customerId })
      }
    }

    const payment = await createPayment({
      amount: gbp(wantsMembership ? MEMBERSHIP_PRICE_GBP : event!.price),
      description: wantsMembership
        ? event
          ? `Breathe Write Monthly Membership (includes ${event.title} on ${formatLongDate(event.date)})`
          : 'Breathe Write Monthly Membership'
        : `${event!.title}, ${formatLongDate(event!.date)}, ${formatTime12h(event!.startTime)} (UK time)`,
      ...(wantsMembership ? { customerId, sequenceType: 'first' } : {}),
      // Replaced below once the payment id is known, so the confirmation page can look the payment up.
      redirectUrl: `${baseUrl}/book/confirmed`,
      cancelUrl: event ? `${baseUrl}/book?eventId=${event.id}&canceled=true` : `${baseUrl}/book?membership=true&canceled=true`,
      webhookUrl: mollieWebhookUrl(baseUrl),
      metadata,
    })
    await updatePayment(payment.id, { redirectUrl: `${baseUrl}/book/confirmed?payment_id=${payment.id}` })
    checkoutUrl = payment._links.checkout?.href ?? null
  } catch (error) {
    console.error('[CHECKOUT] Mollie payment creation failed:', error)
  }

  if (!checkoutUrl) return { error: 'We could not start the payment. Please try again in a moment.' }
  redirect(checkoutUrl)
}
