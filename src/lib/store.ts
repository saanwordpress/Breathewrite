import { prisma } from '@/lib/prisma'
import {
  jsonCreateBooking,
  jsonDeleteIntegration,
  jsonFindBooking,
  jsonFindUserBySubscription,
  jsonGetBookings,
  jsonGetCalendarEventById,
  jsonGetIntegration,
  jsonGetUser,
  jsonSaveIntegration,
  jsonSetEventMeetingIfEmpty,
  jsonUpdateUser,
  jsonUpsertUserByEmail,
} from '@/lib/json-db'

// Supabase (via Prisma) when DATABASE_URL is set; the local .data/store.json file otherwise (dev only).

export type MeetingInfo = {
  provider: string
  joinUrl: string
  hostUrl: string
  meetingId?: string | null
  password?: string | null
  externalEventId?: string | null
}

export type MemberRecord = {
  id: string
  isMember: boolean
  membershipExpiresAt: string | null
  stripeCustomerId: string | null
}

export type BookingRecord = {
  id: string
  userId: string
  calendarEventId: string | null
  title: string
  date: string
  startTime: string
  endTime: string
  pricePaid: number
  status: string
  meetingUrl: string | null
  meetingHostUrl: string | null
  meetingId: string | null
  meetingPassword: string | null
}

export type NewBooking = {
  userId: string
  calendarEventId: string
  offeringSlug: string
  title: string
  date: string
  startTime: string
  endTime: string
  startUtc: Date
  endUtc: Date
  pricePaid: number
  customerEmail: string
  stripeSessionId?: string
  meeting: MeetingInfo | null
}

// ---------- Users / membership ----------

// Customers have no login; they are identified by the email entered at checkout.
export async function upsertCustomer(email: string, name: string): Promise<string> {
  if (prisma) {
    const u = await prisma.user.upsert({
      where: { email },
      create: { email, name },
      update: {},
      select: { id: true },
    })
    return u.id
  }
  return jsonUpsertUserByEmail(email, name)
}

export async function getMember(userId: string): Promise<MemberRecord | null> {
  if (prisma) {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isMember: true, membershipExpiresAt: true, stripeCustomerId: true },
    })
    return u ? { ...u, membershipExpiresAt: u.membershipExpiresAt?.toISOString() ?? null } : null
  }
  const u = jsonGetUser(userId)
  return u
    ? { id: u.id, isMember: u.isMember, membershipExpiresAt: u.membershipExpiresAt ?? null, stripeCustomerId: u.stripeCustomerId ?? null }
    : null
}

export async function updateMember(
  userId: string,
  patch: { isMember?: boolean; membershipExpiresAt?: Date; stripeCustomerId?: string; subscriptionId?: string | null }
) {
  if (prisma) {
    await prisma.user.update({ where: { id: userId }, data: patch })
    return
  }
  jsonUpdateUser(userId, {
    ...(patch.isMember !== undefined && { isMember: patch.isMember }),
    ...(patch.membershipExpiresAt && { membershipExpiresAt: patch.membershipExpiresAt.toISOString() }),
    ...(patch.stripeCustomerId && { stripeCustomerId: patch.stripeCustomerId }),
    ...(patch.subscriptionId !== undefined && { subscriptionId: patch.subscriptionId ?? undefined }),
  })
}

export async function findMemberIdBySubscription(subscriptionId: string): Promise<string | null> {
  if (prisma) {
    const u = await prisma.user.findUnique({ where: { subscriptionId }, select: { id: true } })
    return u?.id ?? null
  }
  return jsonFindUserBySubscription(subscriptionId)?.id ?? null
}

// ---------- Bookings ----------

type PrismaBookingWithEvent = {
  id: string
  userId: string
  calendarEventId: string | null
  offeringSlug: string
  pricePaid: number
  status: string
  meetingUrl: string | null
  meetingHostUrl: string | null
  meetingId: string | null
  meetingPassword: string | null
  calendarEvent: { title: string; date: Date; startTime: string; endTime: string } | null
}

function fromPrisma(b: PrismaBookingWithEvent): BookingRecord {
  return {
    id: b.id,
    userId: b.userId,
    calendarEventId: b.calendarEventId,
    title: b.calendarEvent?.title ?? b.offeringSlug,
    date: b.calendarEvent?.date.toISOString().slice(0, 10) ?? '',
    startTime: b.calendarEvent?.startTime ?? '',
    endTime: b.calendarEvent?.endTime ?? '',
    pricePaid: b.pricePaid,
    status: b.status,
    meetingUrl: b.meetingUrl,
    meetingHostUrl: b.meetingHostUrl,
    meetingId: b.meetingId,
    meetingPassword: b.meetingPassword,
  }
}

function fromJson(b: NonNullable<ReturnType<typeof jsonFindBooking>>): BookingRecord {
  return {
    id: b.id,
    userId: b.userId,
    calendarEventId: b.calendarEventId ?? null,
    title: b.title,
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    pricePaid: b.pricePaid,
    status: b.status,
    meetingUrl: b.meetingUrl ?? null,
    meetingHostUrl: b.meetingHostUrl ?? null,
    meetingId: b.meetingId ?? null,
    meetingPassword: b.meetingPassword ?? null,
  }
}

const withEvent = { calendarEvent: { select: { title: true, date: true, startTime: true, endTime: true } } } as const

