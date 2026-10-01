'use client'

import React, { useState, useTransition } from 'react'
import { Save, Plus, Trash2, Loader2, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateClassType, addClassType, deleteClassType } from '@/app/actions/class-types'

type ClassType = {
  id: string
  name: string
  price: number
  duration: number
  color: string
  isActive: boolean
  deliveryMode?: 'ONLINE' | 'IN_PERSON'
  location?: string | null
}

type Mode = 'ONLINE' | 'IN_PERSON'

const PRESET_COLORS = ['#4A6FA5', '#E8A838', '#6B8E6B', '#9B6B9B', '#C4766E', '#8B7355', '#E06C75', '#56B6C2', '#C678DD', '#98C379']

function FormatPicker({ mode, location, onMode, onLocation }: { mode: Mode; location: string; onMode: (m: Mode) => void; onLocation: (l: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium">Class Format</label>
      <div className="grid grid-cols-2 gap-2">
        {([['ONLINE', 'Online (Zoom)'], ['IN_PERSON', 'In person']] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onMode(value)}
            className={`rounded-xl border px-4 py-2.5 text-sm transition-colors ${mode === value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-white hover:border-primary/50'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === 'IN_PERSON' && (
        <input
          type="text"
          value={location}
          onChange={(e) => onLocation(e.target.value)}
          maxLength={300}
          placeholder="Location / address, e.g. The Studio, 12 High Street, London"
          className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      )}
    </div>
  )
}

export function PricingManager({ initialClassTypes }: { initialClassTypes: ClassType[] }) {
  const [classTypes, setClassTypes] = useState<ClassType[]>(initialClassTypes)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState(0)
  const [editDuration, setEditDuration] = useState(60)
  const [editColor, setEditColor] = useState('#4A6FA5')
  const [editMode, setEditMode] = useState<Mode>('ONLINE')
  const [editLocation, setEditLocation] = useState('')

  // New class state
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState(20)
  const [newDuration, setNewDuration] = useState(60)
  const [newColor, setNewColor] = useState('#56B6C2')
  const [newMode, setNewMode] = useState<Mode>('ONLINE')
  const [newLocation, setNewLocation] = useState('')

  const startEditing = (ct: ClassType) => {
    setEditingId(ct.id)
    setEditPrice(ct.price)
    setEditDuration(ct.duration)
    setEditColor(ct.color)
    setEditMode(ct.deliveryMode === 'IN_PERSON' ? 'IN_PERSON' : 'ONLINE')
    setEditLocation(ct.location ?? '')
  }

  const handleSave = (id: string) => {
    setMessage(null)
    const location = editMode === 'IN_PERSON' ? editLocation.trim() || null : null
    startTransition(async () => {
      const res = await updateClassType(id, { price: editPrice, duration: editDuration, color: editColor, deliveryMode: editMode, location })
      if (res.success) {
        setClassTypes(prev => prev.map(ct => ct.id === id ? { ...ct, price: editPrice, duration: editDuration, color: editColor, deliveryMode: editMode, location } : ct))
        setEditingId(null)
        setMessage({ type: 'success', text: 'Class updated successfully!' })
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update' })
      }
    })
  }

  const handleToggleActive = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      const res = await updateClassType(id, { isActive: !currentActive })
      if (res.success) {
        setClassTypes(prev => prev.map(ct => ct.id === id ? { ...ct, isActive: !currentActive } : ct))
      }
    })
  }

  const handleAddClass = () => {
    if (!newName.trim()) return
    setMessage(null)
    startTransition(async () => {
      const res = await addClassType({
        name: newName.trim(), price: newPrice, duration: newDuration, color: newColor,
        deliveryMode: newMode, location: newMode === 'IN_PERSON' ? newLocation : null,
      })
      if (res.success) {
        setMessage({ type: 'success', text: 'New class type added!' })
        setShowAdd(false)
        setNewName('')
        setNewPrice(20)
        setNewDuration(60)
        // Reload class types
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to add class type' })
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this class type?')) return
    startTransition(async () => {
      const res = await deleteClassType(id)
      if (res.success) {
        setClassTypes(prev => prev.filter(ct => ct.id !== id))
        setMessage({ type: 'success', text: 'Class type deleted' })
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to delete' })
      }
    })
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {message.text}
        </div>
      )}

      {/* Class Types List */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-heading flex items-center gap-3">
              <Palette className="w-6 h-6 text-primary" />
              Class Types & Pricing
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Set default prices and durations for each class type.</p>
          </div>
          <Button onClick={() => setShowAdd(!showAdd)} className="rounded-full">
            <Plus className="w-4 h-4 mr-2" /> Add Class Type
          </Button>
        </div>

        {/* Add new class form */}
        {showAdd && (
          <div className="p-6 md:p-8 border-b border-border bg-muted/20">
            <h3 className="text-sm font-medium mb-4 uppercase tracking-wider text-muted-foreground">New Class Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Class Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Morning Flow"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Default Price (£)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Default Duration (mins)</label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(parseInt(e.target.value) || 60)}
                  min="5"
                  step="5"
                  className="w-full bg-white border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Color</label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${newColor === c ? 'border-primary scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <FormatPicker mode={newMode} location={newLocation} onMode={setNewMode} onLocation={setNewLocation} />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleAddClass} disabled={isPending || !newName.trim()} className="rounded-xl">
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Existing class types */}
        <div className="divide-y divide-border">
          {classTypes.map(ct => (
            <div key={ct.id} className={`p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-opacity ${ct.isActive ? '' : 'opacity-50'}`}>
              {editingId === ct.id ? (
                // Edit mode
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: editColor }} />
                      <span className="font-heading text-lg">{ct.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${editColor === c ? 'border-primary scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Price (£)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Duration (mins)</label>
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(parseInt(e.target.value) || 60)}
                      className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(ct.id)} disabled={isPending} className="rounded-xl flex-1">
                      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)} className="rounded-xl">
                      Cancel
                    </Button>
                  </div>
                  <div className="md:col-span-4">
                    <FormatPicker mode={editMode} location={editLocation} onMode={setEditMode} onLocation={setEditLocation} />
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex items-center gap-4">
                    <span className="w-5 h-5 rounded-md" style={{ backgroundColor: ct.color }} />
                    <div>
                      <h3 className="font-heading text-lg">{ct.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {ct.duration} mins • £{ct.price.toFixed(2)} • {ct.deliveryMode === 'IN_PERSON' ? `In person${ct.location ? ` (${ct.location})` : ''}` : 'Online'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(ct.id, ct.isActive)}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${ct.isActive ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 shadow-sm ${ct.isActive ? 'left-6' : 'left-0.5'}`} />
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => startEditing(ct)} className="rounded-xl">
                      Edit
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ct.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
