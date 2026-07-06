import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, DollarSign, Calendar as CalendarIcon, Settings } from 'lucide-react'
import { getEvents } from "@/lib/mock-db"

// Dummy Data for static stats
const STATS = [
  { label: 'Total Revenue', value: '$4,250', icon: DollarSign },
  { label: 'Active Members', value: '45', icon: Users },
]

export default async function AdminDashboardPage() {
  const session = await auth()
  const events = await getEvents()
  const upcomingEventsCount = events.filter(e => e.status !== 'PAST').length

  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-8 mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-heading mb-2">Admin Dashboard</h1>
            <p className="text-foreground/70 font-light">
              Manage your bookings, memberships, and website settings.
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline" className="rounded-full border-border">
              <Link href="/studio" target="_blank">Open Sanity Studio</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/admin/events/new">Create Event</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-card border border-border p-6 rounded-3xl flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-light text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-medium">{stat.value}</p>
                </div>
              </div>
            )
          })}
          <div className="bg-card border border-border p-6 rounded-3xl flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-light text-muted-foreground mb-1">Upcoming Sessions</p>
              <p className="text-3xl font-medium">{upcomingEventsCount}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-heading">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-sm text-accent hover:underline">View All</Link>
            </div>
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              <table className="w-full text-left text-sm font-light">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Event</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">Jane Doe<br/><span className="text-xs text-muted-foreground">jane@example.com</span></td>
                      <td className="px-6 py-4 font-medium">Breathe & Flow</td>
                      <td className="px-6 py-4">July 10, 2026</td>
                      <td className="px-6 py-4"><span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">Confirmed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
             <h2 className="text-2xl font-heading">Quick Actions</h2>
             <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
               <Link href="/admin/members" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                 <Users className="w-5 h-5 text-muted-foreground" />
                 <span>Manage Members</span>
               </Link>
               <Link href="/admin/events" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                 <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                 <span>Manage Schedule</span>
               </Link>
               <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                 <DollarSign className="w-5 h-5 text-muted-foreground" />
                 <span>Stripe Dashboard</span>
               </a>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
