// Class packages sold on /packages. Pure data + rules, safe to import from client components.

export type ClassMatch = {
  // Class titles are compared lower-case with spaces, "&" and "and" removed, e.g. "Breathe & Flow" -> "breatheflow".
  keywords: string[]
  minutes?: number // class length must match when set
}

export type PackageDef = {
  slug: string
  name: string
  summary: string
  price: number
  validMonths: number
  credits: number | null // null = unlimited online group classes (a pass)
  match?: ClassMatch // which calendar classes the credits can be used for
  privateDiscount?: number // e.g. 0.2 = 20% off private sessions while valid
  note?: string
  isPrivate?: boolean
}

const FLOW = ['breatheflow', 'breathflow']
const NEURO = ['neurodynamic']
const WRITE = ['breathewrite', 'breathwrite']
const GO = ['breathego', 'breathgo']

export const PACKAGES: PackageDef[] = [
  { slug: 'origen', name: 'Origen', summary: '3 x 60 minute group Breathe & Flow sessions', price: 40, validMonths: 3, credits: 3, match: { keywords: FLOW, minutes: 60 } },
  { slug: 'chrysalis', name: 'Chrysalis', summary: '3 x 120 minute group Neurodynamic sessions', price: 65, validMonths: 3, credits: 3, match: { keywords: NEURO, minutes: 120 }, note: 'Contraindications apply' },
  { slug: 'quill', name: 'Quill', summary: '3 x group Breathe & Write sessions', price: 65, validMonths: 3, credits: 3, match: { keywords: WRITE } },
  { slug: 'revive', name: 'Revive', summary: '5 x group 60 minute Breathe & Flow sessions', price: 65, validMonths: 3, credits: 5, match: { keywords: FLOW, minutes: 60 } },
  { slug: 'imago', name: 'Imago', summary: '5 x group 120 minute Neurodynamic sessions', price: 115, validMonths: 3, credits: 5, match: { keywords: NEURO, minutes: 120 }, note: 'Contraindications apply' },
  { slug: 'tribe', name: 'Tribe', summary: 'Unlimited group online sessions & 20% off private sessions', price: 85, validMonths: 1, credits: null, privateDiscount: 0.2 },
  { slug: 'tribe-gold', name: 'Tribe Gold', summary: 'Unlimited group online sessions & 20% off private sessions', price: 230, validMonths: 3, credits: null, privateDiscount: 0.2 },
  { slug: 'the-ceo', name: 'The CEO', summary: '5 x private 20 minute Breathe & Go sessions', price: 150, validMonths: 3, credits: 5, match: { keywords: GO, minutes: 20 }, isPrivate: true },
]

export function getPackage(slug: string): PackageDef | undefined {
  return PACKAGES.find(p => p.slug === slug)
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/&/g, ' ').replace(/\band\b/g, ' ').replace(/[^a-z0-9]/g, '')
}

function minutesOf(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

export type ClassInfo = { title: string; startTime: string; endTime: string; deliveryMode?: string | null }

// Private sessions are never covered by unlimited passes or the membership; members get a discount instead.
export function isPrivateClass(c: Pick<ClassInfo, 'title'>): boolean {
  const t = normalizeTitle(c.title)
  return t.includes('private') || GO.some(k => t.includes(k))
}

export function isOnlineGroupClass(c: ClassInfo): boolean {
  return c.deliveryMode !== 'IN_PERSON' && !isPrivateClass(c)
}

export function packageCoversClass(p: PackageDef, c: ClassInfo): boolean {
  if (p.credits === null) return isOnlineGroupClass(c)
  if (!p.match) return false
  const t = normalizeTitle(c.title)
  if (!p.match.keywords.some(k => t.includes(k))) return false
  return !p.match.minutes || minutesOf(c.startTime, c.endTime) === p.match.minutes
}

// Valid for N months: bought 1 Dec -> classes up to 28 Feb (end of day UK time is close enough at 23:59 UTC).
export function packageValidUntil(purchasedAt: Date, months: number): Date {
  const y = purchasedAt.getUTCFullYear()
  const m = purchasedAt.getUTCMonth() + months
  const lastDayOfTarget = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  const day = Math.min(purchasedAt.getUTCDate(), lastDayOfTarget)
  return new Date(Date.UTC(y, m, day - 1, 23, 59, 59))
}
