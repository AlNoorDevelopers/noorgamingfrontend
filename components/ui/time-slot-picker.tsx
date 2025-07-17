'use client'

import { useState, useEffect } from 'react'
import { bookings } from '@/lib/supabase'

interface TimeSlotPickerProps {
  stationId: string
  selectedDate: string
  onSlotSelect: (startTime: string, endTime: string) => void
  selectedSlot?: string
}

export function TimeSlotPicker({ stationId, selectedDate, onSlotSelect, selectedSlot }: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (stationId && selectedDate) {
      console.log('Loading slots for:', stationId, selectedDate)
      loadAvailableSlots()
    }
  }, [stationId, selectedDate])

  const loadAvailableSlots = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await bookings.getAvailableSlots(stationId, selectedDate)
      console.log('Slots response:', { data, error })
      
      if (error) {
        setError(error.message)
        console.error('Error loading slots:', error)
      } else if (data) {
        setAvailableSlots(data)
      }
    } catch (err) {
      console.error('Exception loading slots:', err)
      setError('Failed to load time slots')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':')
    const startDate = new Date()
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // +1 hour
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium mb-2">Select Time Slot</label>
        <div className="text-center py-4 text-cp-cyan">Loading time slots...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium mb-2">Select Time Slot</label>
        <div className="text-center py-4 text-red-400">
          Error: {error}
          <br />
          <button 
            onClick={loadAvailableSlots}
            className="mt-2 text-cp-cyan hover:text-cp-yellow text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2">Select Time Slot</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {availableSlots.map((slot) => (
          <button
            key={slot.hour_slot}
            onClick={() => onSlotSelect(slot.hour_slot, getEndTime(slot.hour_slot))}
            disabled={!slot.is_available}
            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
              selectedSlot === slot.hour_slot
                ? 'bg-cp-cyan text-cp-black border-cp-cyan'
                : slot.is_available
                ? 'bg-cp-black/50 text-white border-cp-cyan/30 hover:border-cp-cyan'
                : 'bg-cp-gray/20 text-gray-500 border-gray-600 cursor-not-allowed'
            }`}
          >
            {formatTime(slot.hour_slot)}
            {!slot.is_available && (
              <div className="text-xs text-red-400 mt-1">Booked</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
} 