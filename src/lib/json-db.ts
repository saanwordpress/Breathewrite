import fs from 'fs'
import path from 'path'

export type CalendarEventData = {
  id: string
  title: string
  date: string      // "YYYY-MM-DD"
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
  price: number
  isPublished: boolean
  deliveryMode?: 'ONLINE' | 'IN_PERSON'
  location?: string | null
  meetingProvider?: string
  meetingUrl?: string
  meetingHostUrl?: string
  meetingId?: string
  meetingPassword?: string
  externalEventId?: string
  createdAt: string
  updatedAt: string
}

export type IntegrationData = {
  provider: string
  accountEmail?: string | null
  refreshToken: string
  updatedAt: string
}

export type ClassTypeData = {
  id: string
  name: string
  price: number
  duration: number
  color: string
  isActive: boolean
}

export type ScheduleItemData = {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isWorking: boolean
}

export type OverrideData = {
  id: string
  date: string // "YYYY-MM-DD"
  isWorking: boolean
  startTime?: string | null
  endTime?: string | null
}

export type BookingData = {
  id: string
  userId: string
  offeringSlug: string
  title: string
  date: string
  startTime: string
  endTime: string
  pricePaid: number
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
  stripeSessionId?: string
  calendarEventId?: string
  customerEmail?: string
  meetingUrl?: string
  meetingHostUrl?: string
  meetingId?: string
  meetingPassword?: string
  createdAt: string
}

export type UserData = {
  id: string
  email: string
  name: string
  isMember: boolean
  membershipExpiresAt?: string
  stripeCustomerId?: string
  subscriptionId?: string
  passwordHash?: string
  role: 'ADMIN' | 'CUSTOMER'
  createdAt: string
}

interface DatabaseSchema {
  calendarEvents: CalendarEventData[]
  classTypes: ClassTypeData[]
  schedule: ScheduleItemData[]
  overrides: OverrideData[]
  bookings: BookingData[]
  users: UserData[]
  integrations?: IntegrationData[]
}

const DB_PATH = path.join(process.cwd(), '.data', 'store.json')

const DEFAULT_CLASS_TYPES: ClassTypeData[] = [
  { id: 'ct_bf', name: 'Breathe & Flow', price: 25, duration: 60, color: '#4A6FA5', isActive: true },
  { id: 'ct_bw', name: 'Breathe & Write', price: 25, duration: 90, color: '#6B8E6B', isActive: true },
  { id: 'ct_bg', name: 'Breathe & Go', price: 15, duration: 30, color: '#E8A838', isActive: true },
  { id: 'ct_nb', name: 'Neurodynamic Breathwork', price: 30, duration: 90, color: '#9B6B9B', isActive: true },
  { id: 'ct_p60', name: 'Private 1:1 Session | 60 mins', price: 65, duration: 60, color: '#C4766E', isActive: true },
  { id: 'ct_p120', name: 'Private 1:1 Session | 120 mins', price: 120, duration: 120, color: '#8B7355', isActive: true },
  { id: 'ct_bm', name: 'Breathe & Move', price: 25, duration: 60, color: '#2E8B57', isActive: true },
  { id: 'ct_cw', name: 'Corporate Wellness', price: 150, duration: 60, color: '#4682B4', isActive: true },
]

const DEFAULT_SCHEDULE: ScheduleItemData[] = [
  { id: 'sch_0', dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isWorking: false },
  { id: 'sch_1', dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isWorking: true },
  { id: 'sch_2', dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isWorking: true },
  { id: 'sch_3', dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isWorking: true },
  { id: 'sch_4', dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isWorking: true },
  { id: 'sch_5', dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isWorking: true },
  { id: 'sch_6', dayOfWeek: 6, startTime: "09:00", endTime: "17:00", isWorking: false },
]

const REMOVED_CLASSES = ['Deep Relaxation', 'Energizing Breathwork']

