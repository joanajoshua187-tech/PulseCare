export default function PulseLine({ className = '' }) {
  return (
    <svg
      viewBox="0 0 800 120"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M0,60 L180,60 L210,20 L240,100 L270,10 L300,110 L330,60 L800,60"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="stroke-dasharray"
          from="0, 1000"
          to="1000, 0"
          dur="2.2s"
          fill="freeze"
        />
      </path>
    </svg>
  )
}