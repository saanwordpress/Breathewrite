import { BUSINESS_TIMEZONE } from '@/lib/time'

export type ZoomMeetingResult = {
  joinUrl: string
  startUrl: string
  meetingId?: string
  password?: string
}

function mockMeeting(): ZoomMeetingResult {
  const mockId = Math.floor(1000000000 + Math.random() * 9000000000)
  return {
    joinUrl: `https://zoom.us/j/${mockId}`,
    startUrl: `https://zoom.us/s/${mockId}`,
    meetingId: mockId.toString(),
    password: 'breathewrite',
  }
}

// Returns null when a real meeting could not be created, so callers never email a fake link in production.
export async function createZoomMeeting({
  topic,
  date,
  startTime,
  durationMins,
}: {
  topic: string
  date: string // "YYYY-MM-DD", UK local
  startTime: string // "HH:MM", UK local
  durationMins: number
}): Promise<ZoomMeetingResult | null> {
  const accountId = process.env.ZOOM_ACCOUNT_ID
  const clientId = process.env.ZOOM_CLIENT_ID
  const clientSecret = process.env.ZOOM_CLIENT_SECRET

  if (!accountId || !clientId || !clientSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[ZOOM] ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET are not set. No meeting created.')
      return null
    }
    console.warn('[ZOOM DEV] Zoom credentials missing. Using a placeholder meeting link.')
    return mockMeeting()
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenRes = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    if (!tokenRes.ok) {
      throw new Error(`Zoom OAuth failed (${tokenRes.status}): ${await tokenRes.text()}`)
    }
    const { access_token } = await tokenRes.json()

    const hostUser = process.env.ZOOM_HOST_USER_ID || 'me'
    const meetingRes = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(hostUser)}/meetings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        type: 2,
        // Local time without "Z" + timezone makes Zoom schedule the exact UK wall-clock time (BST/GMT aware).
        start_time: `${date}T${startTime}:00`,
        timezone: BUSINESS_TIMEZONE,
        duration: durationMins,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
        },
      }),
    })
    if (!meetingRes.ok) {
      throw new Error(`Zoom create meeting failed (${meetingRes.status}): ${await meetingRes.text()}`)
    }

    const meeting = await meetingRes.json()
    return {
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url || meeting.join_url,
      meetingId: meeting.id?.toString(),
      password: meeting.password,
    }
  } catch (error) {
    console.error('[ZOOM] Error creating meeting:', error)
    return null
  }
}
