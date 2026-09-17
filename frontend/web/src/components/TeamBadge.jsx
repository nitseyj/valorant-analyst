import { useMemo, useState } from 'react'
import { slugifyTeam, teamInitials } from '../lib/format'

const LOGO_DIR = '/assets/valorant/teams/'
const EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'svg']

// Team logos aren't included in this repo (Riot IP — see README.md);
// if you've legally sourced your own, drop them at
// public/assets/valorant/teams/<slug>.<ext> and they're picked up
// automatically. Falls back to a generated initials badge otherwise, or if
// every extension 404s.
export default function TeamBadge({ name, accent = 'brand', size = 40, className = '' }) {
  const slug = useMemo(() => slugifyTeam(name), [name])
  const [extIndex, setExtIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  const color = accent === 'brand' ? 'var(--color-brand)' : 'var(--color-team-b)'
  const soft = accent === 'brand' ? 'var(--color-brand-dim)' : 'var(--color-team-b-dim)'
  const line = accent === 'brand' ? 'var(--color-brand-line)' : 'var(--color-team-b-line)'

  if (failed || extIndex >= EXTENSIONS.length) {
    return (
      <div
        className={`hexagon flex items-center justify-center font-display font-bold shrink-0 ${className}`}
        style={{ width: size, height: size, background: soft, color, border: `1px solid ${line}`, fontSize: size * 0.32 }}
      >
        {teamInitials(name)}
      </div>
    )
  }

  return (
    <div
      className={`hexagon shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, background: 'var(--color-panel-raised)', border: `1px solid ${line}` }}
    >
      <img
        src={`${LOGO_DIR}${slug}.${EXTENSIONS[extIndex]}`}
        alt={name}
        loading="lazy"
        className="w-full h-full object-contain p-1"
        onError={() => {
          if (extIndex + 1 < EXTENSIONS.length) setExtIndex(extIndex + 1)
          else setFailed(true)
        }}
      />
    </div>
  )
}
