import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Called daily by Vercel Cron (see vercel.json) so the free Supabase
// database is never idle long enough to be paused.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!prisma) return NextResponse.json({ ok: false, error: 'DATABASE_URL not set' }, { status: 500 })

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true, at: new Date().toISOString() })
  } catch (error) {
    console.error('Keep-alive database query failed:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
