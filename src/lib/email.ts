import { Resend } from 'resend'
import BookingConfirmationEmail from '@/emails/BookingConfirmation'
import AdminBookingAlertEmail from '@/emails/AdminBookingAlert'
import type { MeetingInfo } from '@/lib/store'
import { meetingProviderName } from '@/lib/meetings'
import { primaryAdminEmail } from '@/lib/admin'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Resend only allows onboarding@resend.dev until the sending domain is verified.
export function senderAddress() {
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
  meeting: MeetingInfo | null
}

export async function sendBookingEmails(details: BookingEmailDetails) {
  const { customerEmail, customerName, className, date, time, meeting } = details
  const adminEmail = primaryAdminEmail()
  const providerName = meetingProviderName(meeting?.joinUrl)

  if (!resend) {
    console.warn(`[EMAIL DEV] RESEND_API_KEY missing. Not sending to customer (${customerEmail}) or admin (${adminEmail}).`)
    console.log(`[CUSTOMER EMAIL] ${className} | ${date} ${time} | Join: ${meeting?.joinUrl ?? 'NO MEETING CREATED'}`)
    console.log(`[ADMIN EMAIL] ${customerName} <${customerEmail}> | ${details.paymentLabel} | Host: ${meeting?.hostUrl ?? 'NO MEETING CREATED'}`)
    return { success: true, mocked: true }
  }

  const results = await Promise.allSettled([
    resend.emails.send({
      from: senderAddress(),
      to: [customerEmail],
      replyTo: adminEmail,
      subject: `Booking Confirmed: ${className} – ${date}`,
      react: BookingConfirmationEmail({
        userName: customerName,
        className,
        date,
        time,
        durationMins: details.durationMins,
        providerName,
        meetLink: meeting?.joinUrl,
        meetingId: meeting?.meetingId ?? undefined,
        passcode: meeting?.password ?? undefined,
      }),
    }),
    resend.emails.send({
      from: senderAddress(),
      to: [adminEmail],
      replyTo: customerEmail,
      subject: `${meeting ? 'New Booking' : 'ACTION NEEDED – New Booking (no meeting link)'}: ${className} – ${customerName}`,
      react: AdminBookingAlertEmail({
        customerName,
        customerEmail,
        className,
        date,
        time,
        durationMins: details.durationMins,
        paymentLabel: details.paymentLabel,
        providerName,
        joinLink: meeting?.joinUrl,
        startLink: meeting?.hostUrl,
        meetingId: meeting?.meetingId ?? undefined,
        passcode: meeting?.password ?? undefined,
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
