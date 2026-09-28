import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { saveIntegration } from '@/lib/store'
import { GOOGLE_CALENDAR_SCOPE } from '@/lib/google-meet'
import { appBaseUrl } from '@/lib/url'

export async function GET(req: Request) {
  const base = await appBaseUrl()
  const session = await auth()
  // @ts-expect-error role is added in the auth callbacks
  if (session?.user?.role !== 'ADMIN') return NextResponse.redirect(`${base}/login`)

  const url = new URL(req.url)
  const jar = await cookies()
  const expectedState = jar.get('google_oauth_state')?.value
  jar.delete({ name: 'google_oauth_state', path: '/api/integrations/google' })

  const code = url.searchParams.get('code')
  if (!code || !expectedState || url.searchParams.get('state') !== expectedState) {
    return NextResponse.redirect(`${base}/admin?google=error`)
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${base}/api/integrations/google/callback`,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    console.error('[GOOGLE CONNECT] Token exchange failed:', await res.text())
    return NextResponse.redirect(`${base}/admin?google=error`)
  }

  const tokens = await res.json()
  if (!tokens.refresh_token || !String(tokens.scope || '').includes(GOOGLE_CALENDAR_SCOPE)) {
    console.error('[GOOGLE CONNECT] Missing refresh token or calendar permission.')
    return NextResponse.redirect(`${base}/admin?google=missing-permission`)
  }

  let accountEmail: string | null = null
  try {
    // The id_token comes straight from Google's token endpoint over TLS, so decoding without verifying is fine here.
    accountEmail = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64url').toString()).email ?? null
  } catch {}

  await saveIntegration('google', { refreshToken: tokens.refresh_token, accountEmail })
  return NextResponse.redirect(`${base}/admin?google=connected`)
}
