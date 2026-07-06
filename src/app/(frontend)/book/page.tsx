import { BookingWizard } from './BookingWizard'
import { Suspense } from 'react'
import { getEvents } from '@/lib/mock-db'

export default async function BookPage() {
  const events = await getEvents()

  return (
    <div className="flex flex-col w-full bg-background min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-heading mb-4">Book a Session</h1>
          <p className="text-foreground/70 font-light">
            Follow the steps below to secure your spot.
          </p>
        </div>
        
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading booking engine...</div>}>
          <BookingWizard events={events} />
        </Suspense>
      </div>
    </div>
  )
}
