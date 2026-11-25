export const MEMBERSHIP_PRICE_GBP = 75

// Members get this off private classes and online courses (applied once those packages are on the site).
export const MEMBER_DISCOUNT = 0.2

export const MEMBERSHIP_PERKS = [
  'Unlimited online group classes every month',
  '20% off private classes',
  '20% off online courses',
]

export const MEMBERSHIP_TERMS = `£${MEMBERSHIP_PRICE_GBP} a month, ongoing. Cancel with one month's notice.`

export type MembershipStatus = {
  active: boolean
  expiresAt: string | null
}

// Membership includes online group classes only; in-person classes are always paid for.
export function membershipCoversClass(membership: MembershipStatus, classStartUtc: Date, deliveryMode: string): boolean {
  if (deliveryMode === 'IN_PERSON') return false
  if (!membership.active) return false
  if (!membership.expiresAt) return true
  return classStartUtc.getTime() < new Date(membership.expiresAt).getTime()
}

export function memberPrice(price: number, membership: MembershipStatus): number {
  return membership.active ? Math.round(price * (1 - MEMBER_DISCOUNT) * 100) / 100 : price
}
