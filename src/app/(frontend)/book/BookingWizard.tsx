'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, Calendar as CalendarIcon, Clock, Users, ArrowRight, ArrowLeft } from 'lucide-react'

// Map events to unique offerings based on title
function extractOfferings(events: any[]) {
  const map = new Map()
  events.forEach(e => {
    if (!map.has(e.title)) {
      map.set(e.title, { id: e.title, title: e.title, price: Number(e.price) || 35 })
    }
  })
  return Array.from(map.values())
}

export function BookingWizard({ events = [] }: { events: any[] }) {
  const searchParams = useSearchParams()
  const initialEventId = searchParams.get('eventId')
  const wantsMembership = searchParams.get('membership') === 'true'

  const [step, setStep] = useState(wantsMembership ? 3 : 1)
  const [selectedOffering, setSelectedOffering] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(initialEventId)
  const [participants, setParticipants] = useState(1)
  const [addMembership, setAddMembership] = useState(wantsMembership)

  // Handlers
  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const OFFERINGS = extractOfferings(events)
  
  // Filter dates based on selected offering
  const availableDates = events.filter(e => e.title === selectedOffering && e.status !== 'PAST')

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-xl">
      {/* Progress */}
      {!wantsMembership && (
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-border z-0" />
          {[1, 2, 3].map(i => (
            <div key={i} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-background border border-border text-muted-foreground'}`}>
              {step > i ? <Check className="w-4 h-4" /> : i}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Select Offering */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-heading mb-6">Select a Class</h2>
          {OFFERINGS.length === 0 ? (
             <p className="text-muted-foreground font-light text-center py-8">No upcoming classes available right now. Please check back later!</p>
          ) : (
            <div className="grid gap-4">
              {OFFERINGS.map(offering => (
                <button
                  key={offering.id}
                  onClick={() => {
                    setSelectedOffering(offering.id)
                    setSelectedDate(null) // Reset date if offering changes
                  }}
                  className={`p-6 rounded-2xl border text-left transition-all ${selectedOffering === offering.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium">{offering.title}</h3>
                    <span className="text-lg">${offering.price}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <Button onClick={nextStep} disabled={!selectedOffering} className="w-full rounded-full py-6 mt-4">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button variant="ghost" onClick={prevStep} className="mb-4 -ml-4 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-heading mb-6">Choose a Date & Time</h2>
          {availableDates.length === 0 ? (
             <p className="text-muted-foreground font-light text-center py-8">No upcoming dates for this offering. Check back soon!</p>
          ) : (
            <div className="grid gap-4">
              {availableDates.map(d => (
                <button
                  key={d.id}
                  onClick={() => d.status !== 'FULL' && setSelectedDate(d.id)}
                  disabled={d.status === 'FULL'}
                  className={`p-6 rounded-2xl border flex items-center justify-between transition-all ${
                    selectedDate === d.id ? 'border-primary ring-1 ring-primary bg-primary/5' : 
                    d.status === 'FULL' ? 'opacity-50 cursor-not-allowed bg-muted/20 border-border' : 
                    'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-4">
                      <CalendarIcon className={`w-5 h-5 ${selectedDate === d.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-lg">{d.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{d.time}</span>
                    </div>
                  </div>
                  {d.status === 'FULL' ? (
                     <span className="text-xs uppercase font-semibold text-secondary">Full</span>
                  ) : (
                     <span className="text-xs text-muted-foreground">{d.capacity} Booked</span>
                  )}
                </button>
              ))}
            </div>
          )}
          
          <div className="mt-8">
            <label className="block text-sm font-medium mb-3 text-foreground/80">Number of Participants</label>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="rounded-full w-12 h-12 p-0" onClick={() => setParticipants(p => Math.max(1, p - 1))}>-</Button>
              <span className="text-xl font-medium w-8 text-center">{participants}</span>
              <Button variant="outline" className="rounded-full w-12 h-12 p-0" onClick={() => setParticipants(p => Math.min(10, p + 1))}>+</Button>
            </div>
          </div>

          <Button onClick={nextStep} disabled={!selectedDate} className="w-full rounded-full py-6 mt-8">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 3: Upsell & Checkout */}
      {step === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!wantsMembership && (
            <Button variant="ghost" onClick={prevStep} className="mb-2 -ml-4 text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          
          <h2 className="text-2xl font-heading mb-6">Review & Checkout</h2>
          
          {/* Summary */}
          {!wantsMembership && (
            <div className="bg-muted/30 p-6 rounded-2xl space-y-4">
              <h3 className="font-medium text-lg">Booking Summary</h3>
              <div className="flex justify-between text-sm font-light text-foreground/80">
                <span>Class:</span>
                <span className="font-medium text-foreground">{OFFERINGS.find(o => o.id === selectedOffering)?.title}</span>
              </div>
              <div className="flex justify-between text-sm font-light text-foreground/80">
                <span>When:</span>
                <span className="font-medium text-foreground">
                  {events.find(e => e.id === selectedDate)?.date} @ {events.find(e => e.id === selectedDate)?.time}
                </span>
              </div>
              <div className="flex justify-between text-sm font-light text-foreground/80">
                <span>Participants:</span>
                <span className="font-medium text-foreground">{participants}</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-medium">
                <span>Total:</span>
                <span>${(OFFERINGS.find(o => o.id === selectedOffering)?.price || 0) * participants}</span>
              </div>
            </div>
          )}

          {/* Upsell */}
          {!wantsMembership && (
            <button 
              onClick={() => setAddMembership(!addMembership)}
              className={`w-full p-6 rounded-2xl border transition-all text-left flex items-start gap-4 ${addMembership ? 'border-accent bg-accent/10 ring-1 ring-accent' : 'border-border hover:border-accent/50'}`}
            >
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${addMembership ? 'bg-accent border-accent text-primary' : 'border-border'}`}>
                {addMembership && <Check className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="font-medium text-lg mb-1">Add Monthly Membership</h4>
                <p className="text-sm font-light text-foreground/70 mb-2">Get unlimited sessions for just $45/month. This session is included for free if you join today.</p>
                <span className="text-accent font-medium text-sm block">Highly Recommended</span>
              </div>
            </button>
          )}

          <div className="pt-6">
            <Button className="w-full rounded-full py-6 text-lg" onClick={() => alert('Redirect to Stripe Checkout')}>
              {addMembership || wantsMembership ? 'Checkout ($45/month)' : 'Checkout'}
            </Button>
            <div className="text-center mt-4 text-sm font-light text-muted-foreground flex items-center justify-center gap-2">
              <span>Secure checkout via Stripe</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
