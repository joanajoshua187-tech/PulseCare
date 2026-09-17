import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { HeartPulse, LogOut, Calendar, User, Video, Pill, X } from 'lucide-react'

export default function ProviderDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [prescribingFor, setPrescribingFor] = useState(null)
  const [medName, setMedName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [duration, setDuration] = useState('')
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

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

  const openPrescriptionForm = (appt) => {
    setPrescribingFor(appt)
    setMedName('')
    setDosage('')
    setFrequency('')
    setDuration('')
    setInstructions('')
    setError('')
    setSuccess(false)
  }

  const submitPrescription = async (e) => {
    e.preventDefault()
    setError('')

    if (!medName || !dosage || !frequency) {
      setError('Medication name, dosage, and frequency are required.')
      return
    }

    setSubmitting(true)
    const { error: insertError } = await supabase.from('prescriptions').insert({
      appointment_id: prescribingFor.id,
      patient_id: prescribingFor.patient_id,
      provider_id: profile.provider_id,
      medication_name: medName,
      dosage,
      frequency,
      duration,
      instructions,
    })
    setSubmitting(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-ink/5">
        <div className="flex items-center gap-2">
          <HeartPulse className="text-coral" size={24} />
          <span className="font-serif font-semibold text-lg text-ink">PulseCare — Provider</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1 text-ink/50 hover:text-red-600">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-1">
          Welcome, {profile?.full_name}
        </h1>
        <p className="text-ink/60 mb-8">Your upcoming and past appointments</p>

        {loading && <p className="text-ink/50">Loading...</p>}

        {!loading && appointments.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-ink/5">
            <p className="text-ink/60">No appointments assigned to you yet.</p>
          </div>
        )}

        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white p-5 rounded-xl shadow-sm border border-ink/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="text-teal" size={18} />
                  <span className="font-semibold text-ink">Patient Appointment</span>
                </div>
                <span className="text-xs px-2 py-1 bg-teal/10 text-teal rounded-full capitalize">
                  {appt.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-ink/60 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {appt.appointment_date}
                </span>
                <span>{appt.appointment_time}</span>
              </div>
              {appt.reason && (
                <p className="text-sm text-ink/50 mb-3 italic">Reason: "{appt.reason}"</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/consultation/${appt.id}`)}
                  className="flex items-center justify-center gap-2 bg-sage text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                >
                  <Video size={16} /> Join Consultation
                </button>
                <button
                  onClick={() => openPrescriptionForm(appt)}
                  className="flex items-center justify-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark"
                >
                  <Pill size={16} /> Write Prescription
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {prescribingFor && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full relative border border-ink/5">
            <button
              onClick={() => setPrescribingFor(null)}
              className="absolute top-4 right-4 text-ink/40 hover:text-ink"
            >
              <X size={20} />
            </button>

            {success ? (
              <div className="text-center py-4">
                <Pill className="mx-auto text-sage mb-3" size={40} />
                <h3 className="font-serif font-semibold text-ink text-lg mb-2">Prescription Sent</h3>
                <p className="text-sm text-ink/60 mb-4">
                  The prescription has been added to the patient's health records.
                </p>
                <button
                  onClick={() => setPrescribingFor(null)}
                  className="w-full bg-coral text-white py-2 rounded-lg font-medium hover:bg-coral-dark"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-serif font-semibold text-ink text-lg mb-4 flex items-center gap-2">
                  <Pill className="text-teal" size={20} /> Write Prescription
                </h3>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={submitPrescription} className="space-y-3">
                  <input
                    type="text" placeholder="Medication name" required
                    value={medName} onChange={(e) => setMedName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Dosage (e.g. 500mg)" required
                    value={dosage} onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Frequency (e.g. Twice daily)" required
                    value={frequency} onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Duration (e.g. 7 days)"
                    value={duration} onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
                  />
                  <textarea
                    placeholder="Additional instructions (optional)"
                    value={instructions} onChange={(e) => setInstructions(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
                  />
                  <button
                    type="submit" disabled={submitting}
                    className="w-full bg-coral text-white py-2.5 rounded-lg font-medium hover:bg-coral-dark disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send Prescription'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}