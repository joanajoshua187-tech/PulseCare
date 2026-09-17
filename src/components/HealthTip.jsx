import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'

const TIPS = [
  "Small habits compound. A ten-minute walk today is still a win.",
  "Hydration affects mood and focus more than most people realize.",
  "Sleep is when your body does its repair work — protect it.",
  "You don't have to wait until something's wrong to check in with a doctor.",
  "Stretching for five minutes can ease tension you didn't know you were holding.",
]

export default function HealthTip() {
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])

  return (
    <div className="flex items-start gap-2 bg-sage/10 border border-sage/30 rounded-lg p-3 text-sm text-teal-dark">
      <Sparkles size={16} className="mt-0.5 shrink-0 text-sage" />
      <p>{tip}</p>
    </div>
  )
}