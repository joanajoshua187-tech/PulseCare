
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Star, Calendar, Clock, User } from 'lucide-react'

const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']

export default function BookAppointment() {
  const navigate = useNavigate()
  const [providers, setProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newAppointmentId, setNewAppointmentId] = useState(null)

  useEffect(() => {
    const loadProviders = async () => {
      const { data, error } = await supabase.from('providers').select('*')
      if (error) {
        setError(error.message)
        return
      }
      setProviders(data)
    }
    loadProviders()
  }, [])

  const handleBook = async (e) => {
    e.preventDefault()
    setError('')

    if (!date || !time) {
      setError('Please select a date and time.')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }

    const { data: newAppt, error: insertError } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        provider_id: selectedProvider.id,
        appointment_date: date,
        appointment_time: time,
        reason,
      })
      .select()
      .single()

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setNewAppointmentId(newAppt.id)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-green-600" size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Appointment Booked</h2>
          <p className="text-gray-600 mb-6">
            Your appointment with {selectedProvider.full_name} on {date} at {time} has been scheduled.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
            >
              Pay Later
            </button>
            <button
              onClick={() => navigate(`/payment/${newAppointmentId}`)}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedProvider) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setSelectedProvider(null)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={18} /> Back to providers
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={26} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{selectedProvider.full_name}</h2>
                <p className="text-sm text-gray-500">{selectedProvider.specialty}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-1" size={16} /> Select Date
                </label>
                <input
                  type="date" required
                  min={new Date().toISOString().split('T')[0]}
                  value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline mr-1" size={16} /> Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`py-2 rounded-lg text-sm border transition ${
                        time === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for visit (optional)
                </label>
                <textarea
                  value={reason} onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Briefly describe your reason for the visit..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-xl font-bold text-gray-800 mb-1">Choose a Provider</h1>
        <p className="text-gray-500 mb-6">Select a doctor or nurse to book an appointment</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider)}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-left hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{provider.full_name}</h3>
                  <p className="text-xs text-gray-500">{provider.specialty}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{provider.bio}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{provider.years_experience} yrs experience</span>
                <span className="flex items-center gap-1">
                  <Star className="fill-amber-400 text-amber-400" size={14} />
                  {provider.rating}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}