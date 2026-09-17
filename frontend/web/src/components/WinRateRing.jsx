import { useEffect, useRef } from 'react'

export default function WinRateRing({ winRate, size = 84 }) {
  const ref = useRef(null)
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  const pct = winRate || 0
  const offset = c * (1 - pct)
  const color = pct >= 0.5 ? 'var(--color-brand)' : 'var(--color-team-b)'

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.strokeDashoffset = c
    const raf = requestAnimationFrame(() => {
      el.style.strokeDashoffset = offset
    })
    return () => cancelAnimationFrame(raf)
  }, [offset, c])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth="5" />
      <circle
        ref={ref}
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={c}
        strokeDashoffset={c}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)' }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
        fontFamily="IBM Plex Mono"
        fontSize={size * 0.2}
        fontWeight="600"
        fill="var(--color-ink)"
      >
        {(pct * 100).toFixed(0)}%
      </text>
    </svg>
  )
}
