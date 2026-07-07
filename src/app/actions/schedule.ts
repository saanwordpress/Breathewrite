'use server'

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// Create a safe prisma instance
import { PrismaClient } from '@prisma/client'
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

type WeeklyScheduleItem = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isWorking: boolean
}

export async function saveWeeklySchedule(schedule: WeeklyScheduleItem[]) {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    // Perform upserts in a transaction
    await prisma.$transaction(
      schedule.map((item) => 
        prisma.availabilitySchedule.upsert({
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
    revalidatePath('/book') // invalidate frontend booking availability
    return { success: true }
  } catch (error: any) {
    console.error('saveWeeklySchedule Error:', error)
    return { success: false, error: 'Database connection failed. Ensure DATABASE_URL is set in .env.local' }
  }
}

export async function addDateOverride(dateStr: string, isWorking: boolean, startTime?: string, endTime?: string) {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

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
    console.error('addDateOverride Error:', error)
    return { success: false, error: 'Database connection failed. Ensure DATABASE_URL is set in .env.local' }
  }
}

export async function deleteDateOverride(id: string) {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.availabilityOverride.delete({
      where: { id }
    })

    revalidatePath('/admin/schedule')
    revalidatePath('/book')
    return { success: true }
  } catch (error: any) {
    console.error('deleteDateOverride Error:', error)
    return { success: false, error: 'Database connection failed. Ensure DATABASE_URL is set in .env.local' }
  }
}
