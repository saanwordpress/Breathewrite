import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient | null }

function getPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    globalForPrisma.prisma = null
    return null
  }

  try {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient()
    }
    return globalForPrisma.prisma
  } catch (e) {
    console.error('Failed to initialize Prisma client:', e)
    return null
  }
}

export const prisma = getPrismaClient()
