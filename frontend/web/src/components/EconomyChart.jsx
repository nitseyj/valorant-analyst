import { Panel, SectionHeader } from './ui'

function LineChart({ rounds, width = 600, height = 130 }) {
  const padding = { left: 34, right: 8, top: 10, bottom: 18 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const n = rounds.length

  const aVals = rounds.map((r) => r.team_a_loadout).filter((v) => v !== null && v !== undefined)
  const bVals = rounds.map((r) => r.team_b_loadout).filter((v) => v !== null && v !== undefined)
  const maxVal = Math.max(...aVals, ...bVals, 1000)

  const x = (i) => padding.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2)
  const y = (v) => padding.top + innerH - (Math.max(v, 0) / maxVal) * innerH

  const pointsFor = (key) =>
    rounds
      .map((r, i) => (r[key] !== null && r[key] !== undefined ? `${x(i)},${y(r[key])}` : null))
      .filter(Boolean)
      .join(' ')

  const gridFracs = [0, 0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      {gridFracs.map((f) => {
        const gy = padding.top + innerH * (1 - f)
        const val = Math.round(maxVal * f)
        const label = val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
        return (
          <g key={f}>
            <line x1={padding.left} y1={gy} x2={width - padding.right} y2={gy} stroke="var(--color-line-soft)" strokeWidth="1" />
            <text x={padding.left - 6} y={gy + 3} textAnchor="end" fontSize="8" fill="var(--color-ink-faint)" fontFamily="IBM Plex Mono">
              {label}
            </text>
          </g>
        )
      })}
      <polyline points={pointsFor('team_a_loadout')} fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={pointsFor('team_b_loadout')} fill="none" stroke="var(--color-team-b)" strokeWidth="2" strokeLinejoin="round" />
      {rounds.map((r, i) =>
        r.team_a_loadout != null ? (
          <circle key={`a${i}`} cx={x(i)} cy={y(r.team_a_loadout)} r="2.4" fill="var(--color-brand)">
            <title>Round {r.round}: {r.team_a_loadout}</title>
          </circle>
        ) : null
      )}
      {rounds.map((r, i) =>
        r.team_b_loadout != null ? (
          <circle key={`b${i}`} cx={x(i)} cy={y(r.team_b_loadout)} r="2.4" fill="var(--color-team-b)">
            <title>Round {r.round}: {r.team_b_loadout}</title>
          </circle>
        ) : null
      )}
    </svg>
  )
}

export default function EconomyChart({ games, teamA, teamB }) {
  if (!games || games.length === 0) {
    return <p className="text-xs text-ink-faint">· economy tracker — no round-level economy data loaded for this series</p>
  }
  return (
    <Panel className="p-5">
      <SectionHeader>Economy tracker</SectionHeader>
      <div className="flex gap-4 text-[11px] text-ink-faint mb-3.5">
        <span><span className="text-brand">━</span> {teamA}</span>
        <span><span className="text-team-b">━</span> {teamB}</span>
        <span className="ml-auto">loadout value per round</span>
      </div>
      {games.map((g, i) => (
        <div key={g.game_id} className={i < games.length - 1 ? 'mb-5' : ''}>
          <div className="text-[11px] text-ink-dim mb-1.5">{g.map}</div>
          <LineChart rounds={g.rounds} />
        </div>
      ))}
    </Panel>
  )
}
