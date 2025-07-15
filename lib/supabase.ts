import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Please check your .env.local file.')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Simple auth helpers with session persistence
export const auth = {
  signUp: (email: string, password: string) => 
    supabase ? supabase.auth.signUp({ email, password }) : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  signIn: (email: string, password: string) => 
    supabase ? supabase.auth.signInWithPassword({ email, password }) : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  signOut: () => supabase ? supabase.auth.signOut() : Promise.resolve({ error: null }),
  
  getUser: () => supabase ? supabase.auth.getUser() : Promise.resolve({ data: { user: null }, error: null }),
  
  // Check for existing session
  getSession: () => supabase ? supabase.auth.getSession() : Promise.resolve({ data: { session: null }, error: null }),
  
  // Listen for auth changes
  onAuthChange: (callback: (event: string, session: any) => void) => 
    supabase ? supabase.auth.onAuthStateChange(callback) : { data: { subscription: null } }
}

// Simple booking helpers
export const bookings = {
  create: (booking: any) => 
    supabase ? supabase.from('bookings').insert(booking) : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  getUserBookings: (userId: string) => 
    supabase ? supabase.from('bookings').select('*, stations(*)').eq('user_id', userId).neq('status', 'CANCELLED') : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  getUserCancelledBookings: (userId: string) => 
    supabase ? supabase.from('bookings').select('*, stations(*)').eq('user_id', userId).eq('status', 'CANCELLED') : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  getAllBookings: () => 
    supabase ? supabase.from('bookings').select('*, stations(*)').neq('status', 'CANCELLED') : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  getAllCancelledBookings: () => 
    supabase ? supabase.from('bookings').select('*, stations(*)').eq('status', 'CANCELLED') : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  update: async (id: string, booking: any) => {
    console.log('Updating booking via API:', id, booking)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking)
      })
      
      const result = await response.json()
      console.log('API update result:', result)
      
      if (!response.ok) {
        return { data: null, error: { message: result.detail || 'Update failed' } }
      }
      
      return { data: result, error: null }
    } catch (error) {
      console.error('API error:', error)
      return { data: null, error: { message: 'Network error' } }
    }
  },

  cancel: async (id: string) => {
    console.log('Cancelling booking via API:', id)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const result = await response.json()
      console.log('API cancel result:', result)
      
      if (!response.ok) {
        return { data: null, error: { message: result.detail || 'Cancel failed' } }
      }
      
      return { data: result, error: null }
    } catch (error) {
      console.error('API error:', error)
      return { data: null, error: { message: 'Network error' } }
    }
  },
  
  getAvailableSlots: (stationId: string, date: string) => 
    supabase ? supabase.rpc('get_available_slots', { station_id_param: stationId, date_param: date }) : Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
}

// Simple station helpers
export const stations = {
  getAll: () => 
    supabase ? supabase.from('stations').select('*') : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  create: (station: any) => 
    supabase ? supabase.from('stations').insert(station) : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  update: (id: string, station: any) => 
    supabase ? supabase.from('stations').update(station).eq('id', id) : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  delete: (id: string) => 
    supabase ? supabase.from('stations').delete().eq('id', id) : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
}

// Simple profile helpers
export const profiles = {
  get: (userId: string) => 
    supabase ? supabase.from('user_profiles').select('*').eq('user_id', userId).single() : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  getAll: () => 
    supabase ? supabase.from('user_profiles').select('*') : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  create: (profile: any) => 
    supabase ? supabase.from('user_profiles').insert(profile) : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  update: (userId: string, updates: any) => 
    supabase ? supabase.from('user_profiles').update(updates).eq('user_id', userId) : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
  
  checkUsername: async (username: string) => {
    if (!supabase) return { data: true, error: null }
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .ilike('username', username)
      .limit(1)
    return { data: !data || data.length === 0, error }
  },
  
  changePassword: (newPassword: string) => 
    supabase ? supabase.auth.updateUser({ password: newPassword }) : Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
}

// Storage helpers
export const storage = {
  uploadProfilePicture: async (userId: string, file: File) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `profile-pictures/${fileName}`
    
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) return { data: null, error }
    
    const { data: urlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)
    
    return { data: { path: filePath, url: urlData.publicUrl }, error: null }
  },
  
  deleteProfilePicture: async (filePath: string) => {
    if (!supabase) return { error: { message: 'Supabase not configured' } }
    
    return await supabase.storage
      .from('profile-pictures')
      .remove([filePath])
  }
}

// Admin helpers
export const admin = {
  // Check if current user is admin
  checkAccess: async () => {
    if (!supabase) return { data: false, error: { message: 'Supabase not configured' } }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: false, error: { message: 'Not authenticated' } }
    
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('admin_emails')
      .single()
    
    if (!settings?.admin_emails) return { data: false, error: { message: 'No admin emails configured' } }
    
    const adminEmails = JSON.parse(settings.admin_emails)
    return { data: adminEmails.includes(user.email), error: null }
  },
  
  // Get admin emails
  getAdminEmails: async () => {
    if (!supabase) return { data: [], error: { message: 'Supabase not configured' } }
    
    const { data: settings } = await supabase
      .from('admin_settings')
      .select('admin_emails')
      .single()
    
    if (!settings?.admin_emails) return { data: [], error: null }
    
    const adminEmails = JSON.parse(settings.admin_emails)
    return { data: adminEmails, error: null }
  },
  
  // Update admin emails
  updateAdminEmails: async (emails: string[]) => {
    if (!supabase) return { data: null, error: { message: 'Supabase not configured' } }
    
    const { data, error } = await supabase
      .from('admin_settings')
      .upsert({ 
        id: 1, 
        admin_emails: JSON.stringify(emails) 
      })
    
    return { data, error }
  }
}