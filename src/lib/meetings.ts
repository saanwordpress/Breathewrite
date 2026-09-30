import { createZoomMeeting } from '@/lib/zoom'
import { getEventMeeting, saveEventMeetingIfEmpty, type MeetingInfo } from '@/lib/store'
import { minutesBetween } from '@/lib/time'

export function meetingProviderName(url: string | null | undefined): string {
  if (url?.includes('meet.google.com')) return 'Google Meet'
  return 'Zoom'
}

type ClassEvent = { id: string; title: string; date: string; startTime: string; endTime: string }

const inFlight = new Map<string, Promise<MeetingInfo | null>>()

// One Zoom meeting per class: created on the first booking and shared by everyone booked into it.
export function ensureClassMeeting(event: ClassEvent): Promise<MeetingInfo | null> {
  const pending = inFlight.get(event.id)
  const work = (pending ?? Promise.resolve(null))
    .catch(() => null)
    .then(() => doEnsureClassMeeting(event))
    .finally(() => {
      if (inFlight.get(event.id) === work) inFlight.delete(event.id)
    })
  inFlight.set(event.id, work)
  return work
}

async function doEnsureClassMeeting(event: ClassEvent): Promise<MeetingInfo | null> {
  const existing = await getEventMeeting(event.id)
  if (existing) return existing

  const durationMins = Math.max(minutesBetween(event.startTime, event.endTime), 15)
  const zoom = await createZoomMeeting({ topic: `Breathe Write: ${event.title}`, date: event.date, startTime: event.startTime, durationMins })
  if (!zoom) return null

  const created: MeetingInfo = { provider: 'zoom', joinUrl: zoom.joinUrl, hostUrl: zoom.startUrl, meetingId: zoom.meetingId, password: zoom.password }
  return (await saveEventMeetingIfEmpty(event.id, created)) ?? created
}
