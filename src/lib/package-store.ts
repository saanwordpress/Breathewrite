import { prisma } from '@/lib/prisma'
import { MEMBER_DISCOUNT, membershipCoversClass, type MembershipStatus } from '@/lib/membership'
import { getPackage, isPrivateClass, packageCoversClass, type ClassInfo } from '@/lib/packages'

// Packages are stored in Supabase only (no local JSON fallback): without a database there are none.

export type ActivePackage = {
  id: string
  slug: string
  name: string
  credits: number | null
  used: number
  remaining: number | null // null = unlimited
  validUntil: Date
}

export async function listActivePackages(userId: string, at = new Date()): Promise<ActivePackage[]> {
  if (!prisma) return []
  let rows
  try {
    rows = await prisma.packagePurchase.findMany({
      where: { userId, validUntil: { gte: at } },
      orderBy: { validUntil: 'asc' },
      include: { _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } } },
    })
  } catch (err) {
    // Never block a booking page because packages can't be read.
    console.error('[PACKAGES] Could not read packages:', err)
    return []
  }
  return rows.map(r => ({
    id: r.id,
    slug: r.packageSlug,
    name: r.packageName,
    credits: r.credits,
    used: r._count.bookings,
    remaining: r.credits === null ? null : Math.max(r.credits - r._count.bookings, 0),
    validUntil: r.validUntil,
  }))
}

export async function findPackageByPaymentId(paymentId: string) {
  if (!prisma) return null
  return prisma.packagePurchase.findUnique({ where: { paymentId } })
}

// Safe to call twice for the same payment (webhook + confirmation page).
export async function createPackagePurchase(args: {
  userId: string
  slug: string
  paymentId: string
  pricePaid: number
  validFrom: Date
  validUntil: Date
}): Promise<{ created: boolean }> {
  if (!prisma) return { created: false }
  const pkg = getPackage(args.slug)
  if (!pkg) throw new Error(`Unknown package ${args.slug}`)
  const existing = await prisma.packagePurchase.findUnique({ where: { paymentId: args.paymentId } })
  if (existing) return { created: false }
  try {
    await prisma.packagePurchase.create({
      data: {
        userId: args.userId,
        packageSlug: pkg.slug,
        packageName: pkg.name,
        credits: pkg.credits,
        pricePaid: args.pricePaid,
        validFrom: args.validFrom,
        validUntil: args.validUntil,
        paymentId: args.paymentId,
      },
    })
    return { created: true }
  } catch (err) {
    // Unique paymentId: another request created it first.
    if ((err as { code?: string }).code === 'P2002') return { created: false }
    throw err
  }
}

export type Coverage =
  | { kind: 'membership'; label: string }
  | { kind: 'pass'; label: string; purchaseId: string }
  | { kind: 'credits'; label: string; purchaseId: string; remainingAfter: number }

// What (if anything) lets this member book the class without paying, in order: membership, pass, credits.
export async function resolveCoverage(
  userId: string,
  membership: MembershipStatus,
  cls: ClassInfo,
  classStartUtc: Date
): Promise<Coverage | null> {
  if (membershipCoversClass(membership, classStartUtc, cls)) return { kind: 'membership', label: 'Included in your membership' }

  const active = await listActivePackages(userId)
  for (const p of active) {
    const def = getPackage(p.slug)
    if (!def || classStartUtc.getTime() > p.validUntil.getTime()) continue
    if (!packageCoversClass(def, cls)) continue
    if (p.remaining === null) return { kind: 'pass', label: `Included in your ${p.name} pass`, purchaseId: p.id }
    if (p.remaining > 0) {
      const after = p.remaining - 1
      return {
        kind: 'credits',
        label: `Uses 1 of your ${p.name} sessions (${after} left after this booking)`,
        purchaseId: p.id,
        remainingAfter: after,
      }
    }
  }
  return null
}

// 20% off private sessions for members and Tribe pass holders.
export async function privateDiscount(userId: string | null, membership: MembershipStatus, cls: ClassInfo, classStartUtc: Date): Promise<number> {
  if (!userId || !isPrivateClass(cls)) return 0
  const memberValid = membership.active && (!membership.expiresAt || classStartUtc.getTime() < new Date(membership.expiresAt).getTime())
  if (memberValid) return MEMBER_DISCOUNT
  const active = await listActivePackages(userId)
  const pass = active.find(p => (getPackage(p.slug)?.privateDiscount ?? 0) > 0 && classStartUtc.getTime() <= p.validUntil.getTime())
  return pass ? getPackage(pass.slug)!.privateDiscount! : 0
}

export function discounted(price: number, discount: number): number {
  return Math.round(price * (1 - discount) * 100) / 100
}
