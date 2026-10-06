import { useRef, useState } from 'react'
import MapImage from './MapImage'
import { Panel, Label, SectionHeader } from './ui'
import { prefersReducedMotion } from '../lib/hooks'

// One map tile. The pointer tilts the tile toward itself by writing a
// transform straight to the DOM, so moving the mouse never re-renders the grid.
function AtlasTile({ map, share, selected, onSelect, delay }) {
  const tiltRef = useRef(null)

  function track(e) {
    const el = tiltRef.current
    if (!el || prefersReducedMotion()) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(700px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`
  }

  function reset() {
    if (tiltRef.current) tiltRef.current.style.transform = ''
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(map.map)}
      onPointerMove={track}
      onPointerLeave={reset}
      className={`rise-in group relative min-h-[132px] overflow-hidden cut-corner-sm border text-left transition-colors ${
        selected ? 'border-brand-line' : 'border-line hover:border-ink-faint'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div ref={tiltRef} className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform">
        <MapImage map={map.map} className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(to top, rgba(10,10,13,0.94) 0%, rgba(10,10,13,0.25) 60%, transparent 100%)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 p-3 pointer-events-none">
        <div className="font-display text-sm font-semibold">{map.map}</div>
        <div className="font-mono text-[11px] text-ink-dim tabular-nums">{share.toFixed(1)}%</div>
        <div className="h-1 mt-2 bg-line-soft overflow-hidden" aria-hidden="true">
          <div className="grow-x h-full bg-brand" style={{ width: `${share}%`, animationDelay: `${delay + 200}ms` }} />
        </div>
      </div>
    </button>
  )
}

// All maps from the overview, ordered by pick count. The detail panel puts the
// selected map's share against an even split across the maps, so the reader
// can see whether a map is picked more or less than average.
export default function MapAtlas({ maps }) {
  const [selectedName, setSelectedName] = useState(null)
  const sorted = [...maps].sort((a, b) => b.played - a.played)
  const total = sorted.reduce((sum, m) => sum + m.played, 0)
  const selected = sorted.find((m) => m.map === selectedName) ?? sorted[0]
  const share = total ? (selected.played / total) * 100 : 0
  const even = maps.length ? 100 / maps.length : 0
  const diff = share - even
  const rank = sorted.indexOf(selected) + 1

  return (
    <section>
      <SectionHeader>Map atlas</SectionHeader>
      <Label className="mb-5">All {maps.length} maps, share of loaded picks. Tilt a tile, select one to compare.</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {sorted.map((m, i) => (
          <AtlasTile
            key={m.map}
            map={m}
            share={total ? (m.played / total) * 100 : 0}
            selected={m.map === selected.map}
            onSelect={setSelectedName}
            delay={Math.min(i * 40, 400)}
          />
        ))}
      </div>
      <Panel className="mt-4 p-5 flex flex-col md:flex-row md:items-center gap-5 rise-in">
        <div className="min-w-0 md:w-56 shrink-0">
          <div className="font-mono text-[11px] text-ink-faint">#{rank} of {sorted.length}</div>
          <div className="font-display text-xl font-bold truncate">{selected.map}</div>
          <div className="font-mono text-xs text-ink-dim tabular-nums mt-1">
            {selected.played.toLocaleString()} played, {share.toFixed(1)}%
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="relative h-3 bg-line-soft">
            <div className="grow-x absolute inset-y-0 left-0 bg-brand" style={{ width: `${share}%` }} />
            <div
              className="absolute -top-1.5 -bottom-1.5 w-px bg-ink"
              style={{ left: `${even}%` }}
              aria-hidden="true"
            />
          </div>
          <p className="mt-3 font-mono text-xs text-ink-faint" aria-live="polite">
            {Math.abs(diff) < 0.05
              ? `Right on the even split of ${even.toFixed(1)}%.`
              : `${Math.abs(diff).toFixed(1)} points ${diff > 0 ? 'above' : 'below'} the even split of ${even.toFixed(1)}%.`}
          </p>
        </div>
      </Panel>
    </section>
  )
}
