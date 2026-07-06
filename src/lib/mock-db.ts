import fs from 'fs/promises'
import path from 'path'
import os from 'os'

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  capacity: string;
  status: string;
  price?: string;
  isPublic?: boolean;
  type?: string;
}

// Use /tmp in production (Vercel) because the regular file system is read-only
const isProd = process.env.NODE_ENV === 'production'
const dbPath = isProd 
  ? path.join(os.tmpdir(), 'events.json')
  : path.join(process.cwd(), 'data', 'events.json')

const INITIAL_EVENTS: Event[] = [
  { id: '1', title: 'Breathe & Flow', date: 'Jul 10, 2026', time: '10:00 AM', capacity: '15/20', status: 'UPCOMING', price: '35', isPublic: true },
  { id: '2', title: 'Breathe & Flow', date: 'Jul 12, 2026', time: '06:00 PM', capacity: '20/20', status: 'FULL', price: '35', isPublic: true },
  { id: '3', title: 'Breathe & Go', date: 'Jul 14, 2026', time: '12:00 PM', capacity: '8/25', status: 'UPCOMING', price: '15', isPublic: true },
]

export async function getEvents(): Promise<Event[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, create it with initial data
    await fs.mkdir(path.dirname(dbPath), { recursive: true })
    await fs.writeFile(dbPath, JSON.stringify(INITIAL_EVENTS, null, 2))
    return INITIAL_EVENTS
  }
}

export async function addEvent(event: Omit<Event, 'id'>): Promise<void> {
  const events = await getEvents()
  
  // Format the date to something nicer if it's YYYY-MM-DD
  let formattedDate = event.date
  if (event.date.includes('-')) {
    const dateObj = new Date(event.date)
    formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }
  
  // Format the time to 12-hour AM/PM
  let formattedTime = event.time
  if (event.time.includes(':') && !event.time.includes('M')) {
    const [h, m] = event.time.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    formattedTime = `${formattedHour}:${m} ${ampm}`
  }

  const newEvent: Event = {
    ...event,
    date: formattedDate,
    time: formattedTime,
    id: Date.now().toString(),
  }
  
  events.push(newEvent)
  await fs.writeFile(dbPath, JSON.stringify(events, null, 2))
}
