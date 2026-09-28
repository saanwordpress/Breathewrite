'use server'

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  jsonGetSchedule,
  jsonSaveSchedule,
  jsonGetOverrides,
  jsonAddOverride,
  jsonDeleteOverride,
} from "@/lib/json-db"

type WeeklyScheduleItem = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isWorking: boolean
}

export async function saveWeeklySchedule(schedule: WeeklyScheduleItem[]): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const db = prisma
  if (db) {
    try {
      await db.$transaction(
        schedule.map((item) => 
          db.availabilitySchedule.upsert({
            where: { dayOfWeek: item.dayOfWeek },
            update: {
              startTime: item.startTime,
              endTime: item.endTime,
              isWorking: item.isWorking,
            },
            create: {
              dayOfWeek: item.dayOfWeek,
              startTime: item.startTime,
              endTime: item.endTime,
              isWorking: item.isWorking,
            },
          })
        )
      )

      revalidatePath('/admin/schedule')
      revalidatePath('/book')
      return { success: true }
    } catch (error: any) {
      console.warn('DB saveWeeklySchedule failed, using local fallback:', error)
    }
  }

  // Local JSON store fallback
  jsonSaveSchedule(schedule)
  revalidatePath('/admin/schedule')
  revalidatePath('/book')
  return { success: true }
}

export async function addDateOverride(dateStr: string, isWorking: boolean, startTime?: string, endTime?: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  if (prisma) {
    try {
      const [year, month, day] = dateStr.split('-').map(Number)
      const overrideDate = new Date(Date.UTC(year, month - 1, day))

      await prisma.availabilityOverride.upsert({
        where: { date: overrideDate },
        update: {
          isWorking,
          startTime: isWorking ? startTime : null,
          endTime: isWorking ? endTime : null,
        },
        create: {
          date: overrideDate,
          isWorking,
          startTime: isWorking ? startTime : null,
          endTime: isWorking ? endTime : null,
        },
      })

      revalidatePath('/admin/schedule')
      revalidatePath('/book')
      return { success: true }
    } catch (error: any) {
      console.warn('DB addDateOverride failed, using local fallback:', error)
    }
  }

  // Local JSON store fallback
  jsonAddOverride(dateStr, isWorking, startTime, endTime)
  revalidatePath('/admin/schedule')
  revalidatePath('/book')
  return { success: true }
}

export async function deleteDateOverride(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  if (prisma) {
    try {
      await prisma.availabilityOverride.delete({
        where: { id }
      })

      revalidatePath('/admin/schedule')
      revalidatePath('/book')
      return { success: true }
    } catch (error: any) {
      console.warn('DB deleteDateOverride failed, using local fallback:', error)
    }
  }

  // Local JSON store fallback
  jsonDeleteOverride(id)
  revalidatePath('/admin/schedule')
  revalidatePath('/book')
  return { success: true }
}
