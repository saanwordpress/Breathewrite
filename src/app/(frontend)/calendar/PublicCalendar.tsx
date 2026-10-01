'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { isClassPast } from '@/lib/time'

type CalendarEvent = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  price: number
  bookingsCount: number
  deliveryMode?: 'ONLINE' | 'IN_PERSON'
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Color mapping for known class types
const CLASS_COLORS: Record<string, string> = {
  'Breathe & Flow': '#4A6FA5',
  'Breathe & Write': '#6B8E6B',
  'Breathe & Go': '#E8A838',
  'Neurodynamic Breathwork': '#9B6B9B',
  'Private 1:1 Session | 60 mins': '#C4766E',
  'Private 1:1 Session | 120 mins': '#8B7355',
  'Breathe & Move': '#2E8B57',
  'Corporate Wellness': '#4682B4',
}

function getClassColor(title: string): string {
  return CLASS_COLORS[title] || '#4A6FA5'
}

export function PublicCalendar() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/calendar-events?year=${year}&month=${month + 1}`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvents()
  }, [year, month])

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(y => y + 1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(y => y - 1)
    } else {
      setMonth(m => m - 1)
    }
  }

  const goToToday = () => {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const isPastMonth = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth())

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // getDay() returns 0=Sun, we want Mon first (0=Mon)
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {}
  events.forEach(e => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = []
    eventsByDate[e.date].push(e)
  })

  const handleEventClick = (event: CalendarEvent) => {
    router.push(`/book?eventId=${encodeURIComponent(event.id)}`)
  }

  return (
    <div className="bg-card border border-border/50 rounded-[2rem] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-border/50">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            aria-label="Previous month"
            className="rounded-full w-10 h-10 border-border"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-heading">
              {MONTH_NAMES[month]} {year}
            </h2>
            {isCurrentMonth ? (
              <span className="text-xs text-muted-foreground">This month</span>
            ) : (
              <button onClick={goToToday} className="text-xs font-medium text-primary underline underline-offset-4 hover:opacity-80">
                Back to this month
              </button>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month" className="rounded-full w-10 h-10 border-border">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        {isPastMonth && (
          <p className="mt-4 text-center text-sm text-muted-foreground font-light">
            You&rsquo;re viewing past classes. These can&rsquo;t be booked.
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="p-2 md:p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px mb-px">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-xs md:text-sm font-semibold text-center py-3 text-muted-foreground uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border/30 border border-border/30 rounded-xl overflow-hidden">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-card min-h-[100px] md:min-h-[130px] p-2" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
              const dayEvents = eventsByDate[dateStr] || []
              const isToday = year === now.getFullYear() && month === now.getMonth() && d === now.getDate()
              const isPastDay = new Date(year, month, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate())
              const dayOfWeek = (new Date(year, month, d).getDay() + 6) % 7
              const hasUpcoming = dayEvents.some(e => !isClassPast(e.date, e.startTime, now))

              return (
                <div
                  key={d}
                  className={`min-h-[100px] md:min-h-[130px] p-1.5 md:p-2 transition-colors ${
                    hasUpcoming
                      ? 'bg-[#F9F8F6]'
                      : isPastDay
                      ? 'bg-muted/30'
                      : 'bg-card'
                  }`}
                >
                  {/* Day label */}
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="hidden md:inline text-[10px] text-muted-foreground font-medium uppercase">
                        {DAY_NAMES[dayOfWeek]}
                      </span>
                      <span className={`block text-sm md:text-base font-medium ${isToday ? 'bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center' : isPastDay ? 'text-foreground/40 pl-0.5' : 'text-foreground/70 pl-0.5'}`}>
                        {d}
                      </span>
                    </div>
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.map((event, idx) => {
                      const eventPast = isClassPast(event.date, event.startTime, now)
                      const color = eventPast ? '#9CA3AF' : getClassColor(event.title)
                      return (
                        <button
                          key={`${event.id}-${idx}`}
                          onClick={() => !eventPast && handleEventClick(event)}
                          disabled={eventPast}
                          title={eventPast ? 'This class has already taken place' : `Book ${event.title}`}
                          className={`w-full text-left rounded-md px-1.5 py-1 transition-all ${eventPast ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'}`}
                          style={{
                            backgroundColor: color + '15',
                            borderLeft: `3px solid ${color}`,
                          }}
                        >
                          <span className="block text-[10px] md:text-xs font-semibold" style={{ color }}>
                            {event.startTime}–{event.endTime}
                          </span>
                          <span className={`block text-[10px] md:text-xs font-medium truncate leading-tight ${eventPast ? 'text-foreground/50 line-through' : 'text-foreground/80'}`}>
                            {event.title}
                          </span>
                          {event.deliveryMode === 'IN_PERSON' && (
                            <span className="block text-[9px] md:text-[10px] uppercase tracking-wide text-foreground/60">In person</span>
                          )}
                          {eventPast && (
                            <span className="block text-[9px] md:text-[10px] uppercase tracking-wide text-muted-foreground">Past</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-4 flex-wrap justify-center px-4">
            {Object.entries(CLASS_COLORS).map(([name, color]) => (
              <span key={name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
