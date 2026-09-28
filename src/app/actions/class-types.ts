'use server'

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  jsonGetClassTypes,
  jsonUpsertClassType,
  jsonDeleteClassType,
} from "@/lib/json-db"

// Get all class types
export async function getClassTypes() {
  if (prisma) {
    try {
      let classTypes = await prisma.classType.findMany({
        orderBy: { name: 'asc' },
      })

      if (classTypes.length > 0) {
        return classTypes.map(ct => ({
          id: ct.id,
          name: ct.name,
          price: ct.price,
          duration: ct.duration,
          color: ct.color,
          isActive: ct.isActive,
        }))
      }
    } catch (error) {
      console.warn('DB query failed for getClassTypes, using local storage fallback:', error)
    }
  }

  // Local JSON store fallback
  return jsonGetClassTypes()
}

// Update a class type's price, duration, or color
export async function updateClassType(id: string, data: { price?: number; duration?: number; color?: string; isActive?: boolean }): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  if (prisma) {
    try {
      await prisma.classType.update({
        where: { id },
        data,
      })

      revalidatePath('/admin/pricing')
      revalidatePath('/admin/schedule')
      revalidatePath('/calendar')
      return { success: true }
    } catch (error: any) {
      console.warn('DB updateClassType failed, using local fallback:', error)
    }
  }

  // Local JSON store fallback
  const current = jsonGetClassTypes().find(ct => ct.id === id)
  if (current) {
    jsonUpsertClassType({
      id,
      name: current.name,
      price: data.price ?? current.price,
      duration: data.duration ?? current.duration,
      color: data.color ?? current.color,
    })
  }

  revalidatePath('/admin/pricing')
  revalidatePath('/admin/schedule')
  revalidatePath('/calendar')
  return { success: true }
}

// Add a new custom class type
export async function addClassType(data: { name: string; price: number; duration: number; color: string }): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  if (prisma) {
    try {
      await prisma.classType.create({
        data: {
          name: data.name,
          price: data.price,
          duration: data.duration,
          color: data.color,
          isActive: true,
        },
      })

      revalidatePath('/admin/pricing')
      revalidatePath('/admin/schedule')
      return { success: true }
    } catch (error: any) {
      console.warn('DB addClassType failed, using local fallback:', error)
    }
  }

  // Local JSON store fallback
  jsonUpsertClassType({
    name: data.name,
    price: data.price,
    duration: data.duration,
    color: data.color,
  })

  revalidatePath('/admin/pricing')
  revalidatePath('/admin/schedule')
  return { success: true }
}

// Delete a class type
export async function deleteClassType(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  if (prisma) {
    try {
      await prisma.classType.delete({ where: { id } })
      revalidatePath('/admin/pricing')
      revalidatePath('/admin/schedule')
      return { success: true }
    } catch (error: any) {
      console.warn('DB deleteClassType failed, using local fallback:', error)
    }
  }

  // Local JSON store fallback
  jsonDeleteClassType(id)
  revalidatePath('/admin/pricing')
  revalidatePath('/admin/schedule')
  return { success: true }
}
