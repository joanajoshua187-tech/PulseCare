import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Stethoscope, ArrowLeft, AlertTriangle, CheckCircle2, Activity } from 'lucide-react'

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {result === 'emergency' && (
            <>
              <AlertTriangle className="mx-auto text-red-600 mb-4" size={48} />
              <h2 className="text-xl font-bold text-red-600 mb-2">Seek Emergency Care</h2>
              <p className="text-gray-600 mb-6">
                Your symptoms may indicate a serious condition. Please go to the nearest emergency room or call emergency services immediately.
              </p>
            </>
          )}
          {result === 'see_doctor' && (
            <>
              <Activity className="mx-auto text-amber-500 mb-4" size={48} />
              <h2 className="text-xl font-bold text-amber-600 mb-2">See a Doctor Soon</h2>
              <p className="text-gray-600 mb-6">
                Your symptoms suggest you should consult a healthcare provider within the next day or two.
              </p>
            </>
          )}
          {result === 'self_care' && (
            <>
              <CheckCircle2 className="mx-auto text-green-600 mb-4" size={48} />
              <h2 className="text-xl font-bold text-green-600 mb-2">Self-Care Recommended</h2>
              <p className="text-gray-600 mb-6">
                Your symptoms appear mild. Rest, hydration, and monitoring are recommended. Consult a doctor if symptoms worsen.
              </p>
            </>
          )}

          <p className="text-xs text-gray-400 mb-6">
            This is not a medical diagnosis. Always consult a licensed healthcare provider for medical concerns.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            {result !== 'self_care' && (
              <button
                onClick={() => navigate('/book')}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700"
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
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <Stethoscope className="text-blue-600" size={28} />
            <h1 className="text-xl font-bold text-gray-800">Symptom Assessment</h1>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How long have you had these symptoms?
              </label>
              <select
                value={duration} onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">Select duration</option>
                <option value="less_than_1_day">Less than a day</option>
                <option value="1_3_days">1–3 days</option>
                <option value="4_7_days">4–7 days</option>
                <option value="more_than_week">More than a week</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional notes (optional)
              </label>
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything else you'd like to mention..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Get Assessment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}