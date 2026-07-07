import { NextResponse } from 'next/server'
import { getMonthAvailability } from '@/lib/availability'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
  const duration = parseInt(searchParams.get('duration') || '50')

  try {
    const availability = await getMonthAvailability(year, month, duration)
    return NextResponse.json(availability)
  } catch (error) {
    console.error("Availability API Error:", error)
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 })
  }
}
