import { useState } from 'react'
import { MapGlyph } from './icons'

// Original stylized map art (not real in-game callouts/screenshots — see
// frontend/web/README.md) at public/assets/maps/<slug>.jpg. Falls back to
// the abstract MapGlyph icon if a file is ever missing.
export default function MapImage({ map, className = '' }) {
  const [failed, setFailed] = useState(false)
  // Reset when `map` changes without this component remounting (e.g. a
  // parent view that stays mounted across navigation) — see TeamBadge.jsx
  // for why this matters: without it, a prior map's failed-load state
  // would wrongly stick to a different map shown in the same slot.
  const [trackedMap, setTrackedMap] = useState(map)
  if (map !== trackedMap) {
    setTrackedMap(map)
    setFailed(false)
  }

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-panel-raised text-ink-faint ${className}`}>
        <MapGlyph map={map} size={20} />
      </div>
    )
  }

  return (
    <img
      src={`/assets/maps/${map.toLowerCase()}.jpg`}
      alt={map}
      loading="lazy"
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
