import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkZoomConnection } from '@/lib/zoom'
import { isMollieConfigured, isMollieTestMode } from '@/lib/mollie'
import { Resend } from 'resend'
import { senderAddress } from '@/lib/email'

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

  // ?testEmail=1 sends one message to Resend's test inbox, which accepts mail without delivering it anywhere.
  let testEmail: { ok: boolean; detail: string } | undefined
  if (new URL(request.url).searchParams.get('testEmail') === '1') {
    if (!process.env.RESEND_API_KEY) testEmail = { ok: false, detail: 'RESEND_API_KEY not set' }
    else {
      try {
        const { error, data } = await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: senderAddress(),
          to: ['delivered@resend.dev'],
          subject: 'Breathe Write setup check',
          text: 'Test message from the Breathe Write booking site health check.',
        })
        testEmail = error ? { ok: false, detail: `${error.name}: ${error.message}` } : { ok: true, detail: `Sent (id ${data?.id})` }
      } catch (e) {
        testEmail = { ok: false, detail: (e as Error).message.slice(0, 300) }
      }
    }
  }

  return NextResponse.json({
    database,
    zoom: await checkZoomConnection(),
    payments: { mollieKey: isMollieConfigured(), mode: isMollieConfigured() ? (isMollieTestMode() ? 'test' : 'live') : null },
    email: { resendKey: !!process.env.RESEND_API_KEY, from: senderAddress(), ...(testEmail ? { testEmail } : {}) },
  })
}
