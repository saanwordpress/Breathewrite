import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ScheduleManager } from "./components/ScheduleManager"

// Import prisma safely
import { PrismaClient } from '@prisma/client'
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Default Mon-Fri 9-5 schedule if db is empty or disconnected
const DEFAULT_SCHEDULE = [
  { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isWorking: false },
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", isWorking: false },
]

export default async function SchedulePage() {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  let scheduleData = [...DEFAULT_SCHEDULE]
  let overridesData: any[] = []

  try {
    const fetchedSchedule = await prisma.availabilitySchedule.findMany()
    if (fetchedSchedule.length > 0) {
      // Merge with default to ensure all 7 days exist
      scheduleData = DEFAULT_SCHEDULE.map(defaultDay => {
        const found = fetchedSchedule.find(s => s.dayOfWeek === defaultDay.dayOfWeek)
        return found ? found : defaultDay
      })
    }

    const fetchedOverrides = await prisma.availabilityOverride.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' }
    })
    
    overridesData = fetchedOverrides
  } catch (error) {
    console.warn("Could not fetch schedule data. Ensure DATABASE_URL is set.", error)
  }

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-heading mb-2">Availability Schedule</h1>
          <p className="text-foreground/70 font-light">
            Set your recurring weekly hours and manage specific date overrides.
          </p>
        </div>

        <ScheduleManager initialSchedule={scheduleData} initialOverrides={overridesData} />
      </div>
    </div>
  )
}

