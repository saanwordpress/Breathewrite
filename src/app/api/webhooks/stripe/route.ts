import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import {
  endMembershipForSubscription,
  fulfillStripeCheckoutSession,
  syncSubscriptionRenewal,
} from "@/lib/bookings"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    return new NextResponse("Webhook not configured", { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error) {
    return new NextResponse(`Webhook Error: ${(error as Error).message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillStripeCheckoutSession(event.data.object)
        break

      case "invoice.paid": {
        const sub = event.data.object.parent?.subscription_details?.subscription
        const subscriptionId = typeof sub === "string" ? sub : sub?.id
        if (subscriptionId) await syncSubscriptionRenewal(subscriptionId)
        break
      }

      case "customer.subscription.deleted":
        endMembershipForSubscription(event.data.object.id)
        break
    }
  } catch (error) {
    console.error(`[STRIPE WEBHOOK] Failed handling ${event.type}:`, error)
    // 500 makes Stripe retry; fulfilment is idempotent per checkout session.
    return new NextResponse("Webhook handler failed", { status: 500 })
  }

  return NextResponse.json({ received: true })
}
