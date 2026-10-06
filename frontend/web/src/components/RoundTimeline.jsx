import { useMemo, useRef, useState } from 'react'
import { Panel, SectionHeader, Label } from './ui'
import { WinMethodGlyph } from './icons'

// The four ways a round can end, with the plain-language name shown to users.
const METHODS = [
  { key: 'Elimination', label: 'Eliminations', verb: 'eliminating the other team' },
  { key: 'Defused', label: 'Defuses', verb: 'defusing the spike' },
  { key: 'Detonated', label: 'Detonations', verb: 'detonating the spike' },
  { key: 'Time Expiry (No Plant)', label: 'Time expiry', verb: 'running out the clock with no spike planted' },
]
const PISTOL_ROUNDS = [1, 13]
const COLOR_A = 'var(--color-brand)'
const COLOR_B = 'var(--color-team-b)'
const CHART = { w: 640, h: 200, left: 40, right: 16, top: 16, bottom: 30 }

// Rounds won so far by each side, starting from zero before round 1.
function cumulative(rounds) {
  let a = 0
  let b = 0
  const aSeries = [0]
  const bSeries = [0]
  for (const r of rounds) {
    if (r.winner === 'a') a += 1
    else b += 1
    aSeries.push(a)
    bSeries.push(b)
  }
  return { aSeries, bSeries }
}

function methodCount(rounds, side, method) {
  return rounds.filter((r) => r.winner === side && (method == null || r.method === method)).length
}

function methodLabel(key) {
  return METHODS.find((m) => m.key === key)?.label ?? 'Other'
}