function readDb(): DatabaseSchema {
  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(DB_PATH)) {
      const initial: DatabaseSchema = {
        calendarEvents: [],
        classTypes: DEFAULT_CLASS_TYPES,
        schedule: DEFAULT_SCHEDULE,
        overrides: [],
        bookings: [],
        users: [],
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    const data = JSON.parse(raw) as DatabaseSchema
    
    if (!data.bookings) data.bookings = []
    if (!data.users) data.users = []

    if (data.classTypes) {
      data.classTypes = data.classTypes.filter(ct => !REMOVED_CLASSES.includes(ct.name))
    }

    if (!data.classTypes || data.classTypes.length === 0) {
      data.classTypes = DEFAULT_CLASS_TYPES
    } else {
      DEFAULT_CLASS_TYPES.forEach(def => {
        const existing = data.classTypes.find(ct => ct.name === def.name)
        if (!existing) {
          data.classTypes.push(def)
        }
      })

      const uniqueNames = new Set<string>()
      data.classTypes = data.classTypes.filter(ct => {
        if (uniqueNames.has(ct.name)) return false
        uniqueNames.add(ct.name)
        return true
      }).map((ct, idx) => ({
        ...ct,
        id: ct.id || `ct_${idx}_${Date.now()}`
      }))
    }
    if (!data.schedule || data.schedule.length === 0) {
      data.schedule = DEFAULT_SCHEDULE
    }
    return data
  } catch (err) {
    console.error('Error reading JSON DB:', err)
    return {
      calendarEvents: [],
      classTypes: DEFAULT_CLASS_TYPES,
      schedule: DEFAULT_SCHEDULE,
      overrides: [],
      bookings: [],
      users: [],
    }
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing JSON DB:', err)
  }
}

// Calendar Events
export function jsonGetCalendarEvents(year: number, month: number, adminView = false) {
  const db = readDb()
  const monthStr = month.toString().padStart(2, '0')
  const prefix = `${year}-${monthStr}-`

  return db.calendarEvents.filter(e => {
    if (!e.date.startsWith(prefix)) return false
    if (!adminView && !e.isPublished) return false
    return true
  }).map(e => ({
    ...e,
    bookingsCount: db.bookings.filter(b => b.calendarEventId === e.id && b.status !== 'CANCELLED').length
  }))
}

export function jsonGetCalendarEventById(id: string) {
  const db = readDb()
  const event = db.calendarEvents.find(e => e.id === id)
  if (!event) return null
  return {
    ...event,
    bookingsCount: db.bookings.filter(b => b.calendarEventId === id && b.status !== 'CANCELLED').length,
  }
}

export function jsonUpsertCalendarEvent(event: { id?: string; title: string; date: string; startTime: string; endTime: string; price: number; deliveryMode: 'ONLINE' | 'IN_PERSON'; location?: string | null }) {
  const db = readDb()
  const now = new Date().toISOString()

  if (event.id) {
    const idx = db.calendarEvents.findIndex(e => e.id === event.id)
    if (idx !== -1) {
      db.calendarEvents[idx] = {
        ...db.calendarEvents[idx],
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        price: event.price,
        deliveryMode: event.deliveryMode,
        location: event.location ?? null,
        updatedAt: now,
      }
    } else {
      db.calendarEvents.push({
        id: event.id,
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        price: event.price,
        deliveryMode: event.deliveryMode,
        location: event.location ?? null,
        isPublished: false,
        createdAt: now,
        updatedAt: now,
      })
    }
  } else {
    const newId = 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    db.calendarEvents.push({
      id: newId,
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      price: event.price,
      deliveryMode: event.deliveryMode,
      location: event.location ?? null,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    })
  }

  writeDb(db)
  return true
}

export function jsonDeleteCalendarEvent(id: string) {
  const db = readDb()
  db.calendarEvents = db.calendarEvents.filter(e => e.id !== id)
  writeDb(db)
  return true
}

export function jsonPublishMonthCalendar(year: number, month: number) {
  const db = readDb()
  const monthStr = month.toString().padStart(2, '0')
  const prefix = `${year}-${monthStr}-`

  db.calendarEvents.forEach(e => {
    if (e.date.startsWith(prefix)) {
      e.isPublished = true
      e.updatedAt = new Date().toISOString()
    }
  })

  writeDb(db)
  return true
}

// Class Types
export function jsonGetClassTypes() {
  const db = readDb()
  return db.classTypes.filter(ct => ct.isActive)
}

export function jsonUpsertClassType(data: { id?: string; name: string; price: number; duration?: number; color?: string }) {
  const db = readDb()
  if (data.id) {
    const idx = db.classTypes.findIndex(ct => ct.id === data.id)
    if (idx !== -1) {
      db.classTypes[idx] = {
        ...db.classTypes[idx],
        name: data.name,
        price: data.price,
        duration: data.duration ?? db.classTypes[idx].duration,
        color: data.color ?? db.classTypes[idx].color,
      }
    }
  } else {
    const newId = 'ct_' + Date.now()
    db.classTypes.push({
      id: newId,
      name: data.name,
      price: data.price,
      duration: data.duration ?? 60,
      color: data.color ?? '#4A6FA5',
      isActive: true,
    })
  }
  writeDb(db)
  return true
}

export function jsonDeleteClassType(id: string) {
  const db = readDb()
  const idx = db.classTypes.findIndex(ct => ct.id === id)
  if (idx !== -1) {
    db.classTypes[idx].isActive = false
  }
  writeDb(db)
  return true
}

