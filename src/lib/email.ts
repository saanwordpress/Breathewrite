import { Resend } from 'resend'
import BookingConfirmationEmail from '@/emails/BookingConfirmation'
import AdminBookingAlertEmail from '@/emails/AdminBookingAlert'
import type { ZoomMeetingResult } from '@/lib/zoom'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@breathewrite.co.uk'

// Resend only allows onboarding@resend.dev until the sending domain is verified.
function senderAddress() {
  return process.env.EMAIL_FROM || (process.env.NODE_ENV === 'production'
    ? 'Breathe Write <info@breathewrite.co.uk>'
    : 'Breathe Write <onboarding@resend.dev>')
}

export type BookingEmailDetails = {
  customerEmail: string
  customerName: string
  className: string
  date: string
  time: string
  durationMins: number
  paymentLabel: string
  zoom: ZoomMeetingResult | null
}

export async function sendBookingEmails(details: BookingEmailDetails) {
  const { customerEmail, customerName, className, date, time, zoom } = details

  if (!resend) {
    console.warn(`[EMAIL DEV] RESEND_API_KEY missing. Not sending to customer (${customerEmail}) or admin (${ADMIN_EMAIL}).`)
    console.log(`[CUSTOMER EMAIL] ${className} | ${date} ${time} | Join: ${zoom?.joinUrl ?? 'NO MEETING CREATED'}`)
    console.log(`[ADMIN EMAIL] ${customerName} <${customerEmail}> | ${details.paymentLabel} | Start: ${zoom?.startUrl ?? 'NO MEETING CREATED'}`)
    return { success: true, mocked: true }
  }

  const results = await Promise.allSettled([
    resend.emails.send({
      from: senderAddress(),
      to: [customerEmail],
      replyTo: ADMIN_EMAIL,
      subject: `Booking Confirmed: ${className} – ${date}`,
      react: BookingConfirmationEmail({
        userName: customerName,
        className,
        date,
        time,
        durationMins: details.durationMins,
        meetLink: zoom?.joinUrl,
        meetingId: zoom?.meetingId,
        passcode: zoom?.password,
      }),
    }),
    resend.emails.send({
      from: senderAddress(),
      to: [ADMIN_EMAIL],
      replyTo: customerEmail,
      subject: `${zoom ? 'New Booking' : 'ACTION NEEDED – New Booking (no Zoom link)'}: ${className} – ${customerName}`,
      react: AdminBookingAlertEmail({
        customerName,
        customerEmail,
        className,
        date,
        time,
        durationMins: details.durationMins,
        paymentLabel: details.paymentLabel,
        joinLink: zoom?.joinUrl,
        startLink: zoom?.startUrl,
        meetingId: zoom?.meetingId,
        passcode: zoom?.password,
      }),
    }),
  ])

  results.forEach((r, i) => {
    const who = i === 0 ? 'customer' : 'admin'
    if (r.status === 'rejected') console.error(`[EMAIL] Failed to send ${who} email:`, r.reason)
    else if (r.value.error) console.error(`[EMAIL] Resend rejected ${who} email:`, r.value.error)
  })

  return { success: results.every(r => r.status === 'fulfilled' && !r.value.error) }
}
