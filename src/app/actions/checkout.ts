'use server'

import { auth } from "@/auth"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/availability" 
import { redirect } from "next/navigation"

export async function createCheckoutSession(slug: string, dateStr: string, timeStr: string, durationMins: number, price: number, wantsMembership: boolean) {
  const session = await auth()
  
  if (!session?.user?.id) {
    // Save state in cookies or URL params, then redirect to login
    redirect(`/login?callbackUrl=/book/${slug}?date=${dateStr}&time=${timeStr}`)
  }

  const userId = session.user.id
  // @ts-ignore
  const isMember = session.user.isMember

  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  
  const startTime = new Date(Date.UTC(year, month - 1, day, hours, minutes))
  const endTime = new Date(startTime.getTime() + durationMins * 60000)

  if (isMember && !wantsMembership) {
    // Members book for free
    await prisma.booking.create({
      data: {
        userId,
        offeringSlug: slug,
        startTime,
        endTime,
        pricePaid: 0,
        status: 'CONFIRMED',
      }
    })

    await prisma.notification.create({
      data: {
        message: `Member ${session.user.name || session.user.email} booked a class: ${slug} on ${dateStr} at ${timeStr}.`
      }
    })
    
    redirect('/dashboard?booking=success')
  }

  // Handle Stripe Checkout for non-members
  let line_items = []
  
  if (wantsMembership) {
    line_items.push({
      price_data: {
        currency: 'gbp', // BreatheWrite uses £
        product_data: {
          name: 'Monthly Membership',
          description: 'Unlimited access to online group sessions.',
        },
        unit_amount: 4500, // £45.00
        recurring: {
          interval: 'month' as const,
        },
      },
      quantity: 1,
    })
  } else {
    line_items.push({
      price_data: {
        currency: 'gbp', // BreatheWrite uses £
        product_data: {
          name: `Booking: ${slug.replace(/-/g, ' ')}`,
          description: `${dateStr} at ${timeStr} (${durationMins} mins)`,
        },
        unit_amount: Math.round(Number(price || 35) * 100),
      },
      quantity: 1,
    })
  }

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: wantsMembership ? 'subscription' : 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?booking=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${slug}?canceled=true`,
    metadata: {
      userId,
      offeringSlug: slug,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      pricePaid: wantsMembership ? "0" : price.toString(),
      type: wantsMembership ? 'membership' : 'booking'
    },
    customer_email: session.user.email || undefined,
  })

  redirect(stripeSession.url!)
}

