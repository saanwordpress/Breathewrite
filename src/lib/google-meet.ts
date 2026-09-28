import { randomUUID } from 'crypto'
import { BUSINESS_TIMEZONE } from '@/lib/time'
import { getIntegration } from '@/lib/store'

export const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

export function googleOAuthConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

let cachedToken: { token: string; refreshToken: string; expiresAt: number } | null = null

async function accessToken(): Promise<string | null> {
  if (!googleOAuthConfigured()) return null
  const integration = await getIntegration('google')
  if (!integration) {
    console.error('[GOOGLE MEET] No Google account connected. Connect it from the admin dashboard.')
    return null
  }
  if (cachedToken && cachedToken.refreshToken === integration.refreshToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: integration.refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) {
    console.error(`[GOOGLE MEET] Token refresh failed (${res.status}). Reconnect Google in the admin dashboard.`, await res.text())
    return null
  }
  const data = await res.json()
  cachedToken = { token: data.access_token, refreshToken: integration.refreshToken, expiresAt: Date.now() + data.expires_in * 1000 }
  return cachedToken.token
}

const CAL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

type GoogleEvent = {
  id: string
  hangoutLink?: string
  attendees?: { email: string }[]
  conferenceData?: {
    conferenceId?: string
    createRequest?: { status?: { statusCode?: string } }
    entryPoints?: { entryPointType: string; uri: string }[]
  }
}

function meetLink(e: GoogleEvent): string | undefined {
  return e.hangoutLink || e.conferenceData?.entryPoints?.find(p => p.entryPointType === 'video')?.uri
}

export async function createGoogleMeetEvent({
  title,
  date,
  startTime,
  endTime,
  attendeeEmail,
}: {
  title: string
  date: string
  startTime: string
  endTime: string
  attendeeEmail?: string
}): Promise<{ joinUrl: string; meetingId?: string; externalEventId: string } | null> {
  const token = await accessToken()
  if (!token) return null

  try {
    const res = await fetch(`${CAL}?conferenceDataVersion=1&sendUpdates=all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: `Breathe Write: ${title}`,
        description: 'Live online session with Breathe Write. Please join a few minutes early from a quiet, comfortable space.',
        start: { dateTime: `${date}T${startTime}:00`, timeZone: BUSINESS_TIMEZONE },
        end: { dateTime: `${date}T${endTime}:00`, timeZone: BUSINESS_TIMEZONE },
        attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
        guestsCanSeeOtherGuests: false,
        guestsCanInviteOthers: false,
        conferenceData: {
          createRequest: { requestId: randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } },
        },
      }),
    })
    if (!res.ok) throw new Error(`Calendar insert failed (${res.status}): ${await res.text()}`)
    let event: GoogleEvent = await res.json()

    // Meet creation is usually immediate, but Google may report it as pending.
    for (let i = 0; !meetLink(event) && i < 5; i++) {
      await new Promise(r => setTimeout(r, 1000))
      const again = await fetch(`${CAL}/${event.id}`, { headers: { Authorization: `Bearer ${token}` } })
      if (again.ok) event = await again.json()
    }

    const joinUrl = meetLink(event)
    if (!joinUrl) throw new Error(`Google did not return a Meet link for event ${event.id}`)
    return { joinUrl, meetingId: event.conferenceData?.conferenceId, externalEventId: event.id }
  } catch (error) {
    console.error('[GOOGLE MEET] Error creating meeting:', error)
    return null
  }
}

// Adds a customer to the class's calendar invite so they also get Google's own invite + reminders.
export async function addGoogleEventAttendee(externalEventId: string, email: string) {
  const token = await accessToken()
  if (!token) return
  try {
    const res = await fetch(`${CAL}/${externalEventId}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) throw new Error(`Calendar get failed (${res.status})`)
    const event: GoogleEvent = await res.json()
    const attendees = event.attendees ?? []
    if (attendees.some(a => a.email.toLowerCase() === email.toLowerCase())) return

    const patch = await fetch(`${CAL}/${externalEventId}?sendUpdates=all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendees: [...attendees, { email }] }),
    })
    if (!patch.ok) throw new Error(`Calendar patch failed (${patch.status}): ${await patch.text()}`)
  } catch (error) {
    console.error('[GOOGLE MEET] Could not add attendee:', error)
  }
}

export async function deleteGoogleEvent(externalEventId: string) {
  const token = await accessToken()
  if (!token) return
  await fetch(`${CAL}/${externalEventId}?sendUpdates=none`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {})
}
