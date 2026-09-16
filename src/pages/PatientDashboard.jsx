import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, FileText, LogOut, Stethoscope, Video} from 'lucide-react'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }
      const { data } = await supabase.from('patients').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    loadProfile()
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
          <span className="font-bold text-lg text-gray-800">PulseCare</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 text-gray-500 hover:text-red-600">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome{profile ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-gray-500 mb-8">Here's your health overview</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
            onClick={() => navigate('/symptoms')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left hover:shadow-md transition"
          >
            <LayoutDashboard className="text-blue-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Symptom Check</h3>
            <p className="text-sm text-gray-500 mt-1">Start a new assessment</p>
          </button>
            
                    <button
            onClick={() => navigate('/book')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left hover:shadow-md transition"
          >
            <Calendar className="text-teal-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Book Appointment</h3>
            <p className="text-sm text-gray-500 mt-1">See available doctors</p>
          </button>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <FileText className="text-blue-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Health Records</h3>
            <p className="text-sm text-gray-500 mt-1">View your history</p>
                      <button
            onClick={() => navigate('/book')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left hover:shadow-md transition"
          >
            <Calendar className="text-teal-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">Book Appointment</h3>
            <p className="text-sm text-gray-500 mt-1">See available doctors</p>
          </button>
                    <button
            onClick={() => navigate('/appointments')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left hover:shadow-md transition"
          >
            <Video className="text-teal-600 mb-2" size={24} />
            <h3 className="font-semibold text-gray-800">My Appointments</h3>
            <p className="text-sm text-gray-500 mt-1">Join or view consultations</p>
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}