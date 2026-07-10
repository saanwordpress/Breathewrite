'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/availability"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return []
  }

  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return notifications
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

export async function markNotificationAsRead(id: string) {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false }
  }
}

export async function markAllNotificationsAsRead() {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false }
  }
}
