import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ScheduleManager } from "./components/ScheduleManager"
import { AdminCalendar } from "./components/AdminCalendar"
import { getCalendarEvents } from "@/app/actions/calendar"
import { getClassTypes } from "@/app/actions/class-types"
import { prisma } from "@/lib/prisma"
import { jsonGetSchedule, jsonGetOverrides } from "@/lib/json-db"

// Default Mon-Fri 9-5 schedule if db is empty
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

  // Fetch calendar events for current month; all queries run in parallel.
  const now = new Date()
  const db = prisma
  const [calendarEvents, classTypes, dbSchedule] = await Promise.all([
    getCalendarEvents(now.getFullYear(), now.getMonth() + 1, true),
    getClassTypes(),
    db
      ? Promise.all([
          db.availabilitySchedule.findMany(),
          db.availabilityOverride.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: 'asc' } }),
        ]).catch((error) => error as Error)
      : null,
  ])

  let scheduleData = [...DEFAULT_SCHEDULE]
  let overridesData: any[] = []

  if (dbSchedule) {
    try {
      if (dbSchedule instanceof Error) throw dbSchedule
      const [fetchedSchedule, fetchedOverrides] = dbSchedule
      if (fetchedSchedule.length > 0) {
        scheduleData = DEFAULT_SCHEDULE.map(defaultDay => {
          const found = fetchedSchedule.find(s => s.dayOfWeek === defaultDay.dayOfWeek)
          return found ? found : defaultDay
        })
      }
      overridesData = fetchedOverrides
    } catch (error) {
      console.warn("Could not fetch schedule data from DB, using fallback:", error)
      const localSched = jsonGetSchedule()
      if (localSched.length > 0) scheduleData = localSched
      overridesData = jsonGetOverrides()
    }
  } else {
    const localSched = jsonGetSchedule()
    if (localSched.length > 0) scheduleData = localSched
    overridesData = jsonGetOverrides()
  }

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-heading mb-2">Manage Schedule</h1>
          <p className="text-foreground/70 font-light">
            Add classes to the calendar and manage your availability.
          </p>
        </div>

        {/* Class Calendar — Primary Feature */}
        <div className="mb-12">
          <AdminCalendar initialEvents={calendarEvents} classTypes={classTypes} />
        </div>

        {/* Legacy Schedule Manager */}
        <details className="group">
          <summary className="cursor-pointer text-lg font-heading text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            Weekly Hours & Date Overrides (Legacy)
          </summary>
          <ScheduleManager initialSchedule={scheduleData} initialOverrides={overridesData} />
        </details>
      </div>
    </div>
  )
}
