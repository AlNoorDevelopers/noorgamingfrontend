'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload'
import { auth, profiles, storage } from '@/lib/supabase'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Show/hide forms
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  
  // Profile form
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [profilePic, setProfilePic] = useState('')
  
  // Password change form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await auth.getUser()
      if (!data.user) {
        router.push('/auth')
        return
      }
      setUser(data.user)
      
      // Get existing profile
      const { data: profileData } = await profiles.get(data.user.id)
      if (profileData) {
        setProfile(profileData)
        setUsername(profileData.username)
        setFullName(profileData.full_name)
        setPhone(profileData.phone || '')
        setProfilePic(profileData.profile_pic_url || '')
      }
      setLoading(false)
    }
    getUser()
  }, [router])

  const handleImageUpload = async (file: File) => {
    if (!user) return
    
    setUploading(true)
    setError('')
    
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        
        // Update profile with base64 image
        const { error } = await profiles.update(user.id, { profile_pic_url: base64 })
        
        if (error) {
          setError('Failed to update profile picture')
        } else {
          setProfilePic(base64)
          setSuccess('Profile picture updated!')
          if (profile) {
            setProfile({ ...profile, profile_pic_url: base64 })
          }
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to process image')
      setUploading(false)
    }
  }

  const handleImageRemove = async () => {
    if (!user) return
    
    const { error } = await profiles.update(user.id, { profile_pic_url: null })
    
    if (error) {
      setError('Failed to remove image')
    } else {
      setProfilePic('')
      setSuccess('Profile picture removed!')
      if (profile) {
        setProfile({ ...profile, profile_pic_url: null })
      }
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !fullName) {
      setError('Username and full name are required')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Check if username is available (if changed)
      if (!profile || profile.username !== username) {
        const { data: available } = await profiles.checkUsername(username)
        if (!available) {
          setError('Username is already taken')
          setSaving(false)
          return
        }
      }

      const profileData = {
        user_id: user.id,
        username,
        full_name: fullName,
        phone
      }

      const { error } = profile 
        ? await profiles.update(user.id, profileData)
        : await profiles.create(profileData)

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Profile updated successfully!')
        setShowProfileForm(false)
        if (!profile) {
          // Refresh to get the created profile
          const { data: newProfile } = await profiles.get(user.id)
          setProfile(newProfile)
        }
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Verify current password by trying to sign in
      const { error: signInError } = await auth.signIn(user.email, currentPassword)
      if (signInError) {
        setError('Current password is incorrect')
        setSaving(false)
        return
      }

      // Change password
      const { error } = await profiles.changePassword(newPassword)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password changed successfully!')
        setShowPasswordForm(false)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              MY <span className="text-cp-cyan">PROFILE</span>
            </h1>
            <p className="text-gray-300">Manage your account settings</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Profile Display */}
          <div className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-cp-black/50 flex items-center justify-center border-2 border-cp-cyan/30">
                {profile?.profile_pic_url ? (
                  <img src={profile.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-3xl text-cp-cyan">👤</div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-cp-cyan mb-2">{profile?.username || 'No username set'}</h2>
                <p className="text-xl text-gray-300 mb-1">{profile?.full_name || 'No name set'}</p>
                <p className="text-sm text-gray-400 bg-cp-black/30 px-3 py-1 rounded-full inline-block">{user?.email}</p>
                {profile?.phone && (
                  <p className="text-sm text-gray-400 bg-cp-black/30 px-3 py-1 rounded-full inline-block mt-1">{profile.phone}</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowProfileForm(true)}
                className="bg-cp-cyan text-cp-black px-8 py-3 rounded-lg font-bold hover:bg-cp-yellow transition-colors duration-300 shadow-lg shadow-cp-cyan/25"
              >
                Update Profile
              </button>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-cp-magenta text-white px-8 py-3 rounded-lg font-bold hover:bg-cp-magenta/80 transition-colors duration-300 shadow-lg shadow-cp-magenta/25"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Profile Form */}
          {showProfileForm && (
            <form onSubmit={handleProfileSubmit} className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 text-cp-cyan">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username {profile && '(cannot be changed)'}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!!profile}
                  className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none disabled:opacity-50"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone <span className="text-xs text-gray-400">(for booking notifications)</span></label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">Profile Picture</label>
                <ProfilePictureUpload
                  currentImageUrl={profilePic}
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  uploading={uploading}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-cp-cyan text-cp-black py-3 rounded-lg font-bold hover:bg-cp-yellow transition-colors duration-300 disabled:opacity-50"
              >
                {saving ? 'SAVING...' : 'UPDATE PROFILE'}
              </button>
            </div>
          </form>
          )}

          {/* Password Change Form */}
          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-cp-cyan">Change Password</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-cp-magenta text-white py-3 rounded-lg font-bold hover:bg-cp-magenta/80 transition-colors duration-300 disabled:opacity-50"
              >
                {saving ? 'CHANGING...' : 'CHANGE PASSWORD'}
              </button>
            </div>
          </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
} 