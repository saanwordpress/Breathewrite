import Link from 'next/link'
import { AlertCircle, CalendarClock, Check, Infinity as InfinityIcon, Sparkles } from 'lucide-react'
import { auth } from '@/auth'
import { listActivePackages } from '@/lib/package-store'
import { PACKAGES } from '@/lib/packages'
import { formatLongDate } from '@/lib/time'
import { BuyPackageButton } from './BuyPackageButton'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Packages | Breathe Write' }

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const loggedIn = !!session?.user?.id && role !== 'ADMIN'
  const active = loggedIn ? await listActivePackages(session!.user!.id!) : []
  const chosen = typeof sp.buy === 'string' ? sp.buy : null

  const sessionPacks = PACKAGES.filter(p => p.credits !== null)
  const passes = PACKAGES.filter(p => p.credits === null)

  const card = (p: (typeof PACKAGES)[number]) => {
    const highlight = chosen === p.slug
    return (
      <div
        key={p.slug}
        id={p.slug}
        className={`bg-card border rounded-3xl p-8 shadow-sm flex flex-col gap-5 ${highlight ? 'border-accent ring-2 ring-accent' : 'border-border'}`}
      >
        <div>
          <h3 className="text-2xl font-heading mb-2">{p.name}</h3>
          <p className="text-foreground/80 font-light leading-relaxed">{p.summary}</p>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-medium">£{p.price}</span>
        </div>
        <ul className="space-y-2 text-sm font-light text-foreground/80">
          <li className="flex items-start gap-2">
            {p.credits === null ? <InfinityIcon className="w-4 h-4 mt-0.5 text-[#5B8260]" /> : <Check className="w-4 h-4 mt-0.5 text-[#5B8260]" />}
            {p.credits === null ? 'Unlimited online group classes' : `${p.credits} sessions, booked from the calendar`}
          </li>
          {p.privateDiscount ? (
            <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-[#5B8260]" />{Math.round(p.privateDiscount * 100)}% off private sessions</li>
          ) : null}
          <li className="flex items-start gap-2">
            <CalendarClock className="w-4 h-4 mt-0.5 text-[#5B8260]" />
            Valid for {p.validMonths} {p.validMonths === 1 ? 'month' : 'months'} from purchase
          </li>
          {p.note && (
            <li className="flex items-start gap-2 text-muted-foreground"><AlertCircle className="w-4 h-4 mt-0.5" />{p.note}</li>
          )}
        </ul>
        <div className="mt-auto">
          <BuyPackageButton slug={p.slug} highlight={highlight} label={loggedIn ? `Buy ${p.name} (£${p.price})` : `Sign up to buy ${p.name}`} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full bg-background pt-12 pb-24">
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-heading mb-6">Packages</h1>
          <p className="text-xl font-light text-primary-foreground/80 max-w-2xl mx-auto">
            Save on a set of sessions and book them from the calendar whenever suits you. Your package is applied automatically when you book while logged in.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        {sp.canceled === 'true' && (
          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-muted-foreground" />
            <span>Payment was cancelled and you have not been charged.</span>
          </div>
        )}

        {active.length > 0 && (
          <div className="mt-10 rounded-3xl border border-[#5B8260]/40 bg-[#5B8260]/10 p-6 space-y-2">
            <h2 className="flex items-center gap-2 font-medium"><Sparkles className="w-5 h-5 text-[#5B8260]" /> Your active packages</h2>
            {active.map(a => (
              <p key={a.id} className="text-sm font-light">
                <strong className="font-medium">{a.name}</strong>:{' '}
                {a.remaining === null ? 'unlimited online group classes' : `${a.remaining} of ${a.credits} sessions left`}, valid until {formatLongDate(a.validUntil.toISOString().slice(0, 10))}.
              </p>
            ))}
            <p className="text-sm font-light"><Link href="/calendar" className="underline underline-offset-4">Book a class on the calendar</Link></p>
          </div>
        )}

        {!loggedIn && (
          <p className="mt-10 text-center text-sm text-muted-foreground font-light">
            Packages are linked to your account. <Link href="/signup?callbackUrl=%2Fpackages" className="underline underline-offset-4">Create an account</Link> or{' '}
            <Link href="/login?callbackUrl=%2Fpackages" className="underline underline-offset-4">log in</Link> before buying.
          </p>
        )}

        <h2 className="text-3xl font-heading mt-14 mb-6">Session packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{sessionPacks.map(card)}</div>

        <h2 className="text-3xl font-heading mt-16 mb-6">Unlimited passes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">{passes.map(card)}</div>

        <div className="mt-16 bg-muted/30 rounded-3xl p-8 space-y-3 text-sm font-light text-foreground/80 max-w-3xl">
          <h3 className="text-xl font-heading text-foreground">How packages work</h3>
          <p>Buy a package while logged in. When you book a matching class on the calendar, one session is used and there is nothing to pay.</p>
          <p>Each package is valid from the day you buy it. For example, a 3 month package bought on 1 December can be used for classes up to 28 February.</p>
          <p>Session packages cover the class type named in the package. Unlimited passes cover all online group classes; private sessions are 20% off.</p>
        </div>
      </div>
    </div>
  )
}
