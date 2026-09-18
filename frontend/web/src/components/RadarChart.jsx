import PlayerPortrait from './PlayerPortrait'

// Generic N-axis ("pentagon") comparison chart. Each axis's plotted
// position is the `normalized` (0-1) value the backend computed from the
// real min/max range observed across the loaded dataset (see
// backend/app/analyzers/radar_stats.py) — never a fabricated 0-100
// "power score". The real value + unit for each axis is always shown
// alongside the shape, not just the chart position, so nothing is hidden
// behind a normalized coordinate.
function polygonPoints(axes, cx, cy, radius) {
  const n = axes.length
  return axes
    .map((axis, i) => {
      const angle = -Math.PI / 2 + i * ((2 * Math.PI) / n)
      const f = axis.normalized ?? 0
      return `${cx + radius * f * Math.cos(angle)},${cy + radius * f * Math.sin(angle)}`
    })
    .join(' ')
}

function gridRing(n, cx, cy, radius, fraction) {
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + i * ((2 * Math.PI) / n)
    return `${cx + radius * fraction * Math.cos(angle)},${cy + radius * fraction * Math.sin(angle)}`
  }).join(' ')
}

function formatAxisValue(axis) {
  if (axis.value == null) return '—'
  return axis.is_percentage ? `${axis.value}%` : axis.value
}

// A flanking card for one side of the chart — the player's (or team's)
// name plus their historically best-performing agent, shown as a photo,
// same convention as PlayerPortrait everywhere else in the app (not a
// real player photo — see README.md). Only rendered when the caller
// actually has agent data (player radar), so team radar — which has no
// concept of "a team's agent" — falls back to the plain legend below.
function SideCard({ series, color }) {
  return (
    <div className="flex flex-col items-center gap-2.5 shrink-0 text-center">
      <PlayerPortrait agent={series.best_agent} color={color} size={72} />
      <div>
        <div className="text-sm font-semibold" style={{ color }}>{series.name}</div>
        {series.best_agent && <div className="text-[10px] text-ink-faint font-mono capitalize mt-0.5">{series.best_agent}</div>}
      </div>
    </div>
  )
}

export default function RadarChart({ a, b, colorA = 'var(--color-brand)', colorB = 'var(--color-team-b)', size = 280 }) {
  if (!a || !a.axes || a.axes.length === 0) return null
  const axes = a.axes
  const n = axes.length
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 46
  const hasAgentFlanks = Boolean(a.best_agent || (b && b.best_agent))

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap">
        {hasAgentFlanks && <SideCard series={a} color={colorA} />}

        <div className="flex flex-col items-center gap-3">
          <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <polygon key={f} points={gridRing(n, cx, cy, radius, f)} fill="none" stroke="var(--color-line-soft)" strokeWidth="1" />
            ))}
            {axes.map((axis, i) => {
              const angle = -Math.PI / 2 + i * ((2 * Math.PI) / n)
              return (
                <line
                  key={axis.metric}
                  x1={cx} y1={cy}
                  x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)}
                  stroke="var(--color-line-soft)" strokeWidth="1"
                />
              )
            })}

            {b && b.axes && (
              <polygon points={polygonPoints(b.axes, cx, cy, radius)} fill={colorB} fillOpacity="0.16" stroke={colorB} strokeWidth="1.6" strokeLinejoin="round" />
            )}
            <polygon points={polygonPoints(axes, cx, cy, radius)} fill={colorA} fillOpacity="0.18" stroke={colorA} strokeWidth="1.6" strokeLinejoin="round" />

            {axes.map((axis, i) => {
              const angle = -Math.PI / 2 + i * ((2 * Math.PI) / n)
              const lx = cx + (radius + 26) * Math.cos(angle)
              const ly = cy + (radius + 26) * Math.sin(angle)
              const anchor = Math.cos(angle) > 0.3 ? 'start' : Math.cos(angle) < -0.3 ? 'end' : 'middle'
              return (
                <g key={axis.metric}>
                  <text x={lx} y={ly - 5} textAnchor={anchor} fontSize="10" fill="var(--color-ink-dim)" fontFamily="IBM Plex Mono">
                    {axis.label}
                  </text>
                  <text x={lx} y={ly + 7} textAnchor={anchor} fontSize="10" fontWeight="600" fill={colorA} fontFamily="IBM Plex Mono">
                    {formatAxisValue(axis)}
                    {b && b.axes && <tspan fill={colorB}> / {formatAxisValue(b.axes[i])}</tspan>}
                  </text>
                </g>
              )
            })}
          </svg>
          {!hasAgentFlanks && (
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span style={{ color: colorA }}>■ {a.name}</span>
              {b && <span style={{ color: colorB }}>■ {b.name}</span>}
            </div>
          )}
        </div>

        {hasAgentFlanks && b && <SideCard series={b} color={colorB} />}
      </div>
    </div>
  )
}
