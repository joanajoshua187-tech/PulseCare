import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { HeartPulse, Mail, Lock } from 'lucide-react'
import HealthTip from '../components/HealthTip'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('patients')
      .select('role')
      .eq('id', data.user.id)
      .single()

    setLoading(false)

    if (profile?.role === 'provider') {
      navigate('/provider-dashboard')
    } else if (profile?.role === 'admin') {
      navigate('/admin-dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <HeartPulse className="text-coral" size={30} />
          <h1 className="font-serif text-2xl font-semibold text-ink">PulseCare</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-ink/5">
          <h2 className="font-serif text-xl font-semibold text-ink mb-1">Welcome back</h2>
          <p className="text-ink/60 text-sm mb-6">Good to see you again.</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-ink/30" size={18} />
              <input
                type="email" placeholder="Email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-ink/30" size={18} />
              <input
                type="password" placeholder="Password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-coral text-white py-2.5 rounded-lg font-medium hover:bg-coral-dark transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-ink/50 mt-4">
            Don't have an account?{' '}
            <a href="/register" className="text-teal font-medium">Register</a>
          </p>
        </div>

        <div className="mt-4">
          <HealthTip />
        </div>
      </div>
    </div>
  )
}