// Default class types — used to seed the ClassType table on first run
// Prices and colors can be changed by admin from the Pricing tab

export const DEFAULT_CLASS_TYPES = [
  { name: 'Breathe & Flow', price: 25, duration: 60, color: '#4A6FA5' },
  { name: 'Breathe & Write', price: 25, duration: 90, color: '#6B8E6B' },
  { name: 'Breathe & Go', price: 15, duration: 30, color: '#E8A838' },
  { name: 'Neurodynamic Breathwork', price: 30, duration: 90, color: '#9B6B9B' },
  { name: 'Private 1:1 Session | 60 mins', price: 65, duration: 60, color: '#C4766E' },
  { name: 'Private 1:1 Session | 120 mins', price: 120, duration: 120, color: '#8B7355' },
  { name: 'Breathe & Move', price: 25, duration: 60, color: '#2E8B57' },
  { name: 'Corporate Wellness', price: 150, duration: 60, color: '#4682B4' },
] as const

export type ClassTypeInfo = {
  id: string
  name: string
  price: number
  duration: number
  color: string
  isActive: boolean
  deliveryMode?: 'ONLINE' | 'IN_PERSON'
  location?: string | null
}
