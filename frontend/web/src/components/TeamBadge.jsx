import { useMemo, useState } from 'react'
import { slugifyTeam, teamInitials } from '../lib/format'

const LOGO_DIR = '/assets/valorant/teams/'
// webp first: most logos have a same-name .webp sibling alongside the
// original .png (see frontend/prototype/assets/valorant/teams/), generated
// to cut load weight without touching the .png the legacy prototype still
// depends on directly. png stays second so a team with no .webp still works.
const EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg', 'svg']

// Team logos are third-party trademarks, not covered by this project's MIT
// license - see the License section of the root README. Drop your own
// legally-sourced logo at public/assets/valorant/teams/<slug>.<ext> and it's
// picked up automatically. Falls back to a generated initials badge
// otherwise, or if every extension 404s.
export default function TeamBadge({ name, accent = 'brand', size = 40, className = '' }) {
  const slug = useMemo(() => slugifyTeam(name), [name])
  const [extIndex, setExtIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Views like MatchVerdict/TeamProfile don't remount when you navigate to
  // a different match/team (no `key` on them in App.jsx) — they just
  // re-render with new props. Without this, a team whose logo failed to
  // load would leave extIndex/failed stuck, so the *next* team rendered in
  // that same slot never even attempts its own (possibly perfectly valid)
  // logo file. Reset synchronously during render when the identity changes
  // — the React-documented way to do this without an extra effect-driven
  // render. See https://react.dev/learn/you-might-not-need-an-effect
  const [trackedSlug, setTrackedSlug] = useState(slug)
  if (slug !== trackedSlug) {
    setTrackedSlug(slug)
    setExtIndex(0)
    setFailed(false)
    setLoaded(false)
  }

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
      className={`hexagon shrink-0 overflow-hidden relative ${className}`}
      style={{ width: size, height: size, background: 'var(--color-panel-raised)', border: `1px solid ${line}` }}
    >
      {/* Initials placeholder stays underneath until the real logo has
          fully decoded, so a slow/partial image paint (e.g. a stalled dev
          server connection) never shows as a half-drawn, off-center logo
          — the swap only happens once the browser confirms a complete
          decode via onLoad, not the instant a byte arrives. */}
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center font-display font-bold"
          style={{ background: soft, color, fontSize: size * 0.32 }}
        >
          {teamInitials(name)}
        </div>
      )}
      <img
        src={`${LOGO_DIR}${slug}.${EXTENSIONS[extIndex]}`}
        alt={name}
        loading="lazy"
        decoding="async"
        className={`relative w-full h-full object-contain p-1 transition-opacity duration-150 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setLoaded(false)
          if (extIndex + 1 < EXTENSIONS.length) setExtIndex(extIndex + 1)
          else setFailed(true)
        }}
      />
    </div>
  )
}
