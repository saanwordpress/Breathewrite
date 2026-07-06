import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Save } from 'lucide-react'
import { addEvent } from "@/lib/mock-db"

export default async function CreateEventPage() {
  const session = await auth()

  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 md:px-12 max-w-3xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
            <Link href="/admin/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Schedule
            </Link>
          </Button>
          <div>
            <h1 className="text-4xl font-heading mb-2">Create New Event</h1>
            <p className="text-foreground/70 font-light">
              Schedule a new breathwork session for your users.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8">
          <form className="space-y-6" action={async (formData) => {
             "use server"
             const title = formData.get('title') as string
             const date = formData.get('date') as string
             const time = formData.get('time') as string
             const capacity = formData.get('capacity') as string
             const price = formData.get('price') as string
             const isPublic = formData.get('isPublic') === 'on'

             if (title && date && time) {
               await addEvent({
                 title,
                 date,
                 time,
                 capacity: `0/${capacity}`,
                 status: 'UPCOMING',
                 price,
                 isPublic,
               })
               const { revalidatePath } = require('next/cache')
               revalidatePath('/admin/events')
               revalidatePath('/admin')
               revalidatePath('/calendar')
               revalidatePath('/book')
             }
             redirect('/admin/events')
          }}>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Offering Type</label>
              <select name="title" required className="w-full px-4 py-3 bg-background border border-border rounded-xl font-light focus:outline-none focus:border-primary">
                <option value="Breathe & Flow">Breathe & Flow</option>
                <option value="Breathe & Go">Breathe & Go</option>
                <option value="Breathe & Write">Breathe & Write</option>
                <option value="Neurodynamic Breathwork">Neurodynamic Breathwork</option>
                <option value="Special Event">Special Event</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input name="date" type="date" required className="w-full px-4 py-3 bg-background border border-border rounded-xl font-light focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <input name="time" type="time" required className="w-full px-4 py-3 bg-background border border-border rounded-xl font-light focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity (Max Attendees)</label>
                <input name="capacity" type="number" defaultValue="20" required className="w-full px-4 py-3 bg-background border border-border rounded-xl font-light focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <input name="price" type="number" defaultValue="35" required className="w-full px-4 py-3 bg-background border border-border rounded-xl font-light focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <label className="flex items-center gap-3">
                <input name="isPublic" type="checkbox" className="w-5 h-5 rounded border-border text-primary focus:ring-primary" defaultChecked />
                <span className="font-medium">Public Event</span>
              </label>
              <p className="text-xs text-muted-foreground ml-8">If unchecked, this event will only be visible to active members.</p>
            </div>

            <div className="pt-6 flex justify-end gap-4">
              <Button asChild variant="ghost" className="rounded-full">
                <Link href="/admin/events">Cancel</Link>
              </Button>
              <Button type="submit" className="rounded-full">
                <Save className="w-4 h-4 mr-2" />
                Save Event
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
