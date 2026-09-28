import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getCalendarEvents } from '@/app/actions/calendar'

export async function GET(request: Request) {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

  try {
    const events = await getCalendarEvents(year, month, true)
    return NextResponse.json(events)
  } catch (error) {
    console.error("Admin Calendar Events API Error:", error)
    return NextResponse.json([])
  }
}
