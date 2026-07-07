import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
// import { prisma } from "@/auth"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as any

  if (event.type === "checkout.session.completed") {
    // Retrieve the subscription details from Stripe.
    const customerId = session.customer as string
    const metadata = session.metadata

    if (metadata?.type === 'membership') {
      // Handle membership subscription
      /*
      await prisma.user.update({
        where: { id: metadata.userId },
        data: {
          isMember: true,
          stripeCustomerId: customerId,
          subscriptionId: session.subscription,
        },
      })
      */
    } else if (metadata?.type === 'booking') {
      // Handle individual class booking
      /*
      await prisma.booking.create({
        data: {
          userId: metadata.userId,
          offeringSlug: metadata.offeringSlug,
          startTime: new Date(metadata.startTime),
          endTime: new Date(metadata.endTime),
          pricePaid: parseFloat(metadata.pricePaid),
          status: 'CONFIRMED',
          stripeSessionId: session.id,
        }
      })
      */

      // Send confirmation email (Triggered here or via another queue)
    }
  }

  if (event.type === "customer.subscription.deleted") {
    // Handle membership cancellation
    /*
    const subscription = event.data.object as any
    await prisma.user.updateMany({
      where: { subscriptionId: subscription.id },
      data: { isMember: false, subscriptionId: null },
    })
    */
  }

  return new NextResponse(null, { status: 200 })
}
