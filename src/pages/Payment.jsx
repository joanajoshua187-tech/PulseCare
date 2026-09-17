import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ArrowLeft, CreditCard, Smartphone, Wallet, CheckCircle2 } from 'lucide-react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
const CONSULTATION_FEE = 25.00

function CardPaymentForm({ appointmentId, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!stripe || !elements) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setLoading(true)

    const { data: fnData, error: fnError } = await supabase.functions.invoke('create-payment-intent', {
      body: { amount: CONSULTATION_FEE, currency: 'usd' },
    })

    if (fnError || fnData?.error) {
      setError(fnData?.error || fnError.message)
      setLoading(false)
      return
    }

    const cardElement = elements.getElement(CardElement)

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(fnData.clientSecret, {
      payment_method: { card: cardElement },
    })

    if (stripeError) {
      setError(stripeError.message)
      setLoading(false)
      return
    }

    await supabase.from('payments').insert({
      patient_id: user.id,
      appointment_id: appointmentId || null,
      amount: CONSULTATION_FEE,
      currency: 'usd',
      status: paymentIntent.status,
      payment_method: 'card',
      stripe_payment_intent_id: paymentIntent.id,
    })

    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}
      <div className="px-3 py-3 border border-ink/15 rounded-lg">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button
        type="submit" disabled={!stripe || loading}
        className="w-full bg-coral text-white py-2.5 rounded-lg font-medium hover:bg-coral-dark disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${CONSULTATION_FEE.toFixed(2)}`}
      </button>
      <p className="text-xs text-ink/40 text-center">
        Test mode — use card number 4242 4242 4242 4242, any future date, any CVC.
      </p>
    </form>
  )
}

export default function Payment() {
  const { appointmentId } = useParams()
  const navigate = useNavigate()
  const [method, setMethod] = useState('card')
  const [success, setSuccess] = useState(false)

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-ink/5">
          <CheckCircle2 className="mx-auto text-sage mb-4" size={48} />
          <h2 className="font-serif text-2xl font-semibold text-ink mb-2">Thank you for your payment</h2>
          <p className="text-ink/60 mb-6">
            ${CONSULTATION_FEE.toFixed(2)} has been received. See you at your appointment.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-coral text-white py-2.5 rounded-lg font-medium hover:bg-coral-dark"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-8">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-ink/50 hover:text-ink mb-4"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-ink/5">
          <h1 className="font-serif text-xl font-semibold text-ink mb-1">Consultation Payment</h1>
          <p className="text-ink/60 mb-6">
            Amount due: <span className="font-semibold text-ink">${CONSULTATION_FEE.toFixed(2)}</span>
          </p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMethod('card')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border text-xs font-medium ${
                method === 'card' ? 'bg-teal text-white border-teal' : 'bg-white text-ink/60 border-ink/15'
              }`}
            >
              <CreditCard size={20} /> Card
            </button>
            <button
              onClick={() => setMethod('mobile')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border text-xs font-medium ${
                method === 'mobile' ? 'bg-teal text-white border-teal' : 'bg-white text-ink/60 border-ink/15'
              }`}
            >
              <Smartphone size={20} /> Mobile Money
            </button>
            <button
              onClick={() => setMethod('paypal')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border text-xs font-medium ${
                method === 'paypal' ? 'bg-teal text-white border-teal' : 'bg-white text-ink/60 border-ink/15'
              }`}
            >
              <Wallet size={20} /> PayPal
            </button>
          </div>

          {method === 'card' && (
            <Elements stripe={stripePromise}>
              <CardPaymentForm appointmentId={appointmentId} onSuccess={() => setSuccess(true)} />
            </Elements>
          )}

          {method !== 'card' && (
            <div className="text-center py-6">
              <p className="text-sm text-ink/50 mb-4">
                {method === 'paypal' ? 'PayPal' : 'Mobile Money'} integration is coming soon.
              </p>
              <button
                disabled
                className="w-full bg-ink/10 text-ink/40 py-2.5 rounded-lg font-medium cursor-not-allowed"
              >
                Not Yet Available
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}