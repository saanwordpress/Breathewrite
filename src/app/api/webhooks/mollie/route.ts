import { NextResponse } from 'next/server'
import { getPayment } from '@/lib/mollie'
import { fulfillMolliePayment, isPaymentConfigured } from '@/lib/bookings'
import { appBaseUrl } from '@/lib/url'

// Mollie posts only a payment id ("id=tr_…"). The payment is then fetched from Mollie with our own key,
// so a forged call can't fake a payment: it can only make us re-check a real one.
export async function POST(req: Request) {
  if (!isPaymentConfigured()) return new NextResponse('Payments not configured', { status: 503 })

  const id = String((await req.formData().catch(() => null))?.get('id') ?? '')
  if (!/^tr_\w+$/.test(id)) return new NextResponse(null, { status: 200 }) // ignore anything that isn't a payment

  try {
    const payment = await getPayment(id)
    await fulfillMolliePayment(payment, await appBaseUrl())
  } catch (error) {
    // Unknown payment (e.g. a test-mode id sent to the live site): nothing to do, and Mollie shouldn't retry.
    if (/\(404\)/.test((error as Error).message)) return new NextResponse(null, { status: 200 })
    console.error(`[MOLLIE WEBHOOK] Failed handling payment ${id}:`, error)
    // A non-200 makes Mollie retry later; fulfilment is safe to repeat.
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
  return new NextResponse(null, { status: 200 })
}
