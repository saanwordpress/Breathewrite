// Minimal Mollie API client (https://docs.mollie.com/reference). Uses fetch so there is no SDK to keep in step.

const API = 'https://api.mollie.com/v2'

export type MollieAmount = { currency: string; value: string }

export type MolliePayment = {
  id: string
  status: 'open' | 'pending' | 'authorized' | 'paid' | 'canceled' | 'expired' | 'failed'
  amount: MollieAmount
  description: string
  sequenceType: 'oneoff' | 'first' | 'recurring'
  customerId?: string
  subscriptionId?: string
  metadata: Record<string, string> | null
  paidAt?: string
  _links: { checkout?: { href: string } }
}

export type MollieSubscription = {
  id: string
  status: 'pending' | 'active' | 'canceled' | 'suspended' | 'completed'
  nextPaymentDate?: string // "YYYY-MM-DD"
  metadata: Record<string, string> | null
}

export function isMollieConfigured(): boolean {
  const key = process.env.MOLLIE_API_KEY || ''
  return /^(live|test)_\w{20,}$/.test(key)
}

export function isMollieTestMode(): boolean {
  return (process.env.MOLLIE_API_KEY || '').startsWith('test_')
}

// Mollie wants amounts as strings with exactly two decimals, e.g. "45.00".
export function gbp(amount: number): MollieAmount {
  return { currency: 'GBP', value: amount.toFixed(2) }
}

async function mollie<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown, idempotencyKey?: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      // Mollie returns the original result for a repeated key, so a retried webhook can't create duplicates.
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Mollie ${method} ${path} failed (${res.status}): ${(await res.text()).slice(0, 500)}`)
  return res.status === 204 ? (undefined as T) : res.json()
}

export const createPayment = (body: Record<string, unknown>) => mollie<MolliePayment>('POST', '/payments', body)
export const getPayment = (id: string) => mollie<MolliePayment>('GET', `/payments/${encodeURIComponent(id)}`)
export const updatePayment = (id: string, body: Record<string, unknown>) =>
  mollie<MolliePayment>('PATCH', `/payments/${encodeURIComponent(id)}`, body)

export const createCustomer = (name: string, email: string, metadata: Record<string, string>) =>
  mollie<{ id: string }>('POST', '/customers', { name, email, metadata })

export const getSubscription = (customerId: string, subscriptionId: string) =>
  mollie<MollieSubscription>('GET', `/customers/${encodeURIComponent(customerId)}/subscriptions/${encodeURIComponent(subscriptionId)}`)

export const listSubscriptions = (customerId: string) =>
  mollie<{ _embedded?: { subscriptions: MollieSubscription[] } }>('GET', `/customers/${encodeURIComponent(customerId)}/subscriptions`).then(
    r => r._embedded?.subscriptions ?? []
  )

export const createSubscription = (customerId: string, body: Record<string, unknown>, idempotencyKey?: string) =>
  mollie<MollieSubscription>('POST', `/customers/${encodeURIComponent(customerId)}/subscriptions`, body, idempotencyKey)

export const cancelSubscription = (customerId: string, subscriptionId: string) =>
  mollie<MollieSubscription>('DELETE', `/customers/${encodeURIComponent(customerId)}/subscriptions/${encodeURIComponent(subscriptionId)}`)

// Lists enabled payment methods, to confirm the key is accepted and payments can be taken (creates nothing).
export async function checkMollieConnection(): Promise<{ ok: boolean; detail: string }> {
  if (!isMollieConfigured()) return { ok: false, detail: 'MOLLIE_API_KEY not set' }
  try {
    const r = await mollie<{ _embedded?: { methods: { id: string }[] } }>('GET', '/methods?amount[value]=10.00&amount[currency]=GBP')
    const methods = r._embedded?.methods.map(m => m.id) ?? []
    return methods.length
      ? { ok: true, detail: `${isMollieTestMode() ? 'Test' : 'Live'} key accepted; GBP methods: ${methods.join(', ')}` }
      : { ok: false, detail: 'Key accepted, but no payment methods are enabled for GBP' }
  } catch (error) {
    return { ok: false, detail: (error as Error).message.slice(0, 300) }
  }
}
