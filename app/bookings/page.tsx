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
  const [error, setError] = useState('')
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-500/20 text-blue-400'
      case 'ONGOING': return 'bg-green-500/20 text-green-400'
      case 'ENDED': return 'bg-gray-500/20 text-gray-400'
      case 'CANCELLED': return 'bg-red-500/20 text-red-400'
      default: return 'bg-yellow-500/20 text-yellow-400'
    }
  }

  // Check auth state
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
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-gray-400 text-sm">Date:</span>
          <p className="font-semibold">{new Date(booking.start_at).toLocaleDateString()}</p>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Time:</span>
          <p className="font-semibold">
            {new Date(booking.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            {new Date(booking.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-gray-400 text-sm">Station:</span>
          <p className="font-semibold">{booking.stations?.name}</p>
        </div>
        <div>
          <span className="text-gray-400 text-sm">Status:</span>
          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-gray-400 text-sm">Payment:</span>
          <p className="font-semibold text-cp-yellow">₹{booking.total_amount || 0}</p>
          {booking.advance_paid && (
            <p className="text-xs text-cp-cyan">Advance paid: ₹{booking.advance_amount}</p>
          )}
        </div>
        <div>
          <span className="text-gray-400 text-sm">Payment Status:</span>
          <span className={`px-2 py-1 rounded text-xs ${booking.payment_status === 'ADVANCE_PAID' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {booking.payment_status === 'ADVANCE_PAID' ? 'Advance Paid' : 'Pending'}
          </span>
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