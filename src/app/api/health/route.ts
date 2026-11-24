import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkZoomConnection } from '@/lib/zoom'
import { isStripeConfigured } from '@/lib/bookings'

// Setup check for the booking flow. Protected by CRON_SECRET; reports status only, never secrets.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let database = false
  try {
    if (prisma) { await prisma.$queryRaw`SELECT 1`; database = true }
  } catch {}

  return NextResponse.json({
    database,
    zoom: await checkZoomConnection(),
    stripe: { secretKey: isStripeConfigured(), webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET },
    email: { resendKey: !!process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM || 'default (info@breathewrite.co.uk)' },
  })
}
