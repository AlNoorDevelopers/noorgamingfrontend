'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { NavBar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { TimeSlotPicker } from '@/components/ui/time-slot-picker'
import { bookings, auth } from '@/lib/supabase'

function BookPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const stationId = searchParams.get('station')
  const stationName = searchParams.get('name') || 'Gaming Station'
  const stationRate = Number(searchParams.get('rate')) || 120
  const urlDate = searchParams.get('date') || ''
  const urlStartTime = searchParams.get('startTime') || ''
  const urlEndTime = searchParams.get('endTime') || ''

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState(urlDate)
  const [selectedStartTime, setSelectedStartTime] = useState(urlStartTime)
  const [selectedEndTime, setSelectedEndTime] = useState(urlEndTime)
  const [duration, setDuration] = useState(1)
  const [userCount, setUserCount] = useState(1)
  const [advancePayment, setAdvancePayment] = useState(false)

  // Check auth state with session persistence
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await auth.getSession()
      setUser(data.session?.user || null)
    }
    
    checkAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthChange((event, session) => {
      setUser(session?.user || null)
    })
    
    return () => subscription?.unsubscribe()
  }, [])

  const handleSlotSelect = (startTime: string, endTime: string) => {
    setSelectedStartTime(startTime)
    // Calculate end time using proper date math
    const [hours, minutes] = startTime.split(':')
    const startDate = new Date()
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000)
    const calculatedEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`
    setSelectedEndTime(calculatedEndTime)
  }

  const handleLogin = () => {
    const params = new URLSearchParams({
      station: stationId || '',
      name: stationName,
      rate: stationRate.toString(),
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime
    })
    router.push(`/auth?${params.toString()}`)
  }

  const handleBooking = async () => {
    if (!user || !selectedDate || !selectedStartTime || !selectedEndTime) {
      setError('Please select date and time')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Send IST datetime strings directly (no timezone conversion)
      const startAtIST = `${selectedDate} ${selectedStartTime}`
      const endAtIST = `${selectedDate} ${selectedEndTime}`
      
      const { error } = await bookings.create({
        user_id: user.id,
        station_id: stationId,
        start_at: startAtIST,
        end_at: endAtIST,
        start_time: selectedStartTime,
        end_time: selectedEndTime,
        duration_hours: duration,
        user_count: userCount,
        advance_payment: advancePayment
      })

      if (error) {
        setError(error.message)
      } else {
        alert('Booking confirmed successfully!')
        router.push('/stations')
      }
    } catch (err) {
      setError('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {user ? 'CONFIRM' : 'BOOK'} <span className="text-cp-cyan">{user ? 'BOOKING' : 'NOW'}</span>
            </h1>
            <p className="text-xl text-gray-300">
              {user ? 'Complete your booking for' : 'Select time slot for'} {stationName}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-8 mb-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-300">Station:</span>
                  <div className="font-semibold">{stationName}</div>
                </div>
                <div>
                  <span className="text-gray-300">Rate:</span>
                  <div className="font-semibold text-cp-yellow">₹{stationRate}/hour</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-900 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none text-white [color-scheme:dark]"
                  title="Select booking date"
                />
              </div>

              {selectedDate && stationId && (
                <TimeSlotPicker
                  stationId={stationId}
                  selectedDate={selectedDate}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedStartTime}
                />
              )}

              {selectedStartTime && (
                <div>
                  <label className="block text-sm font-medium mb-2">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => {
                      const newDuration = Number(e.target.value)
                      setDuration(newDuration)
                      // Update end time when duration changes
                      if (selectedStartTime) {
                        const [hours, minutes] = selectedStartTime.split(':')
                        const startDate = new Date()
                        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
                        const endDate = new Date(startDate.getTime() + newDuration * 60 * 60 * 1000)
                        const calculatedEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`
                        setSelectedEndTime(calculatedEndTime)
                      }
                    }}
                    className="w-full bg-gray-900 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none text-white"
                    title="Select booking duration"
                  >
                    {[1,2,3,4,5,6].map(h => (
                      <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedStartTime && (
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Users</label>
                  <select
                    value={userCount}
                    onChange={(e) => setUserCount(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none text-white"
                    title="Select number of users"
                  >
                    <option value={1}>1 User</option>
                    <option value={2}>2 Users</option>
                    <option value={3}>3 Users</option>
                    <option value={4}>4 Users</option>
                  </select>
                </div>
              )}

              {user && selectedStartTime && (
                <div>
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      checked={advancePayment}
                      onChange={(e) => setAdvancePayment(e.target.checked)}
                      className="rounded border-cp-cyan/30 bg-gray-900 text-cp-cyan focus:ring-cp-cyan"
                    />
                    <span className="text-sm">Pay 30% advance (₹{Math.round(stationRate * duration * userCount * 0.3)})</span>
                  </label>
                </div>
              )}

              {user && selectedStartTime && (
                <div className="border-t border-cp-cyan/20 pt-4">
                  <div className="text-sm text-gray-300 mb-2">
                    ₹{stationRate}/hour × {duration} hour{duration > 1 ? 's' : ''} × {userCount} user{userCount > 1 ? 's' : ''}
                  </div>
                  {advancePayment && (
                    <div className="flex justify-between text-sm mb-1">
                      <span>Advance (30%):</span>
                      <span className="text-cp-cyan">₹{Math.round(stationRate * duration * userCount * 0.3)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>{advancePayment ? 'Pay Now:' : 'Total:'}</span>
                    <span className="text-cp-yellow">₹{advancePayment ? Math.round(stationRate * duration * userCount * 0.3) : stationRate * duration * userCount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            {!user ? (
            <button
                onClick={handleLogin}
              disabled={!selectedDate || !selectedStartTime}
              className="bg-cp-cyan text-cp-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-cp-yellow transition-colors duration-300 shadow-lg shadow-cp-cyan/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CONTINUE TO LOGIN
            </button>
            ) : (
              <button
                onClick={handleBooking}
                disabled={loading || !selectedDate || !selectedStartTime}
                className="bg-cp-cyan text-cp-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-cp-yellow transition-colors duration-300 shadow-lg shadow-cp-cyan/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'BOOKING...' : 'CONFIRM BOOKING'}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-cp-cyan text-lg">Loading...</div></div>}>
      <BookPageContent />
    </Suspense>
  )
} 