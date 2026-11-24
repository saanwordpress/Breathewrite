import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { listUserBookings, getMember } from "@/lib/store"
import { cancelMembership, getMembership } from "@/lib/bookings"
import { meetingProviderName } from "@/lib/meetings"
import { formatLongDate, formatTime12h, isClassPast } from "@/lib/time"
import { Video, Calendar, Sparkles, CheckCircle2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=%2Fdashboard')
  }

  const { id: userId, name, email } = session.user
  const role = (session.user as { role?: string }).role
  if (role === 'ADMIN') redirect('/admin')
  const sp = await searchParams

  const membership = userId ? await getMembership(userId) : { active: false, expiresAt: null }
  const isMember = membership.active
  const memberUntil = membership.expiresAt ? formatLongDate(membership.expiresAt.slice(0, 10)) : null
  const member = isMember && userId ? await getMember(userId) : null
  const canCancel = !!(member?.paymentCustomerId && member.subscriptionId)
  const cancelled = !!(member?.paymentCustomerId && !member.subscriptionId)

  const userBookings = (userId ? await listUserBookings(userId) : [])
    .map(b => ({ ...b, isPast: isClassPast(b.date, b.endTime || b.startTime) }))
    .sort((a, b) =>
      a.isPast !== b.isPast
        ? Number(a.isPast) - Number(b.isPast)
        : (a.isPast ? -1 : 1) * `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)
    )

  const banner =
    sp.booking === 'success' || sp.checkout === 'success'
      ? 'Your booking is confirmed! Your joining link has been emailed to you and is shown below.'
      : sp.membership === 'success'
      ? 'Welcome to the membership! You can now book any class on the calendar at no extra charge.'
      : sp.booking === 'exists'
      ? "You're already booked into that class. Your joining link is below."
      : sp.membership === 'active'
      ? 'Your membership is already active.'
      : sp.membership === 'cancelled'
      ? `Your membership has been cancelled. You won't be charged again${memberUntil ? `, and you can keep booking classes until ${memberUntil}` : ''}.`
      : sp.membership === 'cancel-failed'
      ? "We couldn't cancel your membership just now. Please try again, or email info@breathewrite.co.uk and we'll cancel it for you."
      : null

  return (
    <div className="flex flex-col w-full bg-[#F5F4F0] pt-12 pb-24 min-h-screen">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        {banner && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#5B8260]/40 bg-[#5B8260]/10 p-5 text-sm text-foreground">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#5B8260]" />
            <span>{banner}</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-border/40 rounded-3xl p-8 mb-8 shadow-sm gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-heading text-primary">Welcome, {name || email}</h1>
              {isMember && (
                <span className="bg-[#5B8260] text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" /> Monthly Member
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm font-light">
              {isMember
                ? `Your monthly membership is active${memberUntil ? ` until ${memberUntil}` : ''}. You can book any available class on the calendar for free.`
                : 'Book upcoming classes or upgrade to monthly membership for unlimited access.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/calendar" })
              }}
            >
              <Button type="submit" variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground">
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bookings List */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading text-primary">My Booked Sessions</h2>
              <Button asChild variant="outline" size="sm" className="rounded-full border-border text-xs">
                <Link href="/calendar">+ Book New Class</Link>
              </Button>
            </div>

            {userBookings.length === 0 ? (
              <div className="bg-white border border-border/40 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
                <Calendar className="w-12 h-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-heading mb-2">No Upcoming Sessions Booked</h3>
                <p className="text-muted-foreground font-light text-sm max-w-sm mb-6">
                  {isMember
                    ? 'As an active member, browse the calendar to reserve your spot for any available class at no extra charge.'
                    : 'Browse the session calendar to book your next breathwork journey.'}
                </p>
                <Button asChild className="rounded-full px-8">
                  <Link href="/calendar">Browse Class Calendar</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`bg-white border border-border/40 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${booking.isPast ? 'opacity-60' : ''}`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-[#5B8260]" />
                        <h3 className="text-lg font-heading text-primary">{booking.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground font-light">
                        {formatLongDate(booking.date)} · {formatTime12h(booking.startTime)} – {formatTime12h(booking.endTime)} (UK)
                        {booking.pricePaid === 0 ? ' · Membership' : ` · £${booking.pricePaid.toFixed(2)}`}
                      </p>
                      {booking.meetingId && booking.meetingPassword && !booking.isPast && (
                        <p className="text-xs text-muted-foreground font-light mt-1">
                          Meeting ID {booking.meetingId} · Passcode {booking.meetingPassword}
                        </p>
                      )}
                    </div>

                    {booking.isPast ? (
                      <span className="text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full font-medium">
                        Completed
                      </span>
                    ) : booking.inPerson ? (
                      <span className="text-xs text-foreground/80 bg-muted/40 px-3 py-1.5 rounded-full font-medium text-right">
                        In person{booking.location ? ` · ${booking.location}` : ''}
                      </span>
                    ) : booking.meetingUrl ? (
                      <Button asChild size="sm" className="rounded-full bg-[#4A6FA5] hover:bg-[#3B5B88] text-white">
                        <a href={booking.meetingUrl} target="_blank" rel="noreferrer">
                          <Video className="w-4 h-4 mr-2" />
                          Join {meetingProviderName(booking.meetingUrl)}
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full font-medium">
                        Confirmed · link to follow by email
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <h2 className="text-2xl font-heading text-primary">Membership Status</h2>
            <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-md">
              {isMember ? (
                <>
                  <h3 className="text-xl font-heading mb-3">Active Member Pass</h3>
                  <p className="text-primary-foreground/80 font-light text-xs leading-relaxed mb-6">
                    You have unlimited access to live online group sessions{memberUntil ? ` until ${memberUntil}` : ''}. Visit the calendar to reserve any available date for £0.
                  </p>
                  <Button asChild variant="secondary" className="w-full rounded-full">
                    <Link href="/calendar">Book Class for £0</Link>
                  </Button>
                  {canCancel && (
                    // Two steps (open, then confirm) so the membership can't be cancelled by a stray click.
                    <details className="mt-3 text-center">
                      <summary className="cursor-pointer list-none rounded-full py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10">
                        Cancel membership
                      </summary>
                      <form
                        className="mt-3 space-y-3"
                        action={async () => {
                          "use server"
                          const ok = await cancelMembership(userId!)
                          redirect(ok ? '/dashboard?membership=cancelled' : '/dashboard?membership=cancel-failed')
                        }}
                      >
                        <p className="text-xs font-light text-primary-foreground/80">
                          You won&rsquo;t be charged again{memberUntil ? ` and keep access until ${memberUntil}` : ''}.
                        </p>
                        <Button type="submit" variant="secondary" className="w-full rounded-full">
                          Yes, cancel my membership
                        </Button>
                      </form>
                    </details>
                  )}
                  {cancelled && (
                    <p className="mt-4 text-center text-xs font-light text-primary-foreground/80">
                      Cancelled. You won&rsquo;t be charged again.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-xl font-heading mb-3">Monthly Membership</h3>
                  <p className="text-primary-foreground/80 font-light text-xs leading-relaxed mb-6">
                    Unlock unlimited access to all live sessions for £45/month.
                  </p>
                  <Button asChild variant="secondary" className="w-full rounded-full">
                    <Link href="/membership">Upgrade for £45/mo</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
