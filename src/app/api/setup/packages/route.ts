import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// One-time, idempotent: creates the PackagePurchase table and Booking.packagePurchaseId.
// Same statements as prisma/sql/2026-11-28-packages.sql. Protected by CRON_SECRET; safe to call again.
const STATEMENTS: string[] = [
  "CREATE TABLE IF NOT EXISTS \"PackagePurchase\" (\n    \"id\" TEXT NOT NULL,\n    \"userId\" TEXT NOT NULL,\n    \"packageSlug\" TEXT NOT NULL,\n    \"packageName\" TEXT NOT NULL,\n    \"credits\" INTEGER,\n    \"pricePaid\" DOUBLE PRECISION NOT NULL DEFAULT 0,\n    \"validFrom\" TIMESTAMP(3) NOT NULL,\n    \"validUntil\" TIMESTAMP(3) NOT NULL,\n    \"paymentId\" TEXT,\n    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT \"PackagePurchase_pkey\" PRIMARY KEY (\"id\")\n)",
  "CREATE UNIQUE INDEX IF NOT EXISTS \"PackagePurchase_paymentId_key\" ON \"PackagePurchase\"(\"paymentId\")",
  "CREATE INDEX IF NOT EXISTS \"PackagePurchase_userId_idx\" ON \"PackagePurchase\"(\"userId\")",
  "ALTER TABLE \"PackagePurchase\" DROP CONSTRAINT IF EXISTS \"PackagePurchase_userId_fkey\"",
  "ALTER TABLE \"PackagePurchase\" ADD CONSTRAINT \"PackagePurchase_userId_fkey\" FOREIGN KEY (\"userId\") REFERENCES \"User\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE",
  "ALTER TABLE \"Booking\" ADD COLUMN IF NOT EXISTS \"packagePurchaseId\" TEXT",
  "CREATE INDEX IF NOT EXISTS \"Booking_packagePurchaseId_idx\" ON \"Booking\"(\"packagePurchaseId\")",
  "ALTER TABLE \"Booking\" DROP CONSTRAINT IF EXISTS \"Booking_packagePurchaseId_fkey\"",
  "ALTER TABLE \"Booking\" ADD CONSTRAINT \"Booking_packagePurchaseId_fkey\" FOREIGN KEY (\"packagePurchaseId\") REFERENCES \"PackagePurchase\"(\"id\") ON DELETE SET NULL ON UPDATE CASCADE"
]

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!prisma) return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  for (const s of STATEMENTS) await prisma.$executeRawUnsafe(s)
  const count = await prisma.packagePurchase.count()
  return NextResponse.json({ ok: true, statements: STATEMENTS.length, packagePurchases: count })
}
