import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, LogOut, Calendar, User, Video } from 'lucide-react'

export default function ProviderDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('patients')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData?.role !== 'provider') {
        navigate('/dashboard')
        return
      }
      setProfile(profileData)

      const { data: apptData } = await supabase
        .from('appointments')
        .select('*, providers(full_name, specialty)')
        .eq('provider_id', profileData.provider_id)
        .order('appointment_date', { ascending: true })

      setAppointments(apptData || [])
      setLoading(false)
    }
    load()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Stethoscope className="text-blue-600" size={24} />
          <span className="font-bold text-lg text-gray-800">PulseCare — Provider</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 text-gray-500 hover:text-red-600">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome, {profile?.full_name}
        </h1>
        <p className="text-gray-500 mb-8">Your upcoming and past appointments</p>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && appointments.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">No appointments assigned to you yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="text-blue-600" size={18} />
                  <span className="font-semibold text-gray-800">Patient Appointment</span>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full capitalize">
                  {appt.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {appt.appointment_date}
                </span>
                <span>{appt.appointment_time}</span>
              </div>
              {appt.reason && (
                <p className="text-sm text-gray-500 mb-3 italic">Reason: "{appt.reason}"</p>
              )}
              <button
                onClick={() => navigate(`/consultation/${appt.id}`)}
                className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                <Video size={16} /> Join Consultation
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}