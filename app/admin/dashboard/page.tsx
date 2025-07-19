'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '@/components/ui/navbar'
import { AdminGuard } from '@/components/ui/admin-guard'
import { AdminNavBar } from '@/components/ui/admin-navbar'
import { InfoCard } from '@/components/ui/info-card'
import { bookings } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    activeStations: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get total bookings
      const { data: allBookings } = await bookings.getAllBookings()
      const totalBookings = allBookings?.length || 0
      
      // Get today's bookings
      const today = new Date().toISOString().split('T')[0]
      const todayBookings = allBookings?.filter(booking => 
        booking.start_at.startsWith(today)
      ).length || 0
      
      // Calculate total revenue
      const totalRevenue = allBookings?.reduce((sum, booking) => 
        sum + (booking.total_amount || 0), 0
      ) || 0
      
      setStats({
        totalBookings,
        todayBookings,
        totalRevenue,
        activeStations: 10 // From your stations data
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const dashboardStats = [
    {
      title: "Total Bookings",
      description: "All time bookings",
      value: stats.totalBookings.toString()
    },
    {
      title: "Today's Bookings", 
      description: "Bookings for today",
      value: stats.todayBookings.toString()
    },
    {
      title: "Total Revenue",
      description: "All time revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`
    },
    {
      title: "Active Stations",
      description: "Available gaming stations", 
      value: stats.activeStations.toString()
    }
  ]

  return (
    <AdminGuard>
      <div className="min-h-screen bg-cp-black">
        <NavBar />
        
        <div className="mt-20">
          <AdminNavBar />
        </div>
        
        <main className="pt-6 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-cp-yellow">
                Admin <span className="text-cp-cyan">Dashboard</span>
              </h1>
              <p className="text-gray-300 mt-2">Gaming center overview and statistics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats.map((stat, index) => (
                <div key={index} className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-6">
                  <h3 className="text-cp-yellow font-bold text-lg mb-2">{stat.title}</h3>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <p className="text-gray-400 text-sm">{stat.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 max-w-2xl mx-auto">
              <div className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-6">
                <h3 className="text-cp-yellow font-bold text-xl mb-4">Recent Activity</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="text-sm">📅 {stats.todayBookings} bookings today</div>
                  <div className="text-sm">💰 ₹{stats.totalRevenue.toLocaleString()} total earned</div>
                  <div className="text-sm">🎮 {stats.activeStations} stations active</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  )
} 