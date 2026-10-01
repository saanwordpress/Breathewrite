'use server'

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  jsonGetCalendarEvents,
  jsonGetCalendarEventById,
  jsonUpsertCalendarEvent,
  jsonDeleteCalendarEvent,
  jsonPublishMonthCalendar,
} from "@/lib/json-db"

export type CalendarEventData = {
  id?: string
  title: string
  date: string      // "YYYY-MM-DD"
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
  price: number
  deliveryMode: 'ONLINE' | 'IN_PERSON'
  location?: string | null
}

export type CalendarEventWithId = CalendarEventData & { 
  id: string 
  isPublished: boolean
}

// Get all calendar events for a month (admin sees drafts too)
export async function getCalendarEvents(year: number, month: number, adminView = false) {
  if (prisma) {
    try {
      const startDate = new Date(Date.UTC(year, month - 1, 1))
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59))

      const events = await prisma.calendarEvent.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          ...(adminView ? {} : { isPublished: true }),
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        include: {
          _count: {
            select: { bookings: { where: { status: { not: 'CANCELLED' } } } }
          }
        }
      })

      return events.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date.toISOString().split('T')[0],
        startTime: e.startTime,
        endTime: e.endTime,
        price: e.price,
        deliveryMode: e.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' as const : 'ONLINE' as const,
        location: e.location,
        isPublished: e.isPublished,
        bookingsCount: e._count.bookings,
      }))
    } catch (error) {
      console.warn('DB query failed, using local storage fallback for getCalendarEvents:', error)
    }
  }

  // Local JSON store fallback
  return jsonGetCalendarEvents(year, month, adminView)
}

// Create or update a calendar event
export async function upsertCalendarEvent(input: CalendarEventData): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  const data: CalendarEventData = {
    ...input,
    deliveryMode: input.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE',
    location: input.deliveryMode === 'IN_PERSON' ? String(input.location ?? '').trim().slice(0, 300) || null : null,
  }

  if (prisma) {
    try {
      const [year, month, day] = data.date.split('-').map(Number)
      const eventDate = new Date(Date.UTC(year, month - 1, day))

      if (data.id) {
        // Update existing event
        await prisma.calendarEvent.update({
          where: { id: data.id },
          data: {
            title: data.title,
            date: eventDate,
            startTime: data.startTime,
            endTime: data.endTime,
            price: data.price,
            deliveryMode: data.deliveryMode,
            location: data.location || null,
          },
        })
      } else {
        // Create new event
        await prisma.calendarEvent.create({
          data: {
            title: data.title,
            date: eventDate,
            startTime: data.startTime,
            endTime: data.endTime,
            price: data.price,
            deliveryMode: data.deliveryMode,
            location: data.location || null,
            isPublished: false,
          },
        })
      }

      revalidatePath('/admin/schedule')
      revalidatePath('/calendar')
      return { success: true }
    } catch (error: any) {
      console.warn('DB upsert failed, using local storage fallback for upsertCalendarEvent:', error)
    }
  }

  // Local JSON store fallback
  jsonUpsertCalendarEvent(data)
  revalidatePath('/admin/schedule')
  revalidatePath('/calendar')
  return { success: true }
}

// Delete a calendar event
export async function deleteCalendarEvent(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  if (prisma) {
    try {
      await prisma.calendarEvent.delete({ where: { id } })
      revalidatePath('/admin/schedule')
      revalidatePath('/calendar')
      return { success: true }
    } catch (error: any) {
      console.warn('DB delete failed, using local storage fallback for deleteCalendarEvent:', error)
    }
  }

  // Local JSON store fallback
  jsonDeleteCalendarEvent(id)
  revalidatePath('/admin/schedule')
  revalidatePath('/calendar')
  return { success: true }
}

// Publish all events for a given month (Save Calendar action)
export async function publishMonthCalendar(year: number, month: number): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  if (prisma) {
    try {
      const startDate = new Date(Date.UTC(year, month - 1, 1))
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59))

      await prisma.calendarEvent.updateMany({
        where: {
          date: { gte: startDate, lte: endDate },
          isPublished: false,
        },
        data: { isPublished: true },
      })

      revalidatePath('/admin/schedule')
      revalidatePath('/calendar')
      revalidatePath('/book')
      return { success: true }
    } catch (error: any) {
      console.warn('DB publish failed, using local storage fallback for publishMonthCalendar:', error)
    }
  }

  // Local JSON store fallback
  jsonPublishMonthCalendar(year, month)
  revalidatePath('/admin/schedule')
  revalidatePath('/calendar')
  revalidatePath('/book')
  return { success: true }
}

// Get a single event by ID (for booking flow)
export async function getCalendarEventById(id: string) {
  if (prisma) {
    try {
      const event = await prisma.calendarEvent.findUnique({
        where: { id },
        include: {
          _count: {
            select: { bookings: { where: { status: { not: 'CANCELLED' } } } }
          }
        }
      })

      if (event) {
        return {
          id: event.id,
          title: event.title,
          date: event.date.toISOString().split('T')[0],
          startTime: event.startTime,
          endTime: event.endTime,
          price: event.price,
          deliveryMode: event.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' as const : 'ONLINE' as const,
          location: event.location,
          isPublished: event.isPublished,
          bookingsCount: event._count.bookings,
        }
      }
    } catch (error) {
      console.warn('DB query failed for getCalendarEventById:', error)
    }
  }

  return jsonGetCalendarEventById(id)
}
