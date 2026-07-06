'use server'

import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
// import { prisma } from "@/auth" 
import { redirect } from "next/navigation"
import { getEvents } from "@/lib/mock-db"

export async function createCheckoutSession(eventId: string, participants: number, wantsMembership: boolean) {
  const session = await auth()
  
  if (!session?.user?.id) {
    // Save state in cookies or URL params, then redirect to login
    redirect(`/login?callbackUrl=/book?eventId=${eventId}`)
  }

  const userId = session.user.id
  // @ts-ignore
  const isMember = session.user.isMember

  const events = await getEvents()
  const event = events.find(e => e.id === eventId)
  if (!event) throw new Error('Event not found')

  if (isMember) {
    // Members book for free
    /*
    await prisma.booking.create({
      data: {
        userId,
        eventId,
        status: 'CONFIRMED',
      }
    })
    
    // Decrease capacity
    await prisma.event.update({
      where: { id: eventId },
      data: { capacity: { decrement: participants } }
    })
    */
    
    redirect('/dashboard?booking=success')
  }

  // Handle Stripe Checkout for non-members
  let line_items = []
  
  if (wantsMembership) {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Monthly Membership',
          description: 'Unlimited access to online group sessions.',
        },
        unit_amount: 4500, // $45.00
        recurring: {
          interval: 'month' as const,
        },
      },
      quantity: 1,
    })
  } else {
    line_items.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: event.title,
          description: `60 Mins Session`,
        },
        unit_amount: Math.round(Number(event.price || 35) * 100),
      },
      quantity: participants,
    })
  }

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'paypal'],
    line_items,
    mode: wantsMembership ? 'subscription' : 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?booking=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book?eventId=${eventId}&canceled=true`,
    metadata: {
      userId,
      eventId,
      participants: participants.toString(),
      type: wantsMembership ? 'membership' : 'booking'
    },
    customer_email: session.user.email || undefined,
  })

  redirect(stripeSession.url!)
}
