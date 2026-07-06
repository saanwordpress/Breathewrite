import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // @ts-ignore - Assuming role and isMember are set in auth callback
  const { name, email, isMember, role } = session.user

  return (
    <div className="flex flex-col w-full bg-background pt-24 pb-24 min-h-screen">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-8 mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-heading mb-2">Welcome, {name || email}</h1>
            <p className="text-foreground/70 font-light">
              {isMember ? 'Active Member' : 'Guest'}
            </p>
          </div>
          <div className="flex gap-4">
            {role === 'ADMIN' && (
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/admin">Admin Settings</Link>
              </Button>
            )}
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <Button type="submit" variant="ghost" className="rounded-full">
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <h2 className="text-2xl font-heading">Upcoming Sessions</h2>
            <div className="bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
              <p className="text-foreground/60 font-light mb-6">You have no upcoming sessions booked.</p>
              <Button asChild className="rounded-full">
                <Link href="/calendar">View Calendar</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-heading">Membership</h2>
            <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-lg">
              {isMember ? (
                <>
                  <h3 className="text-xl font-medium mb-4">Active Subscription</h3>
                  <p className="text-primary-foreground/80 font-light text-sm mb-8">
                    You have unlimited access to all live online sessions and the resource library.
                  </p>
                  <Button asChild variant="secondary" className="w-full rounded-full">
                    {/* In a real app this would link to Stripe Customer Portal */}
                    <Link href="#">Manage Billing</Link>
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium mb-4">Become a Member</h3>
                  <p className="text-primary-foreground/80 font-light text-sm mb-8">
                    Get unlimited access to online sessions, priority booking, and exclusive content.
                  </p>
                  <Button asChild variant="secondary" className="w-full rounded-full">
                    <Link href="/membership">Upgrade</Link>
                  </Button>
                </>
              )}
            </div>
            
            {isMember && (
              <div className="bg-card border border-border rounded-3xl p-8">
                <h3 className="text-lg font-heading mb-4">Member Resources</h3>
                <ul className="space-y-4 text-sm font-light">
                  <li><Link href="/dashboard/recordings" className="text-accent hover:underline">Session Recordings Library</Link></li>
                  <li><Link href="/dashboard/guides" className="text-accent hover:underline">Integration Guides</Link></li>
                  <li><Link href="/dashboard/community" className="text-accent hover:underline">Private Community</Link></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
