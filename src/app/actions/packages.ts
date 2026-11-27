'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getAccount } from '@/lib/store'
import { getPackage } from '@/lib/packages'
import { createPayment, gbp, isMollieConfigured, updatePayment } from '@/lib/mollie'
import { mollieWebhookUrl } from '@/lib/bookings'
import { appBaseUrl } from '@/lib/url'

export type PackageCheckoutResult = { error: string } | undefined

// Packages need an account so credits can be applied when the member books. Guests are sent to sign up first.
export async function buyPackage(slug: string): Promise<PackageCheckoutResult> {
  const pkg = getPackage(slug)
  if (!pkg) return { error: 'This package is no longer available.' }

  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role === 'ADMIN') return { error: 'You are logged in as admin. Log out and use a member account to buy a package.' }
  const account = session?.user?.id ? await getAccount(session.user.id) : null
  if (!account?.email) redirect(`/signup?callbackUrl=${encodeURIComponent(`/packages?buy=${pkg.slug}`)}`)

  if (!isMollieConfigured()) {
    console.error('[PACKAGES] MOLLIE_API_KEY is not configured.')
    return { error: 'Online payments are temporarily unavailable. Please contact us.' }
  }

  const baseUrl = await appBaseUrl()
  let checkoutUrl: string | null = null
  try {
    const payment = await createPayment({
      amount: gbp(pkg.price),
      description: `Breathe Write ${pkg.name} package: ${pkg.summary}`,
      redirectUrl: `${baseUrl}/book/confirmed`,
      cancelUrl: `${baseUrl}/packages?buy=${pkg.slug}&canceled=true`,
      webhookUrl: mollieWebhookUrl(baseUrl),
      metadata: {
        type: 'package',
        packageSlug: pkg.slug,
        userId: account.id,
        customerEmail: account.email,
        customerName: account.name || account.email.split('@')[0],
      },
    })
    await updatePayment(payment.id, { redirectUrl: `${baseUrl}/book/confirmed?payment_id=${payment.id}` })
    checkoutUrl = payment._links.checkout?.href ?? null
  } catch (error) {
    console.error('[PACKAGES] Mollie payment creation failed:', error)
  }
  if (!checkoutUrl) return { error: 'We could not start the payment. Please try again in a moment.' }
  redirect(checkoutUrl)
}
