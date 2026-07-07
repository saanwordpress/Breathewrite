import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Clock, CalendarX } from "lucide-react"

export default async function SchedulePage() {
  const session = await auth()
  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-heading mb-2">Availability Schedule</h1>
          <p className="text-foreground/70 font-light">
            Set your recurring weekly hours and manage specific date overrides.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Weekly Hours Card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-heading flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  Weekly Hours
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Your standard recurring schedule.</p>
              </div>
              <Button variant="outline" className="rounded-full">Edit Weekly Hours</Button>
            </div>
            
            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <span className="font-medium w-32">{day}</span>
                  <span className="text-muted-foreground">09:00 AM - 05:00 PM</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <span className="font-medium w-32 text-muted-foreground">Saturday</span>
                <span className="text-muted-foreground bg-muted px-3 py-1 rounded-full text-xs uppercase tracking-wider">Unavailable</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <span className="font-medium w-32 text-muted-foreground">Sunday</span>
                <span className="text-muted-foreground bg-muted px-3 py-1 rounded-full text-xs uppercase tracking-wider">Unavailable</span>
              </div>
            </div>
          </div>

          {/* Date Overrides Card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-heading flex items-center gap-3">
                  <CalendarX className="w-6 h-6 text-primary" />
                  Date Overrides
                </h2>
                <p className="text-muted-foreground text-sm mt-1">Block out holidays, vacations, or custom hours for specific dates.</p>
              </div>
              <Button className="rounded-full">Add Override</Button>
            </div>

            <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
              <CalendarX className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No date overrides configured yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
