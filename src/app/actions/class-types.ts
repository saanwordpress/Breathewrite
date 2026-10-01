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
          deliveryMode: ct.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' as const : 'ONLINE' as const,
          location: ct.location,
        }))
      }
    } catch (error) {
      console.warn('DB query failed for getClassTypes, using local storage fallback:', error)
    }
  }

  // Local JSON store fallback
  return jsonGetClassTypes()
}

type FormatInput = { deliveryMode?: 'ONLINE' | 'IN_PERSON'; location?: string | null }

function normalizeFormat(input: FormatInput): FormatInput {
  if (input.deliveryMode === undefined) return {}
  const inPerson = input.deliveryMode === 'IN_PERSON'
  return {
    deliveryMode: inPerson ? 'IN_PERSON' : 'ONLINE',
    location: inPerson ? String(input.location ?? '').trim().slice(0, 300) || null : null,
  }
}

// Update a class type's price, duration, color or default format
export async function updateClassType(
  id: string,
  input: { price?: number; duration?: number; color?: string; isActive?: boolean } & FormatInput
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  const { deliveryMode: _m, location: _l, ...rest } = input
  const data = { ...rest, ...normalizeFormat(input) }

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
      deliveryMode: data.deliveryMode,
      location: data.location,
    })
  }

  revalidatePath('/admin/pricing')
  revalidatePath('/admin/schedule')
  revalidatePath('/calendar')
  return { success: true }
}

// Add a new custom class type
export async function addClassType(
  input: { name: string; price: number; duration: number; color: string } & FormatInput
): Promise<{ success: boolean; error?: string }> {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  const data = { ...input, ...normalizeFormat({ deliveryMode: input.deliveryMode ?? 'ONLINE', location: input.location }) }

  if (prisma) {
    try {
      await prisma.classType.create({
        data: {
          name: data.name,
          price: data.price,
          duration: data.duration,
          color: data.color,
          isActive: true,
          deliveryMode: data.deliveryMode,
          location: data.location,
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
    deliveryMode: data.deliveryMode,
    location: data.location,
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