export async function getBookingById(id: string): Promise<(BookingRecord & { customerEmail: string | null }) | null> {
  if (prisma) {
    const b = await prisma.booking.findUnique({ where: { id }, include: withEvent })
    return b ? { ...fromPrisma(b), customerEmail: b.customerEmail } : null
  }
  const b = jsonFindBooking(x => x.id === id)
  return b ? { ...fromJson(b), customerEmail: b.customerEmail ?? null } : null
}

export async function findBookingByStripeSession(stripeSessionId: string): Promise<BookingRecord | null> {
  if (prisma) {
    const b = await prisma.booking.findUnique({ where: { stripeSessionId }, include: withEvent })
    return b ? fromPrisma(b) : null
  }
  const b = jsonFindBooking(x => x.stripeSessionId === stripeSessionId)
  return b ? fromJson(b) : null
}

export async function findUserBookingForEvent(userId: string, calendarEventId: string): Promise<BookingRecord | null> {
  if (prisma) {
    const b = await prisma.booking.findFirst({
      where: { userId, calendarEventId, status: 'CONFIRMED' },
      include: withEvent,
    })
    return b ? fromPrisma(b) : null
  }
  const b = jsonFindBooking(x => x.userId === userId && x.calendarEventId === calendarEventId && x.status === 'CONFIRMED')
  return b ? fromJson(b) : null
}

export async function createBooking(data: NewBooking): Promise<BookingRecord> {
  const meeting = {
    meetingUrl: data.meeting?.joinUrl,
    meetingHostUrl: data.meeting?.hostUrl,
    meetingId: data.meeting?.meetingId ?? undefined,
    meetingPassword: data.meeting?.password ?? undefined,
  }
  if (prisma) {
    const b = await prisma.booking.create({
      data: {
        userId: data.userId,
        calendarEventId: data.calendarEventId,
        offeringSlug: data.offeringSlug,
        startTime: data.startUtc,
        endTime: data.endUtc,
        pricePaid: data.pricePaid,
        status: 'CONFIRMED',
        stripeSessionId: data.stripeSessionId,
        customerEmail: data.customerEmail,
        ...meeting,
      },
      include: withEvent,
    })
    return fromPrisma(b)
  }
  return fromJson(
    jsonCreateBooking({
      userId: data.userId,
      calendarEventId: data.calendarEventId,
      offeringSlug: data.offeringSlug,
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      pricePaid: data.pricePaid,
      status: 'CONFIRMED',
      stripeSessionId: data.stripeSessionId,
      customerEmail: data.customerEmail,
      ...meeting,
    })
  )
}

export async function listUserBookings(userId: string): Promise<BookingRecord[]> {
  if (prisma) {
    const rows = await prisma.booking.findMany({
      where: { userId, status: 'CONFIRMED' },
      include: withEvent,
      orderBy: { startTime: 'asc' },
    })
    return rows.map(fromPrisma)
  }
  return jsonGetBookings(userId).filter(b => b.status === 'CONFIRMED').map(fromJson)
}

export async function addAdminNotification(message: string) {
  if (!prisma) return
  await prisma.notification.create({ data: { message } }).catch(err => console.warn('Notification skipped:', err?.message))
}

// ---------- Class meeting (one per calendar event) ----------

export async function getEventMeeting(eventId: string): Promise<MeetingInfo | null> {
  const e = prisma
    ? await prisma.calendarEvent.findUnique({ where: { id: eventId } })
    : jsonGetCalendarEventById(eventId)
  if (!e?.meetingUrl) return null
  return {
    provider: e.meetingProvider ?? 'unknown',
    joinUrl: e.meetingUrl,
    hostUrl: e.meetingHostUrl ?? e.meetingUrl,
    meetingId: e.meetingId,
    password: e.meetingPassword,
    externalEventId: e.externalEventId,
  }
}

// Returns the meeting that ended up stored (someone else's if a concurrent booking won the race).
export async function saveEventMeetingIfEmpty(eventId: string, m: MeetingInfo): Promise<MeetingInfo | null> {
  const fields = {
    meetingProvider: m.provider,
    meetingUrl: m.joinUrl,
    meetingHostUrl: m.hostUrl,
    meetingId: m.meetingId ?? undefined,
    meetingPassword: m.password ?? undefined,
    externalEventId: m.externalEventId ?? undefined,
  }
  if (prisma) {
    await prisma.calendarEvent.updateMany({ where: { id: eventId, meetingUrl: null }, data: fields })
  } else {
    jsonSetEventMeetingIfEmpty(eventId, fields)
  }
  return getEventMeeting(eventId)
}

// ---------- Integrations (e.g. the admin's Google account) ----------

export async function getIntegration(provider: string): Promise<{ refreshToken: string; accountEmail: string | null } | null> {
  if (prisma) {
    const row = await prisma.integrationCredential.findUnique({ where: { provider } })
    return row ? { refreshToken: row.refreshToken, accountEmail: row.accountEmail } : null
  }
  const row = jsonGetIntegration(provider)
  return row ? { refreshToken: row.refreshToken, accountEmail: row.accountEmail ?? null } : null
}

export async function saveIntegration(provider: string, data: { refreshToken: string; accountEmail: string | null }) {
  if (prisma) {
    await prisma.integrationCredential.upsert({
      where: { provider },
      create: { provider, ...data },
      update: data,
    })
    return
  }
  jsonSaveIntegration(provider, data)
}

export async function deleteIntegration(provider: string) {
  if (prisma) {
    await prisma.integrationCredential.deleteMany({ where: { provider } })
    return
  }
  jsonDeleteIntegration(provider)
}