// Two lines, one per team, showing rounds won so far. Both start at zero, so
// the lead is simply the gap between the two lines. Hovering a round shows
// both totals at that point.
function RaceChart({ rounds, hovered, onHover, teamA, teamB }) {
  const { w, h, left, right, top, bottom } = CHART
  const innerW = w - left - right
  const innerH = h - top - bottom
  const { aSeries, bSeries } = useMemo(() => cumulative(rounds), [rounds])
  const n = rounds.length
  const yMax = Math.max(1, ...aSeries, ...bSeries)
  // Index 0 is the start, before round 1. Index k sits in the middle of round k.
  const x = (i) => left + (n > 0 ? ((i === 0 ? 0 : i - 0.5) / n) * innerW : 0)
  const y = (v) => top + innerH - (v / yMax) * innerH
  const ticks = [0, Math.round(yMax / 2), yMax]
  const line = (series) => series.map((v, i) => `${x(i)},${y(v)}`).join(' ')

  function onMove(e) {
    if (n === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * w
    const i = Math.floor(((relX - left) / innerW) * n)
    onHover(Math.min(Math.max(i, 0), n - 1))
  }

  const at = hovered != null ? hovered + 1 : null

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={`Rounds won so far. ${teamA} finished on ${aSeries[n]}, ${teamB} on ${bSeries[n]}.`}
        onPointerMove={onMove}
        onPointerLeave={() => onHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={w - right} y1={y(t)} y2={y(t)} stroke="var(--color-line-soft)" />
            <text x={left - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--color-ink-faint)" fontFamily="IBM Plex Mono">{t}</text>
          </g>
        ))}
        {rounds.map((r, i) => (
          <text key={r.round} x={x(i + 0.5)} y={h - bottom + 16} textAnchor="middle" fontSize="9" fill="var(--color-ink-faint)" fontFamily="IBM Plex Mono">
            {r.round}
          </text>
        ))}
        <text x={w / 2} y={h - 2} textAnchor="middle" fontSize="10" fill="var(--color-ink-dim)" fontFamily="IBM Plex Mono">Round</text>
        {PISTOL_ROUNDS.map((p) => {
          const i = rounds.findIndex((r) => r.round === p)
          if (i < 0) return null
          return <rect key={p} x={x(i + 0.5) - 3} y={h - bottom + 2} width="6" height="6" transform={`rotate(45 ${x(i + 0.5)} ${h - bottom + 5})`} fill="var(--color-mvp)" />
        })}
        {n > 0 && (
          <>
            <polyline points={line(aSeries)} fill="none" stroke={COLOR_A} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={line(bSeries)} fill="none" stroke={COLOR_B} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
        {at != null && (
          <g>
            <line x1={x(at)} x2={x(at)} y1={top} y2={h - bottom} stroke="var(--color-ink)" strokeOpacity="0.4" />
            <circle cx={x(at)} cy={y(aSeries[at])} r="4.5" fill={COLOR_A} stroke="var(--color-panel)" strokeWidth="2" />
            <circle cx={x(at)} cy={y(bSeries[at])} r="4.5" fill={COLOR_B} stroke="var(--color-panel)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {at != null && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap bg-panel-raised border border-line cut-corner-tag px-3 py-2 text-xs"
          style={{ left: `${(x(at) / w) * 100}%`, top: 0, transform: 'translate(-50%, -105%)' }}
          aria-hidden="true"
        >
          <div className="font-mono text-ink-dim">After round {at}</div>
          <div className="flex items-center gap-3 font-semibold tabular-nums">
            <span style={{ color: COLOR_A }}>{teamA} {aSeries[at]}</span>
            <span style={{ color: COLOR_B }}>{teamB} {bSeries[at]}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// One team's card: the score, the pistol and streak facts, and the four ways
// its rounds were won. Each method tile is a button that filters the rounds.
function TeamCard({ name, side, color, rounds, wins, pistol, streak, method, onMethod }) {
  const total = Math.max(1, wins)
  const sentence = (() => {
    const top = METHODS.map((m) => ({ ...m, n: methodCount(rounds, side, m.key) })).sort((a, b) => b.n - a.n)[0]
    if (!wins || !top || top.n === 0) return `${name} has no rounds won on this map.`
    const share = Math.round((top.n / total) * 100)
    return `${share}% of ${name}'s ${wins} round ${wins === 1 ? 'win' : 'wins'} came from ${top.verb}.`
  })()
  return (
    <div className="cut-corner-tag bg-panel-raised border border-line p-4 md:p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-ink-faint">{side === 'a' ? 'Team A' : 'Team B'}</div>
          <div className="font-display text-lg font-semibold truncate" style={{ color }}>{name}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-4xl font-bold tabular-nums leading-none">{wins}</div>
          <div className="text-[11px] text-ink-faint mt-1">rounds won</div>
        </div>
      </div>
      <div className="flex gap-4 font-mono text-[11px] text-ink-dim mb-4">
        <span>Pistol rounds won <span className="text-ink tabular-nums">{pistol}</span></span>
        <span>Longest run <span className="text-ink tabular-nums">{streak}</span></span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3" role="group" aria-label={`${name} rounds won by method. Select a method to filter the rounds.`}>
        {METHODS.map((m) => {
          const n = methodCount(rounds, side, m.key)
          const active = method === m.key
          return (
            <button
              key={m.key}
              type="button"
              aria-pressed={active}
              onClick={() => onMethod(active ? null : m.key)}
              className={`group flex items-center gap-3 min-h-[52px] px-3 py-2 text-left border cut-corner-tag transition-colors ${
                active ? 'bg-panel border-brand-line' : 'bg-panel/60 border-line hover:border-ink-faint'
              }`}
            >
              <span className="shrink-0" style={{ color }}>
                <WinMethodGlyph method={m.key} />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-xl font-bold tabular-nums leading-none">{n}</span>
                <span className="block text-[11px] text-ink-dim truncate mt-1">{m.label}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-ink-faint leading-relaxed">{sentence}</p>
    </div>
  )
}

// The round strip. Each chip is one round. The chip under the pointer or the
// keyboard focus is described below the strip, and a method filter dims the
// rounds that do not match it.
function RoundStrip({ rounds, hovered, onHover, method, teamA, teamB }) {
  const refs = useRef([])
  function onKeyDown(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const current = hovered ?? -1
    const next = e.key === 'ArrowRight' ? Math.min(current + 1, rounds.length - 1) : Math.max(current - 1, 0)
    onHover(next)
    refs.current[next]?.focus()
  }
  return (
    <div role="group" aria-label="Rounds in order" onKeyDown={onKeyDown} className="flex flex-wrap gap-1.5">
      {rounds.map((r, i) => {
        const color = r.winner === 'a' ? COLOR_A : COLOR_B
        const active = hovered === i
        const matches = method == null || r.method === method
        const pistol = PISTOL_ROUNDS.includes(r.round)
        return (
          <button
            key={r.round}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            tabIndex={active || (hovered == null && i === 0) ? 0 : -1}
            onMouseEnter={() => onHover(i)}
            onFocus={() => onHover(i)}
            aria-label={`Round ${r.round}${pistol ? ', pistol round' : ''}: ${r.winner === 'a' ? teamA : teamB} won by ${methodLabel(r.method).toLowerCase()}`}
            className="rise-in relative w-9 h-9 flex items-center justify-center border cut-corner-tag transition-all duration-150"
            style={{
              background: `color-mix(in srgb, ${color} ${active ? 32 : 14}%, transparent)`,
              borderColor: color,
              color,
              opacity: matches ? 1 : 0.22,
              transform: active ? 'scale(1.12)' : 'none',
              animationDelay: `${Math.min(i * 18, 500)}ms`,
            }}
          >
            <WinMethodGlyph method={r.method} />
            {pistol && <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rotate-45 bg-mvp" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}

export default function RoundTimeline({ games, teamA, teamB }) {
  const [mapIndex, setMapIndex] = useState(0)
  const [hovered, setHovered] = useState(null)
  const [method, setMethod] = useState(null)
  const game = games?.[Math.min(mapIndex, (games?.length ?? 1) - 1)] ?? null
  const rounds = useMemo(() => game?.rounds ?? [], [game])

  if (!games || games.length === 0) return null

  const aWins = methodCount(rounds, 'a')
  const bWins = methodCount(rounds, 'b')
  const pistolA = rounds.filter((r) => PISTOL_ROUNDS.includes(r.round) && r.winner === 'a').length
  const pistolB = rounds.filter((r) => PISTOL_ROUNDS.includes(r.round) && r.winner === 'b').length
  const streak = (side) => {
    let best = 0
    let run = 0
    for (const r of rounds) {
      run = r.winner === side ? run + 1 : 0
      best = Math.max(best, run)
    }
    return best
  }
  const hoveredRound = hovered != null ? rounds[hovered] : null

  function chooseMap(i) {
    setMapIndex(i)
    setHovered(null)
    setMethod(null)
  }

  return (
    <Panel className="p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <SectionHeader className="mb-1">Round timeline</SectionHeader>
          <Label>Rounds won so far, and how each team won them</Label>
        </div>
        <div role="group" aria-label="Choose a map" className="flex flex-wrap gap-1 p-1 bg-panel-raised border border-line cut-corner-tag self-start">
          {games.map((g, i) => (
            <button
              key={g.game_id}
              type="button"
              aria-pressed={i === mapIndex}
              onClick={() => chooseMap(i)}
              className={`min-h-[36px] px-3 font-mono text-[11px] cut-corner-tag transition-colors ${
                i === mapIndex ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
              }`}
            >
              {g.map}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <TeamCard name={teamA} side="a" color={COLOR_A} rounds={rounds} wins={aWins} pistol={pistolA} streak={streak('a')} method={method} onMethod={setMethod} />
        <TeamCard name={teamB} side="b" color={COLOR_B} rounds={rounds} wins={bWins} pistol={pistolB} streak={streak('b')} method={method} onMethod={setMethod} />
      </div>

      <div className="cut-corner-tag bg-panel-raised border border-line p-4 md:p-5 mb-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 text-[11px] text-ink-dim">
          <span className="flex items-center gap-2"><span className="w-3 h-[3px]" style={{ background: COLOR_A }} aria-hidden="true" />{teamA}</span>
          <span className="flex items-center gap-2"><span className="w-3 h-[3px]" style={{ background: COLOR_B }} aria-hidden="true" />{teamB}</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rotate-45 bg-mvp" aria-hidden="true" />Pistol round</span>
          <span className="ml-auto font-mono text-ink-faint">{hoveredRound ? `Round ${hoveredRound.round} selected` : 'Hover the chart for a round'}</span>
        </div>
        <RaceChart rounds={rounds} hovered={hovered} onHover={setHovered} teamA={teamA} teamB={teamB} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Each square is one round. Select a method above to see only the rounds it decided.</Label>
          {method && (
            <button type="button" onClick={() => setMethod(null)} className="font-mono text-xs text-brand hover:brightness-110 min-h-[36px] px-2">
              Showing {methodLabel(method).toLowerCase()}. Clear filter
            </button>
          )}
        </div>
        <RoundStrip rounds={rounds} hovered={hovered} onHover={setHovered} method={method} teamA={teamA} teamB={teamB} />
        <p className="font-mono text-xs text-ink-dim min-h-[1.25rem]" aria-live="polite">
          {hoveredRound
            ? `Round ${hoveredRound.round}${PISTOL_ROUNDS.includes(hoveredRound.round) ? ' (pistol)' : ''}: ${hoveredRound.winner === 'a' ? teamA : teamB} won by ${methodLabel(hoveredRound.method).toLowerCase()}.`
            : ''}
        </p>
      </div>
    </Panel>
  )
}
