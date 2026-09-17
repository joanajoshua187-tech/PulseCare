import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, LogOut, Users, Calendar, Pill, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ patients: 0, appointments: 0, prescriptions: 0, assessments: 0 })
  const [patients, setPatients] = useState([])
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

      if (profileData?.role !== 'admin') {
        navigate('/dashboard')
        return
      }
      setProfile(profileData)

      const [patientsRes, apptRes, presRes, assessRes] = await Promise.all([
        supabase.from('patients').select('*').eq('role', 'patient'),
        supabase.from('appointments').select('*, providers(full_name, specialty)').order('appointment_date', { ascending: false }),
        supabase.from('prescriptions').select('id'),
        supabase.from('symptom_assessments').select('id'),
      ])

      setPatients(patientsRes.data || [])
      setAppointments(apptRes.data || [])
      setStats({
        patients: patientsRes.data?.length || 0,
        appointments: apptRes.data?.length || 0,
        prescriptions: presRes.data?.length || 0,
        assessments: assessRes.data?.length || 0,
      })
      setLoading(false)
    }
    load()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Stethoscope className="text-blue-600" size={24} />
          <span className="font-bold text-lg text-gray-800">PulseCare — Admin</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 text-gray-500 hover:text-red-600">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome, {profile?.full_name}
        </h1>
        <p className="text-gray-500 mb-8">System-wide overview</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <Users className="text-blue-600 mb-2" size={22} />
            <p className="text-2xl font-bold text-gray-800">{stats.patients}</p>
            <p className="text-xs text-gray-500">Registered Patients</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <Calendar className="text-teal-600 mb-2" size={22} />
            <p className="text-2xl font-bold text-gray-800">{stats.appointments}</p>
            <p className="text-xs text-gray-500">Total Appointments</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <Pill className="text-blue-600 mb-2" size={22} />
            <p className="text-2xl font-bold text-gray-800">{stats.prescriptions}</p>
            <p className="text-xs text-gray-500">Prescriptions Issued</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <Activity className="text-amber-500 mb-2" size={22} />
            <p className="text-2xl font-bold text-gray-800">{stats.assessments}</p>
            <p className="text-xs text-gray-500">Symptom Assessments</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">All Patients</h2>
          {patients.length === 0 && <p className="text-sm text-gray-400">No patients registered yet.</p>}
          <div className="space-y-2">
            {patients.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-gray-50 py-2 text-sm">
                <span className="text-gray-800">{p.full_name}</span>
                <span className="text-gray-400">{p.phone || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Appointments</h2>
          {appointments.length === 0 && <p className="text-sm text-gray-400">No appointments yet.</p>}
          <div className="space-y-2">
            {appointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-gray-50 py-2 text-sm">
                <span className="text-gray-800">{a.providers?.full_name} ({a.providers?.specialty})</span>
                <span className="text-gray-400">{a.appointment_date} · {a.appointment_time}</span>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full capitalize">{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}