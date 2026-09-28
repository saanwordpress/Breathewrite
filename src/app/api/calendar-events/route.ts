import { NextResponse } from 'next/server'
import { getCalendarEvents } from '@/app/actions/calendar'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

  try {
    const events = await getCalendarEvents(year, month, false)
    return NextResponse.json(events)
  } catch (error) {
    console.error("Calendar Events API Error:", error)
    return NextResponse.json([])
  }
}
