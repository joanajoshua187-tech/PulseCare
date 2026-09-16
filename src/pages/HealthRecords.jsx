import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, User, Calendar, Activity, FileText, Pill } from 'lucide-react'

export default function HealthRecords() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [assessments, setAssessments] = useState([])
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
        return
      }

      const [profileRes, assessRes, apptRes, presRes] = await Promise.all([
        supabase.from('patients').select('*').eq('id', user.id).single(),
        supabase.from('symptom_assessments').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('appointments').select('*, providers(full_name, specialty)').eq('patient_id', user.id).order('appointment_date', { ascending: false }),
        supabase.from('prescriptions').select('*, providers(full_name, specialty)').eq('patient_id', user.id).order('created_at', { ascending: false }),
      ])

      setProfile(profileRes.data)
      setAssessments(assessRes.data || [])
      setAppointments(apptRes.data || [])
      setPrescriptions(presRes.data || [])
      setLoading(false)
    }
    load()
  }, [navigate])

  const urgencyColor = (level) => {
    if (level === 'emergency') return 'bg-red-50 text-red-600'
    if (level === 'see_doctor') return 'bg-amber-50 text-amber-600'
    return 'bg-green-50 text-green-600'
  }

  const urgencyLabel = (level) => {
    if (level === 'emergency') return 'Emergency'
    if (level === 'see_doctor') return 'See a Doctor'
    return 'Self-Care'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-500">Loading your records...</p>
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

        <h1 className="text-xl font-bold text-gray-800 mb-1">Health Records</h1>
        <p className="text-gray-500 mb-6">Your complete health history</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-blue-600" size={20} />
            <h2 className="font-semibold text-gray-800">Personal Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Full Name</p>
              <p className="text-gray-800 font-medium">{profile?.full_name || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400">Date of Birth</p>
              <p className="text-gray-800 font-medium">{profile?.date_of_birth || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400">Gender</p>
              <p className="text-gray-800 font-medium capitalize">{profile?.gender || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400">Phone</p>
              <p className="text-gray-800 font-medium">{profile?.phone || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="text-blue-600" size={20} />
            <h2 className="font-semibold text-gray-800">Prescriptions</h2>
          </div>
          {prescriptions.length === 0 && (
            <p className="text-sm text-gray-400">No prescriptions yet.</p>
          )}
          <div className="space-y-3">
            {prescriptions.map((p) => (
              <div key={p.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{p.medication_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {p.dosage} · {p.frequency} {p.duration && `· ${p.duration}`}
                </p>
                {p.instructions && (
                  <p className="text-sm text-gray-500 mt-1 italic">"{p.instructions}"</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Prescribed by {p.providers?.full_name} · {p.providers?.specialty}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-blue-600" size={20} />
            <h2 className="font-semibold text-gray-800">Symptom Assessment History</h2>
          </div>
          {assessments.length === 0 && (
            <p className="text-sm text-gray-400">No assessments recorded yet.</p>
          )}
          <div className="space-y-3">
            {assessments.map((a) => (
              <div key={a.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${urgencyColor(a.urgency_level)}`}>
                    {urgencyLabel(a.urgency_level)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Symptoms:</span> {a.symptoms?.join(', ')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Duration: {a.duration?.replace(/_/g, ' ')} · Severity: {a.severity}
                </p>
                {a.notes && <p className="text-sm text-gray-500 mt-1 italic">"{a.notes}"</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-600" size={20} />
            <h2 className="font-semibold text-gray-800">Appointment History</h2>
          </div>
          {appointments.length === 0 && (
            <p className="text-sm text-gray-400">No appointments recorded yet.</p>
          )}
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800">{appt.providers?.full_name}</span>
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full capitalize">
                    {appt.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{appt.providers?.specialty}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {appt.appointment_date} at {appt.appointment_time}
                </p>
                {appt.reason && <p className="text-sm text-gray-500 mt-1 italic">"{appt.reason}"</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}