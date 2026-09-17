import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { HeartPulse, ArrowLeft, AlertTriangle, CheckCircle2, Activity } from 'lucide-react'

const SYMPTOM_OPTIONS = [
  'Fever', 'Cough', 'Headache', 'Sore throat', 'Fatigue',
  'Nausea', 'Vomiting', 'Diarrhea', 'Shortness of breath',
  'Chest pain', 'Abdominal pain', 'Dizziness', 'Rash', 'Joint pain'
]

const EMERGENCY_SYMPTOMS = ['Chest pain', 'Shortness of breath']

export default function SymptomAssessment() {
  const navigate = useNavigate()
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    )
  }

  const calculateUrgency = () => {
    const hasEmergencySymptom = selectedSymptoms.some((s) => EMERGENCY_SYMPTOMS.includes(s))
    if (hasEmergencySymptom || severity === 'severe') return 'emergency'
    if (selectedSymptoms.length >= 3 || severity === 'moderate') return 'see_doctor'
    return 'self_care'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom.')
      return
    }
    if (!duration || !severity) {
      setError('Please fill in duration and severity.')
      return
    }

    setLoading(true)
    const urgency = calculateUrgency()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }

    const { error: insertError } = await supabase.from('symptom_assessments').insert({
      patient_id: user.id,
      symptoms: selectedSymptoms,
      duration,
      severity,
      notes,
      urgency_level: urgency,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setResult(urgency)
  }

  if (result) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-ink/5">
          {result === 'emergency' && (
            <>
              <AlertTriangle className="mx-auto text-red-600 mb-4" size={48} />
              <h2 className="font-serif text-2xl font-semibold text-red-600 mb-2">Please seek emergency care</h2>
              <p className="text-ink/60 mb-6">
                Your symptoms may indicate something serious. Please go to the nearest emergency room or call emergency services now.
              </p>
            </>
          )}
          {result === 'see_doctor' && (
            <>
              <Activity className="mx-auto text-coral mb-4" size={48} />
              <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Worth seeing a doctor soon</h2>
              <p className="text-ink/60 mb-6">
                Based on what you've shared, we'd recommend speaking with a provider within the next day or two.
              </p>
            </>
          )}
          {result === 'self_care' && (
            <>
              <CheckCircle2 className="mx-auto text-sage mb-4" size={48} />
              <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Sounds manageable at home</h2>
              <p className="text-ink/60 mb-6">
                Rest, fluids, and a bit of patience should help. Reach out if things get worse.
              </p>
            </>
          )}

          <p className="text-xs text-ink/40 mb-6">
            This isn't a medical diagnosis. Always consult a licensed healthcare provider for medical concerns.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 border border-ink/15 text-ink py-2.5 rounded-lg font-medium hover:bg-ink/5"
            >
              Back to Dashboard
            </button>
            {result !== 'self_care' && (
              <button
                onClick={() => navigate('/book')}
                className="flex-1 bg-coral text-white py-2.5 rounded-lg font-medium hover:bg-coral-dark"
              >
                Book Appointment
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-ink/50 hover:text-ink mb-4"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-ink/5">
          <div className="flex items-center gap-2 mb-6">
            <HeartPulse className="text-coral" size={26} />
            <h1 className="font-serif text-xl font-semibold text-ink">How are you feeling?</h1>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Select your symptoms
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SYMPTOM_OPTIONS.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-2 rounded-lg text-sm border transition ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-teal text-white border-teal'
                        : 'bg-white text-ink border-ink/15 hover:border-teal/50'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                How long have you had these symptoms?
              </label>
              <select
                value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
              >
                <option value="">Select duration</option>
                <option value="less_than_1_day">Less than a day</option>
                <option value="1_3_days">1–3 days</option>
                <option value="4_7_days">4–7 days</option>
                <option value="more_than_week">More than a week</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                How severe would you rate it?
              </label>
              <div className="flex gap-3">
                {['mild', 'moderate', 'severe'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition ${
                      severity === level
                        ? 'bg-teal text-white border-teal'
                        : 'bg-white text-ink border-ink/15 hover:border-teal/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Anything else worth mentioning? (optional)
              </label>
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything else you'd like to mention..."
                className="w-full px-3 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-coral text-white py-2.5 rounded-lg font-medium hover:bg-coral-dark transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Get My Assessment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}