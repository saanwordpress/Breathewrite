import { CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { getIntegration } from '@/lib/store'
import { googleOAuthConfigured } from '@/lib/google-meet'
import { activeMeetingProvider } from '@/lib/meetings'
import { isStripeConfigured } from '@/lib/bookings'
import { primaryAdminEmail } from '@/lib/admin'

const GOOGLE_MESSAGES: Record<string, string> = {
  connected: 'Google Calendar connected. New bookings will get a Google Meet link automatically.',
  error: 'Google sign-in was cancelled or failed. Please try again.',
  'missing-permission': 'Google did not grant calendar access. Please connect again and tick the calendar permission.',
  'not-configured': 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel first.',
}

function Item({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <li className="flex items-start gap-3">
      {ok ? <CheckCircle2 className="w-5 h-5 text-[#5B8260] shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground font-light">{detail}</p>
      </div>
    </li>
  )
}

export async function SetupStatus({ googleResult }: { googleResult?: string }) {
  const provider = activeMeetingProvider()
  const google = await getIntegration('google').catch(() => null)
  const zoomReady = !!(process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET)

  return (
    <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
      <h2 className="text-2xl font-heading">Setup Status</h2>
      {googleResult && GOOGLE_MESSAGES[googleResult] && (
        <p className="text-sm rounded-xl bg-muted/40 p-3">{GOOGLE_MESSAGES[googleResult]}</p>
      )}
      <ul className="space-y-4">
        <Item ok={!!prisma} label="Database (Supabase)" detail={prisma ? 'Connected' : 'DATABASE_URL not set — bookings are not saved permanently'} />
        <Item
          ok={isStripeConfigured() && !!process.env.STRIPE_WEBHOOK_SECRET}
          label="Stripe payments"
          detail={!isStripeConfigured() ? 'STRIPE_SECRET_KEY not set' : !process.env.STRIPE_WEBHOOK_SECRET ? 'STRIPE_WEBHOOK_SECRET not set' : 'Ready'}
        />
        {provider === 'google' ? (
          <Item
            ok={!!google}
            label="Google Meet"
            detail={google ? `Meetings created on ${google.accountEmail ?? 'the connected Google account'}` : googleOAuthConfigured() ? 'Not connected yet' : 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set'}
          />
        ) : (
          <Item ok={zoomReady} label="Zoom" detail={zoomReady ? 'Ready' : 'ZOOM_* credentials not set'} />
        )}
        <Item
          ok={!!process.env.RESEND_API_KEY}
          label="Emails (Resend)"
          detail={process.env.RESEND_API_KEY ? `Booking alerts go to ${primaryAdminEmail()}` : 'RESEND_API_KEY not set — emails are not sent'}
        />
      </ul>
      {provider === 'google' && googleOAuthConfigured() && (
        <Button asChild variant={google ? 'outline' : 'default'} className="w-full rounded-full">
          <a href="/api/integrations/google/connect">{google ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}</a>
        </Button>
      )}
    </div>
  )
}
