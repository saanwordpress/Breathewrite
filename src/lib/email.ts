import { Resend } from 'resend'
import BookingConfirmationEmail from '@/emails/BookingConfirmation'
import AdminBookingAlertEmail from '@/emails/AdminBookingAlert'
import type { MeetingInfo } from '@/lib/store'
import { meetingProviderName } from '@/lib/meetings'
import { primaryAdminEmail } from '@/lib/admin'
import type { PackageDef } from '@/lib/packages'

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
  inPerson: boolean
  location: string | null
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
        inPerson: details.inPerson,
        location: details.location ?? undefined,
      }),
    }),
    resend.emails.send({
      from: senderAddress(),
      to: [adminEmail],
      replyTo: customerEmail,
      subject: `${meeting || details.inPerson ? 'New Booking' : 'ACTION NEEDED – New Booking (no meeting link)'}${details.inPerson ? ' (in person)' : ''}: ${className} – ${customerName}`,
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
        inPerson: details.inPerson,
        location: details.location ?? undefined,
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

const esc = (t: string) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

// Package purchase: confirmation to the customer, alert to the admin.
export async function sendPackageEmails({ customerEmail, customerName, pkg, validUntil }: {
  customerEmail: string
  customerName: string
  pkg: PackageDef
  validUntil: string
}) {
  const adminEmail = primaryAdminEmail()
  const what = pkg.credits === null ? 'unlimited online group classes' : `${pkg.credits} sessions`
  const site = process.env.NEXT_PUBLIC_APP_URL || 'https://breathewrite-2n6s.vercel.app'
  if (!resend) {
    console.warn(`[EMAIL DEV] Package ${pkg.name} for ${customerEmail}, valid until ${validUntil}`)
    return
  }
  const results = await Promise.allSettled([
    resend.emails.send({
      from: senderAddress(),
      to: [customerEmail],
      replyTo: adminEmail,
      subject: `Your ${pkg.name} package is ready`,
      html: `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#2b2b2b;line-height:1.6">
<h2 style="font-weight:normal">Thank you, ${esc(customerName)}</h2>
<p>Your <strong>${esc(pkg.name)}</strong> package is active: ${esc(pkg.summary)}.</p>
<p>You have <strong>${what}</strong> to use on or before <strong>${esc(validUntil)}</strong>.</p>
<p>To book, log in and choose a class on the calendar. Your package is applied automatically, so there is nothing to pay.</p>
${pkg.note ? `<p><em>${esc(pkg.note)}.</em></p>` : ''}
<p><a href="${site}/calendar" style="background:#4A6FA5;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Book a class</a></p>
<p style="color:#777;font-size:13px">Breathe Write</p></div>`,
    }),
    resend.emails.send({
      from: senderAddress(),
      to: [adminEmail],
      subject: `New package: ${pkg.name} – ${customerName}`,
      text: `${customerName} <${customerEmail}> bought ${pkg.name} (${pkg.summary}) for £${pkg.price.toFixed(2)}. Valid until ${validUntil}.`,
    }),
  ])
  results.forEach(r => {
    if (r.status === 'rejected') console.error('[EMAIL] Package email failed:', r.reason)
    else if (r.value.error) console.error('[EMAIL] Package email failed:', r.value.error)
  })
}
