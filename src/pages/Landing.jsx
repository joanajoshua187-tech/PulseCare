import { useNavigate } from 'react-router-dom'
import { Stethoscope, ShieldCheck, Clock, HeartPulse } from 'lucide-react'
import PulseLine from '../components/PulseLine'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream text-ink">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <HeartPulse className="text-coral" size={26} />
          <span className="font-serif text-xl font-semibold">PulseCare</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium text-teal hover:text-teal-dark"
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-sm font-medium bg-teal text-cream rounded-lg hover:bg-teal-dark transition"
          >
            Get started
          </button>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-serif text-5xl leading-tight font-semibold mb-6">
            Care that meets you where you are.
          </h1>
          <p className="text-lg text-ink/70 mb-8 max-w-md">
            Talk to a doctor, track your symptoms, and manage your health records — all from one place, whenever you need it.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-coral text-white rounded-lg font-medium hover:bg-coral-dark transition"
          >
            Create your account
          </button>
        </div>

        <div className="text-teal">
          <PulseLine className="w-full h-32" />
        </div>
      </section>

      <section className="bg-teal text-cream py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <div>
            <Stethoscope className="mb-3" size={28} />
            <h3 className="font-serif text-xl font-semibold mb-2">Real consultations</h3>
            <p className="text-cream/80 text-sm">
              Video and chat with licensed providers, without the waiting room.
            </p>
          </div>
          <div>
            <Clock className="mb-3" size={28} />
            <h3 className="font-serif text-xl font-semibold mb-2">On your schedule</h3>
            <p className="text-cream/80 text-sm">
              Book an appointment in minutes, day or night.
            </p>
          </div>
          <div>
            <ShieldCheck className="mb-3" size={28} />
            <h3 className="font-serif text-xl font-semibold mb-2">Your records, secured</h3>
            <p className="text-cream/80 text-sm">
              Symptoms, prescriptions, and visit history, all in one protected place.
            </p>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-ink/50">
        PulseCare is a demo application built for illustrative purposes and is not a substitute for professional medical care.
      </footer>
    </div>
  )
}