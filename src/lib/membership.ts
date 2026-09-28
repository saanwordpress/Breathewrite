export const MEMBERSHIP_PRICE_GBP = 45

export type MembershipStatus = {
  active: boolean
  expiresAt: string | null
}

export function membershipCoversClass(membership: MembershipStatus, classStartUtc: Date): boolean {
  if (!membership.active) return false
  if (!membership.expiresAt) return true
  return classStartUtc.getTime() < new Date(membership.expiresAt).getTime()
}
