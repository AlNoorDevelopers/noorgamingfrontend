'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { bookings, auth } from '@/lib/supabase'

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await auth.getUser()
      if (!data.user) {
        router.push('/auth')
        return
      }
      setUser(data.user)
      
      // Fetch both active and cancelled bookings
      const [activeResult, cancelledResult] = await Promise.all([
        bookings.getUserBookings(data.user.id),
        bookings.getUserCancelledBookings(data.user.id)
      ])
      
      const allBookings = [...(activeResult.data || []), ...(cancelledResult.data || [])]
      setUserBookings(allBookings)
      setLoading(false)
    }
    getUser()
  }, [router])

  const categorizeBookings = (bookings: any[]) => {
    return {
      upcoming: bookings.filter(b => b.status === 'UPCOMING'),
      ongoing: bookings.filter(b => b.status === 'ONGOING'),
      ended: bookings.filter(b => b.status === 'ENDED'),
      cancelled: bookings.filter(b => b.status === 'CANCELLED')
    }
  }

  const categories = categorizeBookings(userBookings)
  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: categories.upcoming.length },
    { id: 'ongoing', label: 'Ongoing', count: categories.ongoing.length },
    { id: 'ended', label: 'Ended', count: categories.ended.length },
    { id: 'cancelled', label: 'Cancelled', count: categories.cancelled.length }
  ]

  const BookingCard = ({ booking }: { booking: any }) => (
    <div className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-cp-cyan">{booking.stations?.name || 'Gaming Station'}</h3>
          <p className="text-sm text-gray-400">{booking.stations?.type || 'Gaming'}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-cp-yellow">₹{booking.total_amount || 0}</div>
          <div className="text-sm text-gray-400">{booking.duration_hours || 1}h session</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Start:</span>
          <div className="font-semibold">{new Date(booking.start_at).toLocaleString()}</div>
        </div>
        <div>
          <span className="text-gray-400">End:</span>
          <div className="font-semibold">{new Date(booking.end_at).toLocaleString()}</div>
        </div>
      </div>
    </div>
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              MY <span className="text-cp-cyan">BOOKINGS</span>
            </h1>
            <p className="text-gray-300">Track your gaming sessions</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cp-cyan text-cp-black'
                    : 'bg-cp-gray/20 text-gray-300 hover:bg-cp-cyan/20'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Bookings List */}
          <div>
            {categories[activeTab as keyof typeof categories].length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-400">No {activeTab} bookings found</p>
              </div>
            ) : (
              categories[activeTab as keyof typeof categories].map((booking: any) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 