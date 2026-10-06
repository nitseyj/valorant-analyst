import { useMemo, useState } from 'react'
import { slugifyTeam } from '../lib/format'

const LOGO_DIR = '/assets/valorant/teams/'
const EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'svg']

// A large, faded team logo meant to sit behind a panel's content and be cut
// off by the panel's edge, so only part of it shows. Purely decorative: it is
// hidden from assistive tech, takes no pointer events, and draws nothing at
// all when no logo file exists, rather than an initials placeholder.
//
// The parent must be `relative` with `overflow-hidden` for the cut-off effect.
// With `reveal`, the logo is hidden until an ancestor with the `group` class
// is hovered, then fades in. The ancestor must be `relative` and `overflow-hidden`.
export default function TeamWatermark({ name, size = 420, className = '', reveal = false }) {
  const slug = useMemo(() => slugifyTeam(name), [name])
  const [extIndex, setExtIndex] = useState(0)

  // Reset when the team changes, so a missing file for one team does not
  // stop the next team's logo from being tried.
  const [trackedSlug, setTrackedSlug] = useState(slug)
  if (slug !== trackedSlug) {
    setTrackedSlug(slug)
    setExtIndex(0)
  }

  if (extIndex >= EXTENSIONS.length) return null

  return (
    <img
      src={`${LOGO_DIR}${slug}.${EXTENSIONS[extIndex]}`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setExtIndex((i) => i + 1)}
      className={`pointer-events-none select-none absolute z-0 object-contain ${
        reveal ? 'opacity-0 group-hover:opacity-[0.22] transition-opacity duration-500' : 'opacity-[0.16]'
      } ${className}`}
      style={{ width: size, height: size, filter: 'saturate(0.7)' }}
    />
  )
}
