'use client'

import { useState, useEffect } from 'react'
import { AdminNavBar } from '@/components/ui/admin-navbar'
import { AdminGuard } from '@/components/ui/admin-guard'
import { bookings, admin } from '@/lib/supabase'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

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

// View Booking Details Modal Component
const ViewModal = ({ booking, onClose }: any) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-cp-gray border border-cp-cyan/30 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-cp-yellow font-bold text-xl mb-4">Booking Details</h3>
        <div className="grid grid-cols-2 gap-4 text-white text-sm">
          <div><strong>ID:</strong> {booking?.id}</div>
          <div><strong>User:</strong> {booking?.user_profiles?.username || 'Unknown'}</div>
          <div><strong>Station:</strong> {booking?.stations?.name}</div>
          <div><strong>Type:</strong> {booking?.stations?.type}</div>
          <div><strong>Created:</strong> {new Date(booking?.created_at).toLocaleString()}</div>
          <div><strong>Play Date:</strong> {new Date(booking?.start_at).toLocaleDateString()}</div>
          <div><strong>Start Time:</strong> {booking?.start_time?.slice(0, 5)}</div>
          <div><strong>End Time:</strong> {booking?.end_time?.slice(0, 5)}</div>
          <div><strong>Duration:</strong> {booking?.duration_hours}h</div>
          <div><strong>Amount:</strong> ₹{booking?.total_amount}</div>
          <div><strong>Status:</strong> {booking?.status}</div>
          <div><strong>Paid:</strong> {booking?.paid ? 'Yes' : 'No'}</div>
        </div>
        <button onClick={onClose} className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Close</button>
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
  const [viewingBooking, setViewingBooking] = useState<any>(null)
  const [filter, setFilter] = useState<string>('ALL')
  const [showCancelled, setShowCancelled] = useState(false)
  const [userProfiles, setUserProfiles] = useState<any>({})
  const [editingPayment, setEditingPayment] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')

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
    
    // Fetch user profiles using admin function
    const userProfiles: any = {}
    try {
      const { data } = await admin.getUserProfiles(userIds)
      if (data) {
        data.forEach((profile: any) => {
          userProfiles[profile.user_id] = { username: profile.username, full_name: profile.full_name }
        })
      }
    } catch (error) {
      console.error('Error fetching user profiles:', error)
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

  const handleUpdatePayment = async (bookingId: string, amount: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/${bookingId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_paid: amount })
      })
      if (response.ok) {
        loadBookings()
        setEditingPayment(null)
      }
    } catch (error) {
      console.error('Payment update failed:', error)
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
      <div className="min-h-screen">
        <AdminNavBar />
        
        <main className="pt-24 pb-12 px-6">
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
                          <p className="text-white"><strong>Created:</strong> {formatDate(booking.created_at)}</p>
                          <p className="text-white"><strong>Play Date:</strong> {formatDate(booking.start_at)}</p>
                          <p className="text-white"><strong>Time:</strong> {formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
                        </div>
                        <div>
                          <p className="text-white"><strong>Duration:</strong> {booking.duration_hours}h</p>
                          <div>
                            <div className="text-cp-yellow">Total: ₹{booking.total_amount || 0}</div>
                            <div className="text-xs">
                              Paid: ₹{booking.amount_paid || 0}
                              <div className="text-gray-300">
                                Remaining: ₹{(booking.total_amount || 0) - (booking.amount_paid || 0)}
                              </div>
                              <div className="mt-1">
                                Status: <span className={`px-1 py-0.5 rounded text-xs ${
                                  (booking.amount_paid || 0) === 0 ? 'bg-red-500/20 text-red-400' :
                                  (booking.amount_paid || 0) >= (booking.total_amount || 0) ? 'bg-green-500/20 text-green-400' : 
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {(booking.amount_paid || 0) === 0 ? 'Pending' :
                                   (booking.amount_paid || 0) >= (booking.total_amount || 0) ? 'Full' : 'Partial'}
                                </span>
                              </div>
                              {editingPayment === booking.id ? (
                                <div className="flex gap-1 mt-1">
                                  <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-20 px-1 py-0.5 text-xs bg-gray-800 rounded text-white"
                                    placeholder="Amount"
                                  />
                                  <button
                                    onClick={() => handleUpdatePayment(booking.id, Number(paymentAmount))}
                                    className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingPayment(booking.id)
                                    setPaymentAmount(booking.amount_paid?.toString() || '0')
                                  }}
                                  className="ml-1 text-xs text-cp-cyan hover:underline"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setViewingBooking(booking)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          View
                        </button>
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
                            <p className="text-white"><strong>Created:</strong> {formatDate(booking.created_at)}</p>
                            <p className="text-white"><strong>Play Date:</strong> {formatDate(booking.start_at)}</p>
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
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setViewingBooking(booking)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            View
                          </button>
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

        {/* View Modal */}
        {viewingBooking && (
          <ViewModal
            booking={viewingBooking}
            onClose={() => setViewingBooking(null)}
          />
        )}
      </div>
    </AdminGuard>
  )
} 