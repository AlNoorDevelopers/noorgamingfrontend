'use client'

import { useState, useEffect } from 'react'
import { AdminNavBar } from '@/components/ui/admin-navbar'
import { AdminGuard } from '@/components/ui/admin-guard'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const { data: { session } } = await (await import('@/lib/supabase')).auth.getSession()
      const token = session?.access_token
      
      if (!token) {
        setCoupons([])
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/all-coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        setCoupons([])
        return
      }
      
      const data = await response.json()
      setCoupons(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-black text-white">
        <AdminNavBar />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Coupon Management</h1>
            
            {loading ? (
              <div className="text-center py-8">Loading coupons...</div>
            ) : (
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Discount</th>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon: any) => (
                      <tr key={coupon.id} className="border-b border-gray-700">
                        <td className="px-4 py-3 font-mono text-cyan-400">{coupon.code}</td>
                        <td className="px-4 py-3">{coupon.type}</td>
                        <td className="px-4 py-3">{coupon.discount_percentage}%</td>
                        <td className="px-4 py-3">{coupon.user_profiles?.username || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            coupon.used_by ? 'bg-red-600' : 'bg-green-600'
                          }`}>
                            {coupon.used_by ? 'Used' : 'Available'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(coupon.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminGuard>
  )
} 