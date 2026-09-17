import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Calendar, Clock, Video, User } from 'lucide-react'

export default function MyAppointments() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAppointments = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('*, providers(full_name, specialty)')
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: true })

      if (!error) setAppointments(data)
      setLoading(false)
    }
    loadAppointments()
  }, [navigate])

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-ink/50 hover:text-ink mb-4"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="font-serif text-xl font-semibold text-ink mb-1">My Appointments</h1>
        <p className="text-ink/60 mb-6">Your scheduled and past visits</p>

        {loading && <p className="text-ink/50">Loading...</p>}

        {!loading && appointments.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-ink/5">
            <p className="text-ink/60 mb-4">You have no appointments yet.</p>
            <button
              onClick={() => navigate('/book')}
              className="bg-coral text-white px-5 py-2 rounded-lg font-medium hover:bg-coral-dark"
            >
              Book an Appointment
            </button>
          </div>
        )}

        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white p-5 rounded-xl shadow-sm border border-ink/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="text-teal" size={18} />
                  <span className="font-serif font-semibold text-ink">{appt.providers?.full_name}</span>
                </div>
                <span className="text-xs px-2 py-1 bg-teal/10 text-teal capitalize rounded-full">
                  {appt.status}
                </span>
              </div>
              <p className="text-sm text-ink/50 mb-3">{appt.providers?.specialty}</p>
              <div className="flex items-center gap-4 text-sm text-ink/60 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {appt.appointment_date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {appt.appointment_time}
                </span>
              </div>
              <button
                onClick={() => navigate(`/consultation/${appt.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-sage text-white py-2 rounded-lg font-medium hover:opacity-90"
              >
                <Video size={18} /> Join Consultation
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}