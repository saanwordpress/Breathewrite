import { CheckCircle2, Circle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { isStripeConfigured } from '@/lib/bookings'
import { primaryAdminEmail } from '@/lib/admin'

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

export function SetupStatus() {
  const zoomReady = !!(process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET)

  return (
    <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
      <h2 className="text-2xl font-heading">Setup Status</h2>
      <ul className="space-y-4">
        <Item ok={!!prisma} label="Database (Supabase)" detail={prisma ? 'Connected' : 'DATABASE_URL not set — bookings are not saved permanently'} />
        <Item
          ok={isStripeConfigured() && !!process.env.STRIPE_WEBHOOK_SECRET}
          label="Stripe payments"
          detail={!isStripeConfigured() ? 'STRIPE_SECRET_KEY not set' : !process.env.STRIPE_WEBHOOK_SECRET ? 'STRIPE_WEBHOOK_SECRET not set' : 'Ready'}
        />
        <Item
          ok={zoomReady}
          label="Zoom meetings"
          detail={zoomReady
            ? `Ready${process.env.ZOOM_HOST_USER_ID ? ` — host: ${process.env.ZOOM_HOST_USER_ID}` : ''}`
            : 'ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET not set — booking emails say the link will follow'}
        />
        <Item
          ok={!!process.env.RESEND_API_KEY}
          label="Emails (Resend)"
          detail={process.env.RESEND_API_KEY ? `Booking alerts go to ${primaryAdminEmail()}` : 'RESEND_API_KEY not set — emails are not sent'}
        />
      </ul>
    </div>
  )
}
