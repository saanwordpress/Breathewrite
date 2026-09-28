import { createZoomMeeting } from '@/lib/zoom'
import { addGoogleEventAttendee, createGoogleMeetEvent, deleteGoogleEvent } from '@/lib/google-meet'
import { getEventMeeting, saveEventMeetingIfEmpty, type MeetingInfo } from '@/lib/store'
import { minutesBetween } from '@/lib/time'

export type MeetingProvider = 'google' | 'zoom'

export function activeMeetingProvider(): MeetingProvider {
  return process.env.MEETING_PROVIDER === 'zoom' ? 'zoom' : 'google'
}

export function meetingProviderName(url: string | null | undefined): string {
  if (url?.includes('zoom.us')) return 'Zoom'
  if (url?.includes('meet.google.com')) return 'Google Meet'
  return 'online'
}

type ClassEvent = { id: string; title: string; date: string; startTime: string; endTime: string }

function devPlaceholder(provider: MeetingProvider): MeetingInfo {
  const letters = () => Math.random().toString(36).replace(/[^a-z]/g, '').padEnd(4, 'x')
  if (provider === 'google') {
    const url = `https://meet.google.com/${letters().slice(0, 3)}-${letters().slice(0, 4)}-${letters().slice(0, 3)}`
    return { provider: 'google', joinUrl: url, hostUrl: url }
  }
  const id = Math.floor(1000000000 + Math.random() * 9000000000).toString()
  return { provider: 'zoom', joinUrl: `https://zoom.us/j/${id}`, hostUrl: `https://zoom.us/s/${id}`, meetingId: id, password: 'breathewrite' }
}

async function createMeeting(event: ClassEvent, attendeeEmail: string): Promise<MeetingInfo | null> {
  const provider = activeMeetingProvider()

  if (provider === 'google') {
    const g = await createGoogleMeetEvent({ ...event, attendeeEmail })
    if (g) return { provider, joinUrl: g.joinUrl, hostUrl: g.joinUrl, meetingId: g.meetingId, externalEventId: g.externalEventId }
  } else {
    const durationMins = Math.max(minutesBetween(event.startTime, event.endTime), 15)
    const z = await createZoomMeeting({ topic: `Breathe Write: ${event.title}`, date: event.date, startTime: event.startTime, durationMins })
    if (z) return { provider, joinUrl: z.joinUrl, hostUrl: z.startUrl, meetingId: z.meetingId, password: z.password }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[MEETING DEV] ${provider} not configured — using a placeholder link.`)
    return devPlaceholder(provider)
  }
  return null
}

const inFlight = new Map<string, Promise<MeetingInfo | null>>()

// One meeting per class: created on the first booking, reused (and the customer added as a guest) afterwards.
export function ensureClassMeeting(event: ClassEvent, attendeeEmail: string): Promise<MeetingInfo | null> {
  const pending = inFlight.get(event.id)
  const work = (pending ?? Promise.resolve(null))
    .catch(() => null)
    .then(() => doEnsureClassMeeting(event, attendeeEmail))
    .finally(() => {
      if (inFlight.get(event.id) === work) inFlight.delete(event.id)
    })
  inFlight.set(event.id, work)
  return work
}

async function doEnsureClassMeeting(event: ClassEvent, attendeeEmail: string): Promise<MeetingInfo | null> {
  const existing = await getEventMeeting(event.id)
  if (existing) {
    if (existing.provider === 'google' && existing.externalEventId && attendeeEmail) {
      await addGoogleEventAttendee(existing.externalEventId, attendeeEmail)
    }
    return existing
  }

  const created = await createMeeting(event, attendeeEmail)
  if (!created) return null

  const stored = await saveEventMeetingIfEmpty(event.id, created)
  if (stored && stored.joinUrl !== created.joinUrl) {
    // Another server instance created the class meeting first; keep theirs.
    if (created.externalEventId) await deleteGoogleEvent(created.externalEventId)
    if (stored.provider === 'google' && stored.externalEventId && attendeeEmail) {
      await addGoogleEventAttendee(stored.externalEventId, attendeeEmail)
    }
  }
  return stored ?? created
}
