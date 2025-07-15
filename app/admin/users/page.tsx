'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '@/components/ui/navbar'
import { AdminGuard } from '@/components/ui/admin-guard'
import { AdminNavBar } from '@/components/ui/admin-navbar'
import { profiles, bookings } from '@/lib/supabase'

export default function AdminUsers() {
  const [userList, setUserList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userBookings, setUserBookings] = useState<any>({})
  const [userSpending, setUserSpending] = useState<any>({})
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showModal, setShowModal] = useState<'details' | 'bookings' | null>(null)
  const [modalBookings, setModalBookings] = useState<any[]>([])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data: users } = await profiles.getAll()
      const { data: allBookings } = await bookings.getAllBookings()
      
      // Count bookings and calculate spending per user
      const bookingCounts: any = {}
      const spendingTotals: any = {}
      
      allBookings?.forEach((booking: any) => {
        const userId = booking.user_id
        bookingCounts[userId] = (bookingCounts[userId] || 0) + 1
        spendingTotals[userId] = (spendingTotals[userId] || 0) + (booking.total_amount || 0)
      })
      
      setUserList(users || [])
      setUserBookings(bookingCounts)
      setUserSpending(spendingTotals)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getTotalSpent = (userId: string) => {
    return userSpending[userId] || 0
  }

  const showUserDetails = (user: any) => {
    setSelectedUser(user)
    setShowModal('details')
  }

  const showUserBookings = async (user: any) => {
    setSelectedUser(user)
    setShowModal('bookings')
    try {
      const { data } = await bookings.getUserBookings(user.user_id)
      setModalBookings(data || [])
    } catch (error) {
      console.error('Error loading user bookings:', error)
      setModalBookings([])
    }
  }

  const closeModal = () => {
    setShowModal(null)
    setSelectedUser(null)
    setModalBookings([])
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
              <a href="/admin/bookings" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Bookings</a>
              <a href="/admin/users" className="py-4 px-2 text-sm font-medium text-yellow-400 hover:text-cyan-400">Users</a>
              <a href="/admin/analytics" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Analytics</a>
              <a href="/admin/settings" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Settings</a>
            </div>
          </div>
        </div>
        
        <main className="pt-6 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-cp-yellow">
                User <span className="text-cp-cyan">Management</span>
              </h1>
              <p className="text-gray-300 mt-2">View and manage users</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center text-cp-cyan">Loading users...</div>
              ) : (
                userList.map((user) => (
                  <div key={user.id} className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-cp-yellow font-bold text-xl mb-2">{user.username}</h3>
                        <p className="text-gray-300 text-sm mb-1">{user.full_name}</p>
                        <p className="text-gray-400 text-xs">Joined: {formatDate(user.created_at)}</p>
                      </div>
                      {user.profile_pic_url && (
                        <img 
                          src={user.profile_pic_url} 
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border border-cp-cyan/30"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Bookings:</span>
                        <span className="text-white font-semibold">{userBookings[user.user_id] || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Spent:</span>
                        <span className="text-cp-yellow font-semibold">₹{getTotalSpent(user.user_id)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-cp-cyan/20">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => showUserDetails(user)}
                          className="flex-1 bg-cp-cyan text-cp-black py-2 px-3 rounded text-sm hover:bg-cp-yellow"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => showUserBookings(user)}
                          className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700"
                        >
                          View Bookings
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {userList.length === 0 && !loading && (
              <div className="text-center text-gray-400 py-12">
                <p>No users found</p>
              </div>
            )}
          </div>
        </main>

        {/* Simple Modals */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
            <div className="bg-cp-gray border border-cp-cyan/30 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-cp-yellow font-bold text-xl">
                  {showModal === 'details' ? 'User Details' : 'User Bookings'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              {showModal === 'details' ? (
                <div className="space-y-2">
                  <p><span className="text-gray-400">Username:</span> <span className="text-white">{selectedUser.username}</span></p>
                  <p><span className="text-gray-400">Full Name:</span> <span className="text-white">{selectedUser.full_name}</span></p>
                  <p><span className="text-gray-400">Joined:</span> <span className="text-white">{formatDate(selectedUser.created_at)}</span></p>
                  <p><span className="text-gray-400">Total Bookings:</span> <span className="text-white">{userBookings[selectedUser.user_id] || 0}</span></p>
                  <p><span className="text-gray-400">Total Spent:</span> <span className="text-cp-yellow">₹{getTotalSpent(selectedUser.user_id)}</span></p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {modalBookings.length > 0 ? (
                    modalBookings.map((booking: any) => (
                      <div key={booking.id} className="bg-cp-black/30 rounded p-3">
                        <p className="text-cp-cyan font-bold">{booking.stations?.name}</p>
                        <p className="text-white text-sm">{new Date(booking.start_at).toLocaleDateString()}</p>
                        <p className="text-cp-yellow">₹{booking.total_amount}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No bookings found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  )
} 