import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { GOOGLE_CALENDAR_SCOPE, googleOAuthConfigured } from '@/lib/google-meet'
import { appBaseUrl } from '@/lib/url'

export async function GET() {
  const session = await auth()
  // @ts-expect-error role is added in the auth callbacks
  if (session?.user?.role !== 'ADMIN') return NextResponse.redirect(`${await appBaseUrl()}/login`)
  if (!googleOAuthConfigured()) return NextResponse.redirect(`${await appBaseUrl()}/admin?google=not-configured`)

  const state = randomBytes(24).toString('hex')
  ;(await cookies()).set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/integrations/google',
  })

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${await appBaseUrl()}/api/integrations/google/callback`,
    response_type: 'code',
    scope: `openid email ${GOOGLE_CALENDAR_SCOPE}`,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
