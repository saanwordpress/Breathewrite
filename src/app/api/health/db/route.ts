import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Temporary connection check; reports the error with any connection string redacted.
export async function GET() {
  const url = process.env.DATABASE_URL || ''
  const shape = url
    ? url.replace(/\/\/([^:@/]+):([^@]*)@/, '//$1:***@').replace(/^(.{0,200}).*$/, '$1')
    : 'NOT SET'
  if (!prisma) return NextResponse.json({ ok: false, shape, error: 'prisma client is null' })
  try {
    const count = await prisma.calendarEvent.count()
    return NextResponse.json({ ok: true, shape, calendarEvents: count })
  } catch (e) {
    const err = e as { name?: string; code?: string; message?: string }
    const message = String(err.message || '').replace(/postgres(ql)?:\/\/[^\s"']+/g, '[redacted-url]').slice(0, 800)
    return NextResponse.json({ ok: false, shape, name: err.name, code: err.code, error: message })
  }
}
