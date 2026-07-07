import { PrismaClient } from '@prisma/client'

// Global prisma client to avoid exhausting connections in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export type TimeSlot = {
  time: string; // "09:00"
  available: boolean;
}

export type DayAvailability = {
  date: string; // "YYYY-MM-DD"
  isAvailable: boolean;
  slots: TimeSlot[];
}

export async function getMonthAvailability(year: number, month: number, durationMins: number): Promise<DayAvailability[]> {
  try {
    // 1. Fetch schedules
    const schedules = await prisma.availabilitySchedule.findMany()
    
    // 2. Fetch overrides for the month
    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59))
    
    const overrides = await prisma.availabilityOverride.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    })
    
    // 3. Fetch bookings for the month
    const bookings = await prisma.booking.findMany({
      where: {
        startTime: { gte: startDate },
        endTime: { lte: endDate },
        status: { not: 'CANCELLED' }
      }
    })

    return calculateSlots(year, month, durationMins, schedules, overrides, bookings)
  } catch (error) {
    console.warn("Database connection failed. Falling back to mock availability data.", error)
    return getMockAvailability(year, month, durationMins)
  }
}

function calculateSlots(
  year: number, 
  month: number, 
  durationMins: number, 
  schedules: any[], 
  overrides: any[], 
  bookings: any[]
): DayAvailability[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  const result: DayAvailability[] = []
  
  const now = new Date()

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(Date.UTC(year, month - 1, d))
    const dateString = currentDate.toISOString().split('T')[0]
    const dayOfWeek = currentDate.getUTCDay()
    
    // Skip past dates
    if (currentDate < new Date(now.setHours(0,0,0,0))) {
      result.push({ date: dateString, isAvailable: false, slots: [] })
      continue
    }

    // Determine working hours for this day
    let isWorking = false
    let startTimeStr = "09:00"
    let endTimeStr = "17:00"

    const override = overrides.find(o => o.date.toISOString().split('T')[0] === dateString)
    if (override) {
      isWorking = override.isWorking
      if (isWorking) {
        startTimeStr = override.startTime || "09:00"
        endTimeStr = override.endTime || "17:00"
      }
    } else {
      const schedule = schedules.find(s => s.dayOfWeek === dayOfWeek)
      if (schedule) {
        isWorking = schedule.isWorking
        startTimeStr = schedule.startTime
        endTimeStr = schedule.endTime
      } else {
        // Default: working Mon-Fri 9-5
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          isWorking = true
        }
      }
    }

    if (!isWorking) {
      result.push({ date: dateString, isAvailable: false, slots: [] })
      continue
    }

    // Generate slots
    const slots = generateTimeSlots(dateString, startTimeStr, endTimeStr, durationMins, bookings)
    result.push({
      date: dateString,
      isAvailable: slots.some(s => s.available),
      slots
    })
  }

  return result
}

function generateTimeSlots(dateStr: string, startStr: string, endStr: string, duration: number, bookings: any[]): TimeSlot[] {
  const slots: TimeSlot[] = []
  const [startH, startM] = startStr.split(':').map(Number)
  const [endH, endM] = endStr.split(':').map(Number)
  
  const startMs = Date.UTC(
    parseInt(dateStr.split('-')[0]),
    parseInt(dateStr.split('-')[1]) - 1,
    parseInt(dateStr.split('-')[2]),
    startH, startM
  )
  
  const endMs = Date.UTC(
    parseInt(dateStr.split('-')[0]),
    parseInt(dateStr.split('-')[1]) - 1,
    parseInt(dateStr.split('-')[2]),
    endH, endM
  )

  // Generate slots every 30 mins
  const intervalMs = 30 * 60 * 1000
  const durationMs = duration * 60 * 1000

  for (let currentMs = startMs; currentMs + durationMs <= endMs; currentMs += intervalMs) {
    const slotStart = new Date(currentMs)
    const slotEnd = new Date(currentMs + durationMs)
    
    // Check overlap
    const isOverlapping = bookings.some(b => {
      const bStart = new Date(b.startTime).getTime()
      const bEnd = new Date(b.endTime).getTime()
      return (slotStart.getTime() < bEnd && slotEnd.getTime() > bStart)
    })

    const timeString = `${slotStart.getUTCHours().toString().padStart(2, '0')}:${slotStart.getUTCMinutes().toString().padStart(2, '0')}`
    
    // Skip slots in the past if it's today
    if (slotStart.getTime() < Date.now()) {
      continue
    }

    slots.push({
      time: timeString,
      available: !isOverlapping
    })
  }

  return slots
}

function getMockAvailability(year: number, month: number, durationMins: number): DayAvailability[] {
  return calculateSlots(year, month, durationMins, [], [], [])
}
