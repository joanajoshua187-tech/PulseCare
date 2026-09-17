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
      <div className="px-3 py-3 border border-gray-300 rounded-lg">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button
        type="submit" disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${CONSULTATION_FEE.toFixed(2)}`}
      </button>
      <p className="text-xs text-gray-400 text-center">
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Successful</h2>
          <p className="text-gray-600 mb-6">
            Your payment of ${CONSULTATION_FEE.toFixed(2)} has been processed.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Consultation Payment</h1>
          <p className="text-gray-500 mb-6">
            Amount due: <span className="font-semibold text-gray-800">${CONSULTATION_FEE.toFixed(2)}</span>
          </p>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMethod('card')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border text-xs font-medium ${
                method === 'card' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              <CreditCard size={20} /> Card
            </button>
            <button
              onClick={() => setMethod('mobile')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border text-xs font-medium ${
                method === 'mobile' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              <Smartphone size={20} /> Mobile Money
            </button>
            <button
              onClick={() => setMethod('paypal')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border text-xs font-medium ${
                method === 'paypal' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'
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
              <p className="text-sm text-gray-500 mb-4">
                {method === 'paypal' ? 'PayPal' : 'Mobile Money'} integration is coming soon.
              </p>
              <button
                disabled
                className="w-full bg-gray-200 text-gray-400 py-2.5 rounded-lg font-medium cursor-not-allowed"
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