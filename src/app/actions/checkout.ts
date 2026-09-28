'use server'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { appBaseUrl } from "@/lib/url"
import { stripe } from "@/lib/stripe"
import { getCalendarEventById } from "@/app/actions/calendar"
import {
  activateMembership,
  findUserBookingForEvent,
  fulfillBooking,
  getMembership,
  isStripeConfigured,
  oneMonthFromNow,
} from "@/lib/bookings"
import { MEMBERSHIP_PRICE_GBP, membershipCoversClass } from "@/lib/membership"
import { isClassPast, ukDateTimeToUtc, formatLongDate, formatTime12h } from "@/lib/time"

export type CheckoutResult = { error: string } | undefined

// eventId: the calendar class being booked (optional only when buying membership on its own).
export async function createCheckoutSession(eventId: string | null, wantsMembership: boolean): Promise<CheckoutResult> {
  const session = await auth()
  if (!session?.user?.id) {
    const back = eventId ? `/book?eventId=${eventId}` : '/book?membership=true'
    redirect(`/login?callbackUrl=${encodeURIComponent(back)}`)
  }

  const userId = session.user.id
  const customerEmail = session.user.email || ''
  const customerName = session.user.name || customerEmail.split('@')[0] || 'Valued Customer'

  if (!eventId && !wantsMembership) return { error: 'Please choose a class from the calendar.' }

  const event = eventId ? await getCalendarEventById(eventId) : null
  if (eventId) {
    if (!event || !event.isPublished) return { error: 'This class is no longer available.' }
    if (isClassPast(event.date, event.startTime)) return { error: 'This class has already started and can no longer be booked.' }
    if (await findUserBookingForEvent(userId, event.id)) redirect('/dashboard?booking=exists')
  }

  const membership = await getMembership(userId)

  // Active members book any class inside their membership period for free.
  if (event && !wantsMembership && membershipCoversClass(membership, ukDateTimeToUtc(event.date, event.startTime))) {
    await fulfillBooking({
      userId,
      customerEmail,
      customerName,
      event,
      pricePaid: 0,
      paymentLabel: 'Monthly membership (no charge)',
    })
    redirect('/dashboard?booking=success')
  }

  if (event && !wantsMembership && event.price <= 0) {
    await fulfillBooking({ userId, customerEmail, customerName, event, pricePaid: 0, paymentLabel: 'Free class' })
    redirect('/dashboard?booking=success')
  }

  if (wantsMembership && membership.active && !event) {
    redirect('/dashboard?membership=active')
  }

  if (!isStripeConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[CHECKOUT] STRIPE_SECRET_KEY is not configured.')
      return { error: 'Online payments are temporarily unavailable. Please contact us to book.' }
    }

    console.warn('[STRIPE DEV] No Stripe key configured — simulating a successful payment.')
    if (wantsMembership) {
      await activateMembership(userId, oneMonthFromNow())
      if (event) {
        await fulfillBooking({ userId, customerEmail, customerName, event, pricePaid: 0, paymentLabel: 'Included with new monthly membership (simulated payment)' })
        redirect('/dashboard?booking=success&membership=success')
      }
      redirect('/dashboard?membership=success')
    }
    await fulfillBooking({ userId, customerEmail, customerName, event: event!, pricePaid: event!.price, paymentLabel: `£${event!.price.toFixed(2)} (simulated payment)` })
    redirect('/dashboard?booking=success')
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
    const stripeSession = await stripe.checkout.sessions.create({
      mode: wantsMembership ? 'subscription' : 'payment',
      line_items: [
        wantsMembership
          ? {
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: 'Breathe Write Monthly Membership',
                  description: event
                    ? `Unlimited online group classes. Includes ${event.title} on ${formatLongDate(event.date)}.`
                    : 'Unlimited online group classes.',
                },
                unit_amount: MEMBERSHIP_PRICE_GBP * 100,
                recurring: { interval: 'month' },
              },
              quantity: 1,
            }
          : {
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: event!.title,
                  description: `${formatLongDate(event!.date)}, ${formatTime12h(event!.startTime)} – ${formatTime12h(event!.endTime)} (UK time) · Live online`,
                },
                unit_amount: Math.round(event!.price * 100),
              },
              quantity: 1,
            },
      ],
      customer_email: customerEmail || undefined,
      metadata,
      ...(wantsMembership ? { subscription_data: { metadata: { userId } } } : { payment_intent_data: { metadata } }),
      success_url: `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: event ? `${baseUrl}/book?eventId=${event.id}&canceled=true` : `${baseUrl}/membership?canceled=true`,
    })
    checkoutUrl = stripeSession.url
  } catch (error) {
    console.error('[CHECKOUT] Stripe session creation failed:', error)
  }

  if (!checkoutUrl) return { error: 'We could not start the payment. Please try again in a moment.' }
  redirect(checkoutUrl)
}
