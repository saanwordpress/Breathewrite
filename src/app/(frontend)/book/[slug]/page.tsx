'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { createCheckoutSession } from '@/app/actions/checkout'

// Define the mock data shape based on the offerings data
const OFFERINGS: Record<string, any> = {
  'breathe-and-flow': { title: 'Breathe & Flow', durationMins: 50, price: 18, modality: 'Online' },
  'breathe-and-go': { title: 'Breathe & Go', durationMins: 20, price: 10, modality: 'Online' },
  'breathe-and-write': { title: 'Breathe & Write', durationMins: 120, price: 22, modality: 'Online' },
  'neurodynamic-breathwork': { title: 'Neurodynamic Breathwork', durationMins: 120, price: 22, modality: 'Online' },
  'private-11-online-session-60-mins': { title: 'Private 1:1 Online Session (60 mins)', durationMins: 60, price: 65, modality: 'Online' },
  'private-11-onlinesession-120-mins': { title: 'Private 1:1 Online Session (120 mins)', durationMins: 120, price: 95, modality: 'Online' },
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = typeof params.slug === 'string' ? params.slug : 'breathe-and-flow'
  
  const offering = OFFERINGS[slug] || OFFERINGS['breathe-and-flow']

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  const [availability, setAvailability] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    async function fetchAvailability() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/availability?year=${year}&month=${month + 1}&duration=${offering.durationMins}`)
        if (res.ok) {
          const data = await res.json()
          setAvailability(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAvailability()
  }, [year, month, offering.durationMins])

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const handleDateSelect = (dateStr: string, isAvail: boolean) => {
    if (!isAvail) return
    setSelectedDate(dateStr)
    setSelectedTime(null)
  }

  const selectedDayData = availability.find(d => d.date === selectedDate)
  const [isPending, startTransition] = useTransition()

  const handleCheckout = () => {
    if (!selectedDate || !selectedTime) return
    startTransition(() => {
      createCheckoutSession(slug, selectedDate, selectedTime, offering.durationMins, offering.price, false)
    })
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <Link href={`/offerings/${slug}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to offering details
        </Link>
        
        <div className="bg-card rounded-[2rem] shadow-xl border border-border/50 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          
          {/* Left Panel: Offering Info */}
          <div className="w-full lg:w-[350px] bg-muted/30 p-8 md:p-12 border-r border-border/50">
            <span className="inline-block px-3 py-1 bg-[#EBCBBA]/30 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-6">
              Booking
            </span>
            <h1 className="text-3xl font-heading mb-6 leading-tight">{offering.title}</h1>
            
            <div className="space-y-5 text-muted-foreground">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">{offering.durationMins} minutes</span>
              </div>
              <div className="flex items-start gap-4">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">£{offering.price}</span>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="font-medium">{offering.modality}</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Calendar */}
          <div className="flex-1 p-8 md:p-12 relative flex">
            <div className={`transition-all duration-500 ease-in-out ${selectedDate ? 'w-full md:w-3/5 md:pr-8' : 'w-full'}`}>
              <h2 className="text-2xl font-heading mb-8">Select a Date & Time</h2>
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-medium">
                  {MONTH_NAMES[month]} {year}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full w-10 h-10 border-border" disabled={currentDate < new Date()}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full w-10 h-10 border-border">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-8">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{d}</div>
                  ))}
                  
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                    const dayData = availability.find(a => a.date === dateStr)
                    const isAvail = dayData?.isAvailable || false
                    const isSelected = selectedDate === dateStr
                    
                    return (
                      <button
                        key={d}
                        onClick={() => handleDateSelect(dateStr, isAvail)}
                        disabled={!isAvail}
                        className={`
                          aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${isAvail ? 'hover:bg-[#EBCBBA]/20 cursor-pointer' : 'text-muted-foreground/30 cursor-default'}
                          ${isSelected ? 'bg-primary text-primary-foreground hover:bg-primary shadow-md' : ''}
                          ${isAvail && !isSelected ? 'text-foreground bg-muted/20' : ''}
                        `}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Time Slots Slide-in */}
            <AnimatePresence>
              {selectedDate && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full md:w-2/5 md:border-l border-border/50 md:pl-8 absolute inset-0 md:relative bg-card z-10 p-8 md:p-0 overflow-y-auto"
                >
                  <div className="md:hidden mb-6">
                    <Button variant="ghost" className="px-0 -ml-2" onClick={() => setSelectedDate(null)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Calendar
                    </Button>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-6">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedDayData?.slots?.map((slot: any, i: number) => (
                      <div key={i} className="flex gap-2">
                        <Button 
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          className={`flex-1 rounded-xl py-6 ${selectedTime === slot.time ? 'bg-primary text-primary-foreground' : 'border-primary/20 text-primary hover:border-primary'}`}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          {slot.time}
                        </Button>
                        
                        <AnimatePresence>
                          {selectedTime === slot.time && (
                            <motion.div
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                            >
                              <Button 
                                disabled={isPending}
                                className="h-full rounded-xl px-6 bg-[#EBCBBA] text-primary hover:bg-[#EBCBBA]/80 whitespace-nowrap" 
                                onClick={handleCheckout}
                              >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Next'}
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  )
}
