'use client'

import React, { useState, useTransition } from 'react'
import { Clock, CalendarX, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveWeeklySchedule, addDateOverride, deleteDateOverride } from '@/app/actions/schedule'

type WeeklyScheduleItem = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isWorking: boolean
}

type OverrideItem = {
  id: string
  date: Date
  isWorking: boolean
  startTime: string | null
  endTime: string | null
}

export function ScheduleManager({
  initialSchedule,
  initialOverrides
}: {
  initialSchedule: WeeklyScheduleItem[]
  initialOverrides: OverrideItem[]
}) {
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>(initialSchedule)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleToggleDay = (index: number) => {
    const newSchedule = [...schedule]
    newSchedule[index].isWorking = !newSchedule[index].isWorking
    setSchedule(newSchedule)
  }

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSchedule = [...schedule]
    newSchedule[index][field] = value
    setSchedule(newSchedule)
  }

  const handleSaveWeekly = () => {
    setErrorMsg('')
    setSuccessMsg('')
    startTransition(async () => {
      const res = await saveWeeklySchedule(schedule)
      if (res.success) {
        setSuccessMsg('Weekly schedule saved successfully!')
      } else {
        setErrorMsg(res.error || 'Failed to save schedule')
      }
    })
  }

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Overrides State
  const [overrideDate, setOverrideDate] = useState('')
  const [overrideIsWorking, setOverrideIsWorking] = useState(false)
  const [overrideStart, setOverrideStart] = useState('09:00')
  const [overrideEnd, setOverrideEnd] = useState('17:00')

  const handleAddOverride = () => {
    if (!overrideDate) return
    setErrorMsg('')
    setSuccessMsg('')
    startTransition(async () => {
      const res = await addDateOverride(overrideDate, overrideIsWorking, overrideStart, overrideEnd)
      if (res.success) {
        setSuccessMsg('Date override added!')
        setOverrideDate('')
      } else {
        setErrorMsg(res.error || 'Failed to add override')
      }
    })
  }

  const handleDeleteOverride = (id: string) => {
    startTransition(async () => {
      await deleteDateOverride(id)
    })
  }

  return (
    <div className="grid gap-8">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm border border-green-100">
          {successMsg}
        </div>
      )}

      {/* Weekly Hours Card */}
      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              Weekly Hours
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Set your standard recurring availability.</p>
          </div>
          <Button onClick={handleSaveWeekly} disabled={isPending} className="rounded-full shadow-sm">
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
        
        <div className="space-y-4">
          {schedule.map((dayItem, index) => (
            <div key={dayItem.dayOfWeek} className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-border/50 last:border-0 gap-4">
              
              {/* Toggle Switch */}
              <div className="flex items-center gap-4 w-40">
                <button 
                  onClick={() => handleToggleDay(index)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${dayItem.isWorking ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 shadow-sm ${dayItem.isWorking ? 'left-6' : 'left-0.5'}`}></div>
                </button>
                <span className={`font-medium ${dayItem.isWorking ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {DAYS[dayItem.dayOfWeek]}
                </span>
              </div>

              {/* Time Inputs */}
              {dayItem.isWorking ? (
                <div className="flex items-center gap-3 bg-muted/30 p-2 rounded-xl">
                  <input 
                    type="time" 
                    value={dayItem.startTime} 
                    onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                    className="bg-white border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-muted-foreground text-sm font-medium">to</span>
                  <input 
                    type="time" 
                    value={dayItem.endTime} 
                    onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                    className="bg-white border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-end">
                  <span className="text-muted-foreground bg-muted px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                    Unavailable
                  </span>
                </div>
              )}
            </div>
          ))}
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
            <p className="text-muted-foreground text-sm mt-1">Block out holidays or set custom hours for specific dates.</p>
          </div>
        </div>

        {/* Add Override Form */}
        <div className="bg-muted/30 p-6 rounded-2xl mb-8 border border-border">
          <h3 className="text-sm font-medium mb-4 uppercase tracking-wider text-muted-foreground">Add New Override</h3>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Select Date</label>
              <input 
                type="date" 
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium block">Working?</label>
              <button 
                  onClick={() => setOverrideIsWorking(!overrideIsWorking)}
                  className={`w-14 h-7 rounded-full relative transition-colors duration-200 focus:outline-none mt-1 ${overrideIsWorking ? 'bg-primary' : 'bg-red-500'}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white absolute top-0.5 transition-transform duration-200 shadow-sm ${overrideIsWorking ? 'left-7' : 'left-0.5'}`}></div>
              </button>
            </div>

            {overrideIsWorking ? (
              <div className="flex items-center gap-2">
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-medium">Start</label>
                  <input type="time" value={overrideStart} onChange={e => setOverrideStart(e.target.value)} className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-medium">End</label>
                  <input type="time" value={overrideEnd} onChange={e => setOverrideEnd(e.target.value)} className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm" />
                </div>
              </div>
            ) : (
              <div className="h-10 flex items-center justify-center">
                <span className="text-xs text-red-500 font-medium px-4 py-1.5 bg-red-50 rounded-full border border-red-100">Entire day blocked</span>
              </div>
            )}

            <Button onClick={handleAddOverride} disabled={isPending || !overrideDate} className="rounded-xl h-10 px-6">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
        </div>

        {/* Existing Overrides List */}
        <h3 className="text-sm font-medium mb-4 uppercase tracking-wider text-muted-foreground">Upcoming Overrides</h3>
        
        {initialOverrides.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-white">
            <CalendarX className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No date overrides configured yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {initialOverrides.map(override => (
              <div key={override.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-white shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="font-heading text-lg">
                    {new Date(override.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                  </div>
                  {override.isWorking ? (
                    <span className="text-sm font-medium text-primary bg-primary/5 px-3 py-1 rounded-full">
                      {override.startTime} - {override.endTime}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                      Unavailable
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteOverride(override.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
