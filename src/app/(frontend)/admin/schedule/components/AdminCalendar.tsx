'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Loader2, Save, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { upsertCalendarEvent, deleteCalendarEvent, publishMonthCalendar } from '@/app/actions/calendar'
import type { ClassTypeInfo } from '@/lib/class-types'

type CalendarEvent = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  price: number
  isPublished: boolean
  bookingsCount: number
  deliveryMode?: 'ONLINE' | 'IN_PERSON'
  location?: string | null
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const DAY_NAMES_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

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

function getClassColor(title: string, classTypes: ClassTypeInfo[]): string {
  const ct = classTypes.find(c => c.name === title)
  if (ct) return ct.color
  return CLASS_COLORS[title] || '#6A7382'
}

export function AdminCalendar({
  initialEvents,
  classTypes,
}: {
  initialEvents: CalendarEvent[]
  classTypes: ClassTypeInfo[]
}) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('')

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formCustomTitle, setFormCustomTitle] = useState('')
  const [formStartTime, setFormStartTime] = useState('10:00')
  const [formEndTime, setFormEndTime] = useState('11:00')
  const [formPrice, setFormPrice] = useState(18)
  const [formMode, setFormMode] = useState<'ONLINE' | 'IN_PERSON'>('ONLINE')
  const [formLocation, setFormLocation] = useState('')

  // Fetch events when month changes
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`/api/calendar-events/admin?year=${year}&month=${month + 1}`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data)
        }
      } catch (e) {
        // Keep existing events on error
      }
    }
    // Only fetch if different from initial load
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

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // getDay() returns 0=Sun, we want 0=Mon
  const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {}
  events.forEach(e => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = []
    eventsByDate[e.date].push(e)
  })

  const openAddModal = (dateStr: string) => {
    setEditingEvent(null)
    setSelectedDateStr(dateStr)
    setFormTitle(classTypes.length > 0 ? classTypes[0].name : '')
    setFormCustomTitle('')
    const selectedCt = classTypes[0]
    setFormStartTime('10:00')
    setFormEndTime(selectedCt ? calculateEndTime('10:00', selectedCt.duration) : '11:00')
    setFormPrice(selectedCt?.price ?? 18)
    setFormMode('ONLINE')
    setFormLocation('')
    setShowModal(true)
  }

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event)
    setSelectedDateStr(event.date)
    // Check if it's a known class type
    const knownCt = classTypes.find(c => c.name === event.title)
    if (knownCt) {
      setFormTitle(knownCt.name)
      setFormCustomTitle('')
    } else {
      setFormTitle('__custom__')
      setFormCustomTitle(event.title)
    }
    setFormStartTime(event.startTime)
    setFormEndTime(event.endTime)
    setFormPrice(event.price)
    setFormMode(event.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE')
    setFormLocation(event.location ?? '')
    setShowModal(true)
  }

  function calculateEndTime(start: string, durationMins: number): string {
    const [h, m] = start.split(':').map(Number)
    const totalMins = h * 60 + m + durationMins
    const endH = Math.floor(totalMins / 60) % 24
    const endM = totalMins % 60
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
  }

  const handleTitleChange = (title: string) => {
    setFormTitle(title)
    if (title !== '__custom__') {
      const ct = classTypes.find(c => c.name === title)
      if (ct) {
        setFormPrice(ct.price)
        setFormEndTime(calculateEndTime(formStartTime, ct.duration))
      }
    }
  }

  const handleStartTimeChange = (time: string) => {
    setFormStartTime(time)
    if (formTitle !== '__custom__') {
      const ct = classTypes.find(c => c.name === formTitle)
      if (ct) {
        setFormEndTime(calculateEndTime(time, ct.duration))
      }
    }
  }

  const handleSaveEvent = () => {
    const title = formTitle === '__custom__' ? formCustomTitle.trim() : formTitle
    if (!title) return

    setMessage(null)
    startTransition(async () => {
      const res = await upsertCalendarEvent({
        id: editingEvent?.id,
        title,
        date: selectedDateStr,
        startTime: formStartTime,
        endTime: formEndTime,
        price: formPrice,
        deliveryMode: formMode,
        location: formMode === 'IN_PERSON' ? formLocation : null,
      })

      if (res.success) {
        setMessage({ type: 'success', text: editingEvent ? 'Event updated!' : 'Event added!' })
        setShowModal(false)
        // Refetch events
        try {
          const fetchRes = await fetch(`/api/calendar-events/admin?year=${year}&month=${month + 1}`)
          if (fetchRes.ok) setEvents(await fetchRes.json())
        } catch (e) {}
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to save event' })
      }
    })
  }

  const handleDeleteEvent = (id: string) => {
    setMessage(null)
    startTransition(async () => {
      const res = await deleteCalendarEvent(id)
      if (res.success) {
        setEvents(prev => prev.filter(e => e.id !== id))
        setMessage({ type: 'success', text: 'Event deleted' })
        setShowModal(false)
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to delete' })
      }
    })
  }

  const handleSaveCalendar = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await publishMonthCalendar(year, month + 1)
      if (res.success) {
        setMessage({ type: 'success', text: `${MONTH_NAMES[month]} ${year} calendar saved & published!` })
        // Refetch to update publish status
        try {
          const fetchRes = await fetch(`/api/calendar-events/admin?year=${year}&month=${month + 1}`)
          if (fetchRes.ok) setEvents(await fetchRes.json())
        } catch (e) {}
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to publish calendar' })
      }
    })
  }

  const unpublishedCount = events.filter(e => !e.isPublished).length

  return (
    <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-border bg-muted/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-heading flex items-center gap-3">
              📅 Class Calendar
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Click any date to add classes. Click &ldquo;Save Calendar&rdquo; to publish.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unpublishedCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium border border-amber-200">
                {unpublishedCount} unpublished
              </span>
            )}
            <Button
              onClick={handleSaveCalendar}
              disabled={isPending || events.length === 0}
              className="rounded-full shadow-sm bg-primary hover:bg-primary/90"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Calendar
            </Button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full w-10 h-10 border-border">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-xl font-heading">
            {MONTH_NAMES[month]} {year}
          </h3>
          <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full w-10 h-10 border-border">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div className={`mx-6 mt-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {message.text}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="p-4 md:p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px mb-px">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center py-3 bg-muted/30 first:rounded-tl-xl last:rounded-tr-xl">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-px bg-border/50">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-card min-h-[120px] p-2" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const dayEvents = eventsByDate[dateStr] || []
            const isToday = year === now.getFullYear() && month === now.getMonth() && d === now.getDate()
            const isPast = new Date(year, month, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate())

            return (
              <div
                key={d}
                className={`bg-card min-h-[120px] p-2 relative group transition-colors hover:bg-muted/20 ${isPast ? 'opacity-50' : ''}`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground/70'}`}>
                    {d}
                  </span>
                  {!isPast && (
                    <button
                      onClick={() => openAddModal(dateStr)}
                      className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => openEditModal(event)}
                      className="w-full text-left rounded-md px-1.5 py-0.5 text-[10px] leading-tight transition-all hover:shadow-sm truncate block"
                      style={{ backgroundColor: getClassColor(event.title, classTypes) + '20', color: getClassColor(event.title, classTypes), borderLeft: `3px solid ${getClassColor(event.title, classTypes)}` }}
                    >
                      <span className="font-semibold">{event.startTime}–{event.endTime}</span>
                      <br />
                      <span className="font-medium">{event.title}</span>
                      {event.deliveryMode === 'IN_PERSON' && (
                        <span className="block text-[9px] uppercase tracking-wide opacity-80">In person</span>
                      )}
                      {!event.isPublished && (
                        <span className="ml-1 text-amber-600">●</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 flex-wrap px-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-amber-500">●</span> Unpublished
          </span>
          {classTypes.filter(ct => ct.isActive).map((ct, idx) => (
            <span key={`${ct.id}-${ct.name}-${idx}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: ct.color }} />
              {ct.name}
            </span>
          ))}
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-3xl shadow-2xl border border-border w-full max-w-md mx-4 p-8" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-heading mb-1">
              {editingEvent ? 'Edit Class' : 'Add Class'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="space-y-5">
              {/* Class Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Class Type</label>
                <select
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                >
                  {classTypes.filter(ct => ct.isActive).map((ct, idx) => (
                    <option key={`${ct.id}-${ct.name}-${idx}`} value={ct.name}>{ct.name}</option>
                  ))}
                  <option value="__custom__">✏️ Custom Class Name</option>
                </select>
              </div>

              {/* Custom class name */}
              {formTitle === '__custom__' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Custom Class Name</label>
                  <input
                    type="text"
                    value={formCustomTitle}
                    onChange={(e) => setFormCustomTitle(e.target.value)}
                    placeholder="e.g., Special Breathwork Session"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}

              {/* Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Class Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {([['ONLINE', 'Online (Zoom)'], ['IN_PERSON', 'In person']] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormMode(value)}
                      className={`rounded-xl border px-4 py-2.5 text-sm transition-colors ${formMode === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-white hover:border-primary/50'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formMode === 'ONLINE' ? 'A Zoom link is created automatically and emailed on booking.' : 'No Zoom link — the confirmation email includes the location below.'}
                </p>
              </div>

              {formMode === 'IN_PERSON' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location / Address</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    maxLength={300}
                    placeholder="e.g., The Studio, 12 High Street, London"
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">End Time</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Price (£)</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">Default prices can be changed from the Pricing tab.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {editingEvent ? (
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  onClick={() => handleDeleteEvent(editingEvent.id)}
                  disabled={isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-xl" disabled={isPending}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEvent}
                  disabled={isPending || (!formTitle || (formTitle === '__custom__' && !formCustomTitle.trim()))}
                  className="rounded-xl"
                >
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingEvent ? 'Update' : 'Add Class'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
