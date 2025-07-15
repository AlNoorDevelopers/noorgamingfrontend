'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { NavBar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { auth } from '@/lib/supabase'

function AuthPageContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const stationName = searchParams.get('name') || 'Gaming Station'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Simple validation
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const { data, error } = isLogin 
        ? await auth.signIn(email, password)
        : await auth.signUp(email, password)

      if (error) {
        setError(error.message)
      } else {
        // Redirect back to booking page
        const params = new URLSearchParams(searchParams.toString())
        router.push(`/book?${params.toString()}`)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {isLogin ? 'LOGIN' : 'SIGN UP'}
            </h1>
            <p className="text-gray-300">
              {isLogin ? 'Welcome back!' : 'Create your account'} Book {stationName}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-cp-gray/20 border border-cp-cyan/20 rounded-lg p-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none"
                  placeholder="Enter your name"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cp-black/50 border border-cp-cyan/30 rounded px-3 py-2 focus:border-cp-cyan focus:outline-none"
                placeholder="Enter your password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cp-cyan text-cp-black py-3 rounded-lg font-bold hover:bg-cp-yellow transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cp-cyan hover:text-cp-yellow transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-cp-cyan text-lg">Loading...</div></div>}>
      <AuthPageContent />
    </Suspense>
  )
} 