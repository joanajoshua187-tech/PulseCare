import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { HeartPulse, User, Mail, Lock, Phone, Calendar } from 'lucide-react'
import HealthTip from '../components/HealthTip'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', dob: '', gender: '', phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('patients').insert({
        id: data.user.id,
        full_name: form.fullName,
        date_of_birth: form.dob,
        gender: form.gender,
        phone: form.phone,
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <HeartPulse className="text-coral" size={30} />
          <h1 className="font-serif text-2xl font-semibold text-ink">PulseCare</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-ink/5">
          <h2 className="font-serif text-xl font-semibold text-ink mb-1">Create your account</h2>
          <p className="text-ink/60 text-sm mb-6">Takes about a minute. Your care starts here.</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-ink/30" size={18} />
              <input
                type="text" name="fullName" placeholder="Full Name" required
                value={form.fullName} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-ink/30" size={18} />
              <input
                type="email" name="email" placeholder="Email" required
                value={form.email} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-ink/30" size={18} />
              <input
                type="password" name="password" placeholder="Password (min 6 chars)" required
                minLength={6}
                value={form.password} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-ink/30" size={18} />
              <input
                type="date" name="dob" required
                value={form.dob} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>

            <select
              name="gender" required value={form.gender} onChange={handleChange}
              className="w-full px-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
            >
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>

            <div className="relative">
              <Phone className="absolute left-3 top-3 text-ink/30" size={18} />
              <input
                type="tel" name="phone" placeholder="Phone Number" required
                value={form.phone} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-coral text-white py-2.5 rounded-lg font-medium hover:bg-coral-dark transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-ink/50 mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-teal font-medium">Log in</a>
          </p>
        </div>

        <div className="mt-4">
          <HealthTip />
        </div>
      </div>
    </div>
  )
}