'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '@/components/ui/navbar'
import { AdminGuard } from '@/components/ui/admin-guard'
import { AdminNavBar } from '@/components/ui/admin-navbar'
import { stations } from '@/lib/supabase'

export default function AdminStations() {
  const [stationList, setStationList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingStation, setEditingStation] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    loadStations()
  }, [])

  const loadStations = async () => {
    setLoading(true)
    try {
      const { data } = await stations.getAll()
      setStationList(data || [])
    } catch (error) {
      console.error('Error loading stations:', error)
    } finally {
      setLoading(false)
    }
  }

  const [stationToDelete, setStationToDelete] = useState<any>(null)

  const handleDelete = async (stationId: string) => {
    try {
      await stations.delete(stationId)
      setStationToDelete(null)
      loadStations()
    } catch (error) {
      console.error('Error deleting station:', error)
    }
  }

  const handleSave = async (station: any) => {
    try {
      if (station.id) {
        // Edit existing
        await stations.update(station.id, station)
      } else {
        // Add new
        await stations.create(station)
      }
      setEditingStation(null)
      setShowAddForm(false)
      loadStations()
    } catch (error) {
      console.error('Error saving station:', error)
    }
  }

  // Modal for editing/adding stations
  const StationModal = ({ station, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState({
      name: station?.name || '',
      type: station?.type || 'PS5',
      hourly_rate: station?.hourly_rate || 120,
      description: station?.description || '',
      active: station?.active !== false
    })

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-yellow-400 font-bold text-xl mb-4">
            {station?.id ? 'Edit Station' : 'Add New Station'}
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Station Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-800 border border-cyan-500/30 rounded px-3 py-2 text-white"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="bg-gray-800 border border-cyan-500/30 rounded px-3 py-2 text-white"
                title="Select station type"
              >
                <option value="PS5">PS5</option>
                <option value="PC">PC</option>
              </select>
              <input
                type="number"
                placeholder="Hourly Rate"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: Number(e.target.value)})}
                className="bg-gray-800 border border-cyan-500/30 rounded px-3 py-2 text-white"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-800 border border-cyan-500/30 rounded px-3 py-2 text-white h-20"
            />
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="mr-2"
              />
              Active
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onSave({...station, ...formData})}
                className="bg-cyan-500 text-black px-4 py-2 rounded hover:bg-yellow-400"
              >
                Save
              </button>
              <button
                onClick={onCancel}
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

  // Modal for delete confirmation
  const DeleteModal = ({ station, onConfirm, onCancel }: any) => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-red-500/30 rounded-lg p-6 w-full max-w-sm mx-4">
          <h3 className="text-red-400 font-bold text-xl mb-4">Delete Station</h3>
          <p className="text-gray-300 mb-6">
            Are you sure you want to delete <strong className="text-yellow-400">{station.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onConfirm(station.id)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
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
              <a href="/admin/stations" className="py-4 px-2 text-sm font-medium text-yellow-400 hover:text-cyan-400">Stations</a>
              <a href="/admin/bookings" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Bookings</a>
              <a href="/admin/users" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Users</a>
              <a href="/admin/analytics" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Analytics</a>
              <a href="/admin/settings" className="py-4 px-2 text-sm font-medium text-gray-300 hover:text-cyan-400">Settings</a>
            </div>
          </div>
        </div>
        
        <main className="pt-6 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-cp-yellow">
                  Station <span className="text-cp-cyan">Management</span>
                </h1>
                <p className="text-gray-300 mt-2">Manage gaming stations</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-cp-cyan text-cp-black px-6 py-3 rounded-lg font-bold hover:bg-cp-yellow"
              >
                Add Station
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('ALL')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    filter === 'ALL' 
                      ? 'bg-cyan-500 text-black' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All Stations
                </button>
                <button
                  onClick={() => setFilter('PC')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    filter === 'PC' 
                      ? 'bg-cyan-500 text-black' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  PC Only
                </button>
                <button
                  onClick={() => setFilter('PS5')}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    filter === 'PS5' 
                      ? 'bg-cyan-500 text-black' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  PS5 Only
                </button>
              </div>
              <div className="text-gray-400 text-sm">
                {stationList.filter(station => filter === 'ALL' || station.type === filter).length} stations
              </div>
            </div>

            {/* Edit/Add Station Modal */}
            {(showAddForm || editingStation) && (
              <StationModal
                station={editingStation}
                onSave={handleSave}
                onCancel={() => {
                  setEditingStation(null)
                  setShowAddForm(false)
                }}
              />
            )}

            {/* Delete Station Modal */}
            {stationToDelete && (
              <DeleteModal
                station={stationToDelete}
                onConfirm={handleDelete}
                onCancel={() => setStationToDelete(null)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center text-cp-cyan">Loading stations...</div>
              ) : (
                stationList
                  .filter(station => filter === 'ALL' || station.type === filter)
                  .map((station) => (
                  <div key={station.id} className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-cp-yellow font-bold text-xl">{station.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        station.active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {station.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-2 text-gray-300 mb-4">
                      <div><strong>Type:</strong> {station.type}</div>
                      <div><strong>Rate:</strong> ₹{station.hourly_rate}/hr</div>
                      <div><strong>Description:</strong> {station.description}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingStation(station)}
                        className="bg-cp-cyan text-cp-black px-3 py-1 rounded text-sm hover:bg-cp-yellow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setStationToDelete(station)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  )
} 