// Schedule & Overrides
export function jsonGetSchedule() {
  const db = readDb()
  return db.schedule
}

export function jsonSaveSchedule(scheduleItems: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }[]) {
  const db = readDb()
  scheduleItems.forEach(item => {
    const idx = db.schedule.findIndex(s => s.dayOfWeek === item.dayOfWeek)
    if (idx !== -1) {
      db.schedule[idx] = { ...db.schedule[idx], ...item }
    } else {
      db.schedule.push({ id: 'sch_' + item.dayOfWeek, ...item })
    }
  })
  writeDb(db)
  return true
}

export function jsonGetOverrides() {
  const db = readDb()
  return db.overrides
}

export function jsonAddOverride(dateStr: string, isWorking: boolean, startTime?: string, endTime?: string) {
  const db = readDb()
  const idx = db.overrides.findIndex(o => o.date === dateStr)
  if (idx !== -1) {
    db.overrides[idx] = { id: db.overrides[idx].id, date: dateStr, isWorking, startTime, endTime }
  } else {
    db.overrides.push({ id: 'ovr_' + Date.now(), date: dateStr, isWorking, startTime, endTime })
  }
  writeDb(db)
  return true
}

export function jsonDeleteOverride(id: string) {
  const db = readDb()
  db.overrides = db.overrides.filter(o => o.id !== id)
  writeDb(db)
  return true
}

// Bookings & Users
export function jsonCreateBooking(booking: Omit<BookingData, 'id' | 'createdAt'>): BookingData {
  const db = readDb()
  const newBooking: BookingData = {
    ...booking,
    id: 'bk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    createdAt: new Date().toISOString(),
  }
  db.bookings.push(newBooking)
  writeDb(db)
  return newBooking
}

export function jsonGetBookings(userId?: string): BookingData[] {
  const db = readDb()
  if (userId) {
    return db.bookings.filter(b => b.userId === userId)
  }
  return db.bookings
}

export function jsonFindBooking(predicate: (b: BookingData) => boolean): BookingData | null {
  const db = readDb()
  return db.bookings.find(predicate) || null
}

export function jsonUpdateUser(userId: string, patch: Partial<Omit<UserData, 'id' | 'createdAt'>>) {
  const db = readDb()
  const user = db.users.find(u => u.id === userId)
  if (user) {
    Object.assign(user, patch)
  } else {
    db.users.push({
      id: userId,
      email: '',
      name: '',
      isMember: false,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
      ...patch,
    })
  }
  writeDb(db)
  return true
}

export function jsonFindUserByEmail(email: string): UserData | null {
  return readDb().users.find(u => u.email === email) || null
}

export function jsonUpsertUserByEmail(email: string, name: string): string {
  const db = readDb()
  const existing = db.users.find(u => u.email === email)
  if (existing) return existing.id
  const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
  db.users.push({ id, email, name, isMember: false, role: 'CUSTOMER', createdAt: new Date().toISOString() })
  writeDb(db)
  return id
}

export function jsonGetUser(userId: string): UserData | null {
  const db = readDb()
  return db.users.find(u => u.id === userId) || null
}

export function jsonFindUserBySubscription(subscriptionId: string): UserData | null {
  const db = readDb()
  return db.users.find(u => u.subscriptionId === subscriptionId) || null
}

type EventMeetingFields = Pick<CalendarEventData, 'meetingProvider' | 'meetingUrl' | 'meetingHostUrl' | 'meetingId' | 'meetingPassword' | 'externalEventId'>

export function jsonSetEventMeetingIfEmpty(eventId: string, meeting: EventMeetingFields): CalendarEventData | null {
  const db = readDb()
  const event = db.calendarEvents.find(e => e.id === eventId)
  if (!event) return null
  if (!event.meetingUrl) {
    Object.assign(event, meeting, { updatedAt: new Date().toISOString() })
    writeDb(db)
  }
  return event
}

export function jsonGetIntegration(provider: string): IntegrationData | null {
  return readDb().integrations?.find(i => i.provider === provider) || null
}

export function jsonSaveIntegration(provider: string, data: { refreshToken: string; accountEmail?: string | null }) {
  const db = readDb()
  db.integrations = (db.integrations || []).filter(i => i.provider !== provider)
  db.integrations.push({ provider, ...data, updatedAt: new Date().toISOString() })
  writeDb(db)
}

export function jsonDeleteIntegration(provider: string) {
  const db = readDb()
  db.integrations = (db.integrations || []).filter(i => i.provider !== provider)
  writeDb(db)
}
