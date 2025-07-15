'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '@/components/ui/navbar'
import { AdminGuard } from '@/components/ui/admin-guard'
import { bookings, profiles } from '@/lib/supabase'

// Booking Edit Modal Component
const BookingModal = ({ booking, onSave, onClose }: any) => {
  const [formData, setFormData] = useState({
    start_time: booking?.start_time || '',
    end_time: booking?.end_time || '',
    duration_hours: booking?.duration_hours || 1,
    total_amount: booking?.total_amount || 0,
    status: booking?.status || 'UPCOMING'
  })

  const handleSave = () => {
    onSave({ ...booking, ...formData })
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-cp-gray border border-cp-cyan/30 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <h3 className="text-cp-yellow font-bold text-xl mb-4">Edit Booking</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              className="bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 text-white"
              title="Start time"
            />
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              className="bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 text-white"
              title="End time"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Duration (hours)"
              value={formData.duration_hours}
              onChange={(e) => setFormData({...formData, duration_hours: Number(e.target.value)})}
              className="bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 text-white"
            />
            <input
              type="number"
              placeholder="Total Amount"
              value={formData.total_amount}
              onChange={(e) => setFormData({...formData, total_amount: Number(e.target.value)})}
              className="bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 text-white"
            />
          </div>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 text-white"
            title="Booking status"
          >
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="ENDED">Ended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-cp-cyan text-cp-black px-4 py-2 rounded hover:bg-cp-yellow"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Delete Confirmation Modal Component
const DeleteModal = ({ booking, onConfirm, onClose }: any) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-cp-gray border border-cp-cyan/30 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <h3 className="text-cp-yellow font-bold text-xl mb-4">Cancel Booking</h3>
        <p className="text-white mb-2">Are you sure you want to cancel this booking?</p>
        <div className="bg-cp-black/30 rounded p-3 mb-4">
          <p className="text-cp-cyan font-bold">{booking?.stations?.name || 'Unknown Station'}</p>
          <p className="text-gray-300 text-sm">{booking?.stations?.type}</p>
          <p className="text-white text-sm mt-1">
            {new Date(booking?.start_at).toLocaleDateString()} | {booking?.start_time?.slice(0, 5)} - {booking?.end_time?.slice(0, 5)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Cancel Booking
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Keep Booking
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBookings() {
  const [activeBookings, setActiveBookings] = useState<any[]>([])
  const [cancelledBookings, setCancelledBookings] = useState<any[]>([])
  const [filteredActive, setFilteredActive] = useState<any[]>([])
  const [filteredCancelled, setFilteredCancelled] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingBooking, setEditingBooking] = useState<any>(null)
  const [deletingBooking, setDeletingBooking] = useState<any>(null)
  const [filter, setFilter] = useState<string>('ALL')
  const [showCancelled, setShowCancelled] = useState(false)

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    // Filter active bookings
    if (filter === 'ALL') {
      setFilteredActive(activeBookings)
    } else {
      setFilteredActive(activeBookings.filter(booking => booking.stations?.type === filter))
    }
    
    // Filter cancelled bookings
    if (filter === 'ALL') {
      setFilteredCancelled(cancelledBookings)
    } else {
      setFilteredCancelled(cancelledBookings.filter(booking => booking.stations?.type === filter))
    }
  }, [activeBookings, cancelledBookings, filter])

  const loadBookings = async () => {
    setLoading(true)
    try {
      const [activeResult, cancelledResult] = await Promise.all([
        bookings.getAllBookings(),
        bookings.getAllCancelledBookings()
      ])
      
      // Get user details for each booking
      const activeWithUsers = await addUserDetails(activeResult.data || [])
      const cancelledWithUsers = await addUserDetails(cancelledResult.data || [])
      
      setActiveBookings(activeWithUsers)
      setCancelledBookings(cancelledWithUsers)
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const addUserDetails = async (bookingList: any[]) => {
    if (!bookingList.length) return bookingList
    
    // Get unique user IDs
    const userIds = Array.from(new Set(bookingList.map(b => b.user_id)))
    
    // Fetch user profiles
    const userProfiles: any = {}
    for (const userId of userIds) {
      try {
        const { data } = await profiles.get(userId)
        if (data) {
          userProfiles[userId] = { username: data.username, full_name: data.full_name }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
    
    // Add user details to bookings
    return bookingList.map(booking => ({
      ...booking,
      user_profiles: userProfiles[booking.user_id] || null
    }))
  }

  const handleCancel = async (bookingId: string) => {
    try {
      console.log('Attempting to cancel booking:', bookingId)
      const result = await bookings.cancel(bookingId)
      console.log('Cancel result:', result)
      
      if (result.error) {
        console.error('API error:', result.error)
        alert('Failed to cancel booking: ' + result.error.message)
        return
      }
      
      setDeletingBooking(null)
      loadBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const handleSave = async (booking: any) => {
    try {
      await bookings.update(booking.id, booking)
      setEditingBooking(null)
      loadBookings()
    } catch (error) {
      console.error('Error saving booking:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-600'
      case 'ONGOING': return 'bg-green-600'
      case 'ENDED': return 'bg-gray-600'
      case 'CANCELLED': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-cp-black">
        <NavBar />
        
        {/* Admin navbar positioned below main navbar */}
        <div className="bg-gray-800 border-b border-cyan-500/30 min-h-[60px] flex items-center w-full mt-20">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="flex space-x-8">
              <div className="text-white py-4 px-2 text-sm font-bold">ADMIN NAVIGATION:</div>
              <a href="/admin/dashboard" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Dashboard</a>
              <a href="/admin/stations" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Stations</a>
              <a href="/admin/bookings" className="py-4 px-2 text-sm font-medium text-yellow-400 hover:text-cyan-400">Bookings</a>
              <a href="/admin/users" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Users</a>
              <a href="/admin/analytics" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Analytics</a>
              <a href="/admin/settings" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Settings</a>
            </div>
          </div>
        </div>
        
        <main className="pt-6 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-cp-yellow">
                Booking <span className="text-cp-cyan">Management</span>
              </h1>
              <p className="text-gray-300 mt-2">View and manage all bookings</p>
            </div>

            {/* Filter Buttons */}
            <div className="mb-6 flex gap-4 items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    filter === 'ALL' 
                      ? 'bg-cp-cyan text-cp-black' 
                      : 'bg-gray-600 text-white hover:bg-gray-500'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setFilter('PC')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    filter === 'PC' 
                      ? 'bg-cp-cyan text-cp-black' 
                      : 'bg-gray-600 text-white hover:bg-gray-500'
                  }`}
                >
                  PC
                </button>
                <button
                  onClick={() => setFilter('PS5')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    filter === 'PS5' 
                      ? 'bg-cp-cyan text-cp-black' 
                      : 'bg-gray-600 text-white hover:bg-gray-500'
                  }`}
                >
                  PS5
                </button>
              </div>
              <div className="text-gray-400 text-sm">
                Showing {filteredActive.length} active bookings
              </div>
              <button
                onClick={() => setShowCancelled(!showCancelled)}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
              >
                {showCancelled ? 'Hide' : 'Show'} Cancelled ({filteredCancelled.length})
              </button>
            </div>

            {/* Active Bookings */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-cp-cyan">Active Bookings</h2>
              {loading ? (
                <div className="text-center text-cp-cyan">Loading bookings...</div>
              ) : (
                filteredActive.map((booking: any) => (
                  <div key={booking.id} className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                        <div>
                          <h3 className="text-cp-yellow font-bold">{booking.stations?.name || 'Unknown Station'}</h3>
                          <p className="text-gray-300 text-sm">{booking.stations?.type}</p>
                        </div>
                        <div>
                          <p className="text-white"><strong>User:</strong> {booking.user_profiles?.username || 'Unknown'}</p>
                          <p className="text-gray-300 text-sm">{booking.user_profiles?.full_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-white"><strong>Date:</strong> {formatDate(booking.start_at)}</p>
                          <p className="text-white"><strong>Time:</strong> {formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
                        </div>
                        <div>
                          <p className="text-white"><strong>Duration:</strong> {booking.duration_hours}h</p>
                          <p className="text-white"><strong>Amount:</strong> ₹{booking.total_amount}</p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingBooking(booking)}
                          className="bg-cp-cyan text-cp-black px-3 py-1 rounded text-sm hover:bg-cp-yellow"
                        >
                          Edit
                        </button>
                        {booking.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setDeletingBooking(booking)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cancelled Bookings */}
            {showCancelled && (
              <div className="space-y-4 mt-8">
                <h2 className="text-xl font-bold text-red-400">Cancelled Bookings</h2>
                {filteredCancelled.map((booking: any) => (
                                      <div key={booking.id} className="bg-red-900/20 border border-red-500/20 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                          <div>
                            <h3 className="text-red-300 font-bold">{booking.stations?.name || 'Unknown Station'}</h3>
                            <p className="text-gray-300 text-sm">{booking.stations?.type}</p>
                          </div>
                          <div>
                            <p className="text-white"><strong>User:</strong> {booking.user_profiles?.username || 'Unknown'}</p>
                            <p className="text-gray-300 text-sm">{booking.user_profiles?.full_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-white"><strong>Date:</strong> {formatDate(booking.start_at)}</p>
                            <p className="text-white"><strong>Time:</strong> {formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
                          </div>
                          <div>
                            <p className="text-white"><strong>Duration:</strong> {booking.duration_hours}h</p>
                            <p className="text-white"><strong>Amount:</strong> ₹{booking.total_amount}</p>
                          </div>
                          <div>
                            <span className="px-2 py-1 rounded text-xs text-white bg-red-600">
                              CANCELLED
                            </span>
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Edit Modal */}
        {editingBooking && (
          <BookingModal
            booking={editingBooking}
            onSave={handleSave}
            onClose={() => setEditingBooking(null)}
          />
        )}

        {/* Delete Modal */}
        {deletingBooking && (
          <DeleteModal
            booking={deletingBooking}
            onConfirm={() => handleCancel(deletingBooking.id)}
            onClose={() => setDeletingBooking(null)}
          />
        )}
      </div>
    </AdminGuard>
  )
} 