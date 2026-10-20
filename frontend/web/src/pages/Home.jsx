import { useEffect, useMemo, useState } from 'react'
import { getOverview, getMeta, listMatches, getMatchVerdict, getTimeline } from '../lib/api'
import { extractMvp, impactColor, matchScoreStr } from '../lib/format'
import { ROLE_COLOR } from '../lib/roles'
import { Label, EmptyState, Skeleton, Button } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import PlayerPortrait from '../components/PlayerPortrait'
import AgentImage from '../components/AgentImage'
import MapAtlas from '../components/MapAtlas'
import { useCountUp, prefersReducedMotion } from '../lib/hooks'

const RANK_OPTIONS = [
  { key: 'acs', label: 'ACS' },
  { key: 'rating', label: 'Rating' },
  { key: 'maps', label: 'Maps played' },
]

// The page's sections, in reading order. The index strip jumps between them.
const SECTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'season', label: 'Season' },
  { id: 'maps', label: 'Maps' },
  { id: 'meta', label: 'Meta' },
  { id: 'boards', label: 'Leaderboards' },
]

// Hero radar: one spoke for every map in the database, and the filled shape
// is each map's real pick count, scaled to the busiest map.
function MapRadar({ maps, size = 300 }) {
  const c = size / 2
  const r = size / 2 - 46
  const n = maps.length
  const max = Math.max(...maps.map((m) => m.played), 1)
  const total = maps.reduce((sum, m) => sum + m.played, 0)
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const point = (i, f) => [c + r * f * Math.cos(angle(i)), c + r * f * Math.sin(angle(i))]
  const shape = maps.map((m, i) => point(i, m.played / max).join(',')).join(' ')
  const rings = [0.25, 0.5, 0.75, 1]
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label="Map pick share radar for every map">
      <div
        className="radar-sweep pointer-events-none absolute inset-0 rounded-full opacity-30"
        style={{ background: 'conic-gradient(from 0deg, transparent 0deg, var(--color-brand) 40deg, transparent 58deg)' }}
        aria-hidden="true"
      />
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
        {rings.map((f) => (
          <polygon key={f} points={Array.from({ length: n }, (_, i) => point(i, f).join(',')).join(' ')} fill="none" stroke="var(--color-line)" strokeWidth="1" />
        ))}
        {maps.map((_, i) => {
          const [x, y] = point(i, 1)
          return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--color-line)" strokeWidth="1" />
        })}
        <g className="poly-in">
          <polygon points={shape} fill="var(--color-brand)" fillOpacity="0.2" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" />
          {maps.map((m, i) => {
            const [x, y] = point(i, m.played / max)
            return <circle key={m.map} cx={x} cy={y} r="4" fill="var(--color-brand)" />
          })}
        </g>
      </svg>
      {maps.map((m, i) => {
        const [x, y] = point(i, 1.2)
        const share = total ? ((m.played / total) * 100).toFixed(0) : '0'
        return (
          <div key={m.map} className="absolute -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap pointer-events-none" style={{ left: x, top: y }}>
            <div className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">{m.map}</div>
            <div className="font-mono text-xs font-semibold text-ink tabular-nums">{share}%</div>
          </div>
        )
      })}
    </div>
  )
}

// A ring that fills to the spotlight verdict's real impact score (0 to 1).
function ImpactRing({ value, color }) {
  const animated = useCountUp(value * 100, 1600)
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - animated / 100)
  return (
    <div className="relative w-20 h-20 shrink-0" role="img" aria-label={`Impact ${Math.round(value * 100)} out of 100`}>
      <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="5" />
        <circle cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold tabular-nums">{Math.round(animated)}</span>
    </div>
  )
}

// Four headline figures on one strip. Rules separate them, not boxes.
function MetricStrip({ counts }) {
  const cells = [
    { key: 'players', label: 'Players' },
    { key: 'teams', label: 'Teams' },
    { key: 'matches', label: 'Matches' },
    { key: 'events', label: 'Events' },
  ]
  return (
    <dl className="grid grid-cols-2 md:grid-cols-4 border-y border-line">
      {cells.map((c, i) => (
        <MetricCell key={c.key} label={c.label} value={counts[c.key]} divider={i > 0} delay={i * 120} />
      ))}
    </dl>
  )
}

function MetricCell({ label, value, divider, delay }) {
  const animated = useCountUp(value, 1600)
  return (
    <div className={`rise-in px-5 md:px-7 py-6 ${divider ? 'md:border-l border-line' : ''}`} style={{ animationDelay: `${delay}ms` }}>
      <dt className="font-mono text-xs text-ink-dim">{label}</dt>
      <dd className="font-display text-4xl md:text-5xl font-bold tabular-nums leading-none mt-3">{Math.round(animated).toLocaleString()}</dd>
    </div>
  )
}

// The ticker stays as it was: a looping strip of recent series, with a Pause
// control. The list is written twice so the loop has no gap; the second copy
// is hidden from assistive tech and out of the tab order.
function SeriesTicker({ matches, onOpenMatch }) {
  const [paused, setPaused] = useState(false)
  if (matches === null) return <Skeleton className="h-14" />
  if (matches.length === 0) return <EmptyState>No recent series loaded.</EmptyState>
  const items = matches.slice(0, 12)
  const strip = (copy) =>
    items.map((m) => {
      const aWon = m.winner === m.team_a
      const bWon = m.winner === m.team_b
      return (
        <button
          key={`${copy ? 'copy' : 'main'}-${m.match_id}`}
          type="button"
          tabIndex={copy ? -1 : 0}
          aria-hidden={copy || undefined}
          onClick={() => onOpenMatch(m.match_id)}
          className="flex items-center gap-3 px-5 py-3.5 shrink-0 border-r border-line-soft hover:bg-panel-raised transition-colors"
        >
          <span className={`text-sm font-semibold ${aWon ? 'text-brand' : 'text-ink-dim'}`}>{m.team_a}</span>
          <span className="font-mono text-sm tabular-nums text-ink">{matchScoreStr(m)}</span>
          <span className={`text-sm font-semibold ${bWon ? 'text-team-b' : 'text-ink-dim'}`}>{m.team_b}</span>
          {m.tournament && <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">{m.tournament}</span>}
        </button>
      )
    })
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="min-h-[36px] px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim hover:text-ink border border-line cut-corner-tag"
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
      <div className={`marquee marquee-mask overflow-hidden border border-line bg-panel cut-corner-sm ${paused ? 'is-paused' : ''}`}>
        <div className="marquee-track">
          {strip(false)}
          {strip(true)}
        </div>
      </div>
    </div>
  )
}

// The season as vertical columns. Each column's height is its share of the
// busiest phase. Hovering or focusing a column shows its share of the season.
function SeasonColumns({ phases }) {
  const [active, setActive] = useState(null)
  const max = Math.max(...phases.map((p) => p.matches), 1)
  const total = phases.reduce((sum, p) => sum + p.matches, 0)
  const current = active != null ? phases[active] : null
  return (
    <div>
      <div className="flex items-end gap-2 md:gap-4 h-64" role="list" aria-label="Matches per season phase">
        {phases.map((p, i) => {
          const on = active === i
          return (
            <button
              key={p.phase}
              type="button"
              role="listitem"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`${p.phase}: ${p.matches} matches`}
              className="group flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-2"
            >
              <span className={`font-mono text-xs tabular-nums transition-colors ${on ? 'text-brand' : 'text-ink-dim'}`}>{p.matches}</span>
              <span
                className={`block w-full transition-colors duration-200 ${on ? 'bg-brand' : 'bg-brand/50'}`}
                style={{ height: `${(p.matches / max) * 100}%`, animation: `rise-in 700ms ease-out ${i * 70}ms both` }}
                aria-hidden="true"
              />
              <span className={`font-mono text-[10px] md:text-[11px] text-center leading-tight transition-colors ${on ? 'text-ink' : 'text-ink-faint'}`}>{p.phase}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-5 min-h-[1.25rem] font-mono text-xs text-ink-dim" aria-live="polite">
        {current ? `${current.phase} is ${((current.matches / total) * 100).toFixed(1)}% of the season's matches.` : 'Hover or focus a column to see its share of the season.'}
      </p>
    </div>
  )
}

// Rounds won so far by each side, starting from zero before round 1. Mirrors
// RoundTimeline's cumulative() math, kept separate here so this stays in
// Home's eagerly-loaded chunk without pulling in that much heavier panel,
// which is lazy-loaded only on the verdict page.
function cumulativeWins(rounds) {
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

// A smooth curve through a cumulative-wins series: each round-to-round step
// becomes a gentle S-curve (bezier control points at the segment's midpoint
// x) instead of a sharp angle, which is what made two crossing lines read as
// a jagged zigzag rather than a readable shape.
function smoothPath(points) {
  if (points.length === 0) return ''
  let d = `M ${points[0][0]},${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const cx = (x0 + x1) / 2
    d += ` C ${cx.toFixed(1)},${y0.toFixed(1)} ${cx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`
  }
  return d
}

// The same curve, closed down to the baseline, for a soft gradient fill
// under the line instead of a bare stroke floating on empty panel.
function smoothAreaPath(points, baselineY) {
  if (points.length === 0) return ''
  const [firstX] = points[0]
  const [lastX] = points[points.length - 1]
  return `${smoothPath(points)} L ${lastX.toFixed(1)},${baselineY} L ${firstX.toFixed(1)},${baselineY} Z`
}

// A read-only race chart driven by the clock rather than the pointer: it
// only ever shows the rounds "revealed" so far, so the curve visibly builds
// left to right as the replay plays. Gridlines and round ticks give the eye
// fixed reference points, so two crossing curves read as a shape rather than
// noise, and each line ends in its own live value instead of a bare dot.
function ReplayChart({ rounds, revealed, teamA, teamB }) {
  const w = 560
  const h = 156
  const left = 10
  const right = 30
  const top = 16
  const bottom = 24
  const innerW = w - left - right
  const innerH = h - top - bottom
  const n = rounds.length
  const shown = rounds.slice(0, revealed)
  const { aSeries, bSeries } = cumulativeWins(shown)
  const yMax = Math.max(1, aSeries[aSeries.length - 1], bSeries[bSeries.length - 1])
  const baseline = top + innerH
  const x = (i) => left + (n > 0 ? (i / n) * innerW : 0)
  const y = (v) => baseline - (v / yMax) * innerH
  const points = (series) => series.map((v, i) => [x(i), y(v)])
  const aNow = aSeries[aSeries.length - 1] ?? 0
  const bNow = bSeries[bSeries.length - 1] ?? 0

  // Keep the two end labels from overlapping when the scores are close.
  let aLabelY = y(aNow)
  let bLabelY = y(bNow)
  if (Math.abs(aLabelY - bLabelY) < 14) {
    if (aLabelY <= bLabelY) {
      aLabelY -= 7
      bLabelY += 7
    } else {
      aLabelY += 7
      bLabelY -= 7
    }
  }

  const tickEvery = n > 16 ? 5 : n > 8 ? 2 : 1
  const ticks = n > 0 ? Array.from({ length: Math.floor(n / tickEvery) + 1 }, (_, i) => i * tickEvery).filter((t) => t <= n) : []

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto overflow-visible"
      role="img"
      aria-label={`Replay in progress: ${teamA} ${aNow}, ${teamB} ${bNow}, after round ${revealed} of ${n}.`}
    >
      <defs>
        <linearGradient id="replay-fill-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="replay-fill-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-team-b)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-team-b)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0.33, 0.66].map((f) => (
        <line
          key={f}
          x1={left}
          x2={left + innerW}
          y1={top + innerH * f}
          y2={top + innerH * f}
          stroke="var(--color-line-soft)"
          strokeDasharray="2 4"
        />
      ))}
      <line x1={left} x2={left + innerW} y1={baseline} y2={baseline} stroke="var(--color-line-soft)" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={baseline} y2={baseline + 3} stroke="var(--color-line-soft)" />
          <text x={x(t)} y={baseline + 15} textAnchor="middle" fontSize="9" fontFamily="IBM Plex Mono" fill="var(--color-ink-faint)">
            {t}
          </text>
        </g>
      ))}

      {n > 0 && (
        <>
          <path d={smoothAreaPath(points(bSeries), baseline)} fill="url(#replay-fill-b)" />
          <path d={smoothAreaPath(points(aSeries), baseline)} fill="url(#replay-fill-a)" />
          <path d={smoothPath(points(bSeries))} fill="none" stroke="var(--color-team-b)" strokeWidth="2.5" strokeLinecap="round" />
          <path d={smoothPath(points(aSeries))} fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {revealed > 0 && (
        <>
          <circle cx={x(bSeries.length - 1)} cy={y(bNow)} r="4" fill="var(--color-team-b)" stroke="var(--color-panel-raised)" strokeWidth="2" />
          <circle cx={x(aSeries.length - 1)} cy={y(aNow)} r="4" fill="var(--color-brand)" stroke="var(--color-panel-raised)" strokeWidth="2" />
          <text x={x(bSeries.length - 1) + 9} y={bLabelY + 4} fontSize="13" fontWeight="700" fontFamily="IBM Plex Mono" fill="var(--color-team-b)">
            {bNow}
          </text>
          <text x={x(aSeries.length - 1) + 9} y={aLabelY + 4} fontSize="13" fontWeight="700" fontFamily="IBM Plex Mono" fill="var(--color-brand)">
            {aNow}
          </text>
        </>
      )}
    </svg>
  )
}

// An auto-playing replay of a real map's round-by-round progress, cycling
// through the loaded highlight matches. Built entirely from the match's own
// round data (no video, nothing fabricated): each round reveals on a timer,
// and the chart builds up exactly the way RoundTimeline's race chart would if
// you watched it round by round. Reduced-motion users get each match's full,
// finished chart immediately, with just the slower rotation between matches.
function MatchReplay({ pool, onOpen }) {
  const [index, setIndex] = useState(0)
  const [timeline, setTimeline] = useState(undefined) // undefined = loading
  const [revealed, setRevealed] = useState(0)
  const [paused, setPaused] = useState(false)
  const current = pool[index % pool.length]
  const reduced = prefersReducedMotion()

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    setTimeline(undefined)
    setRevealed(0)
    getTimeline(current.match_id, { signal: controller.signal }).then((t) => {
      if (!cancelled) setTimeline(t)
    })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [current.match_id])

  const game = timeline?.round_timeline?.[0] ?? null
  const rounds = useMemo(() => game?.rounds ?? [], [game])

  useEffect(() => {
    if (paused || rounds.length === 0) return undefined
    if (reduced) {
      setRevealed(rounds.length)
      const t = setTimeout(() => setIndex((i) => (i + 1) % pool.length), 7000)
      return () => clearTimeout(t)
    }
    if (revealed < rounds.length) {
      const t = setTimeout(() => setRevealed((r) => r + 1), 550)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setIndex((i) => (i + 1) % pool.length), 2200)
    return () => clearTimeout(t)
  }, [revealed, rounds.length, paused, reduced, pool.length])

  const color = impactColor(current.primary_factor.winner || current.winner, current.team_a)

  return (
    <div className="rise-in w-full border border-line bg-panel cut-corner p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <span className="font-mono text-xs text-brand">Match replay</span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-ink-faint" aria-live="polite">
            {game ? `${game.map}, round ${Math.min(revealed, rounds.length)} of ${rounds.length}` : 'Loading replay...'}
          </span>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="min-h-[36px] px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-dim hover:text-ink border border-line cut-corner-tag"
          >
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
      </div>
      <button type="button" onClick={() => onOpen(current.match_id)} className="group w-full text-left">
        <div className="grid md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10 mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <TeamBadge name={current.team_a} accent="brand" size={64} />
            <span className="font-display text-2xl md:text-4xl font-bold truncate">{current.team_a}</span>
          </div>
          <div
            className="font-mono text-5xl md:text-7xl font-semibold tabular-nums text-center group-hover:opacity-85 transition-opacity"
            style={{ textShadow: `0 0 28px ${color}` }}
          >
            {matchScoreStr(current)}
          </div>
          <div className="flex items-center justify-end gap-4 min-w-0 md:text-right">
            <span className="font-display text-2xl md:text-4xl font-bold truncate">{current.team_b}</span>
            <TeamBadge name={current.team_b} accent="team-b" size={64} />
          </div>
        </div>
      </button>
      <div className="cut-corner-tag bg-panel-raised border border-line p-4 md:p-5 mb-6">
        {rounds.length > 0 ? (
          <ReplayChart rounds={rounds} revealed={revealed} teamA={current.team_a} teamB={current.team_b} />
        ) : (
          <div className="h-[120px] flex items-center justify-center font-mono text-xs text-ink-faint">
            {timeline === undefined ? 'Loading replay...' : 'No round data for this map.'}
          </div>
        )}
      </div>
      <button type="button" onClick={() => onOpen(current.match_id)} className="group w-full text-left flex flex-col md:flex-row md:items-center gap-5 pt-6 border-t border-line-soft">
        <ImpactRing value={current.ranked_factors[0].impact} color={color} />
        <p className="text-sm text-ink-dim leading-relaxed max-w-3xl">{current.primary_factor.summary}</p>
        <span className="md:ml-auto font-mono text-xs shrink-0 group-hover:text-brand transition-colors" style={{ color }}>
          {current.primary_factor.category}: {current.primary_factor.impact_label.toLowerCase()} · Open verdict
        </span>
      </button>
    </div>
  )
}

// Top agents by pick rate as art tiles. The art is shown whole, and the
// number and role colour sit beneath it.
function MetaTiles({ agents }) {
  if (agents === null) return <Skeleton className="h-64" />
  if (agents.length === 0) return <EmptyState>No agent pick data loaded.</EmptyState>
  return (
    <ol className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {agents.map((a, i) => {
        const pct = a.pick_rate * 100
        const color = ROLE_COLOR[a.role] || 'var(--color-ink-faint)'
        return (
          <li key={a.agent} className="rise-in" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="relative aspect-[3/4] overflow-hidden border border-line bg-panel-raised">
              <AgentImage agent={a.agent} className="absolute inset-0 w-full h-full scale-110 blur-xl opacity-40" />
              <AgentImage agent={a.agent} fit="contain" className="absolute inset-0 w-full h-full" />
              <span className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color }} aria-hidden="true" />
            </div>
            <div className="flex items-baseline justify-between gap-2 mt-2">
              <span className="text-sm font-semibold capitalize truncate">{a.agent}</span>
              <span className="font-mono text-xs tabular-nums shrink-0" style={{ color }}>{pct.toFixed(0)}%</span>
            </div>
            <div className="font-mono text-[10px] text-ink-faint truncate">{a.role}</div>
          </li>
        )
      })}
    </ol>
  )
}

// Player of the match in recent verdicts, as large portrait cards.
function NotableRow({ notable, onOpen }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {notable.map((n, i) => (
        <button
          key={n.matchId}
          type="button"
          onClick={() => onOpen(n.matchId)}
          className="rise-in group flex items-center gap-4 p-4 border border-line bg-panel hover:border-brand/40 transition-colors text-left"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <span className="shrink-0 transition-transform group-hover:-translate-y-0.5">
            <PlayerPortrait agent={n.agent} color={n.color} size={64} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold truncate">{n.name}</span>
            <span className="block text-[11px] text-ink-faint truncate">{n.team}</span>
            {n.rating != null && <span className="block font-mono text-xs text-ink-dim mt-1">{n.rating.toFixed(2)} rating</span>}
          </span>
        </button>
      ))}
    </div>
  )
}

// The index strip. It stays visible while scrolling, and the section in the
// middle of the viewport is marked as current.
function SectionIndex({ active, onJump }) {
  return (
    <nav aria-label="Page sections" className="sticky top-3 z-30">
      <div className="flex flex-wrap gap-1 p-1 w-fit bg-panel border border-line cut-corner-tag shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onJump(s.id)}
            aria-current={active === s.id ? 'true' : undefined}
            className={`min-h-[36px] px-3.5 font-mono text-[11px] uppercase tracking-[0.12em] cut-corner-tag transition-colors ${
              active === s.id ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

// A podium for the top three, then the rest as a list. The podium heights are
// fixed by rank, so they show order, not a scale.
function Podium({ items, render }) {
  const top = items.slice(0, 3)
  const order = [top[1], top[0], top[2]].filter(Boolean)
  const heights = { 0: 'h-32', 1: 'h-24', 2: 'h-16' }
  if (top.length === 0) return null
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6 items-end mb-6">
      {order.map((item) => {
        const rank = items.indexOf(item)
        return (
          <div key={rank} className="rise-in flex flex-col items-center gap-3 min-w-0" style={{ animationDelay: `${rank * 110}ms` }}>
            {render.avatar(item, rank)}
            <div className="text-center min-w-0 w-full">{render.caption(item, rank)}</div>
            <div className={`w-full ${heights[rank]} border-t-2 bg-panel-raised flex items-start justify-center pt-2`} style={{ borderColor: render.color(rank) }}>
              <span className="font-display text-2xl font-bold" style={{ color: render.color(rank) }}>{rank + 1}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Players and team win rates in one panel. The tabs follow the keyboard tab
// pattern: arrow keys move between them, and only the selected tab is in the
// tab order.
function Leaderboards({ stats, rankBy, onRankBy, onOpenTeam }) {
  const [tab, setTab] = useState('players')
  const tabs = [
    { key: 'players', label: 'Top players' },
    { key: 'teams', label: 'Team win rate' },
  ]
  function onTabKey(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const i = tabs.findIndex((t) => t.key === tab)
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].key
    setTab(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  const rankedPlayers = useMemo(() => {
    const list = [...stats.top_players]
    if (rankBy === 'rating') list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    if (rankBy === 'maps') list.sort((a, b) => b.maps - a.maps)
    return list
  }, [stats, rankBy])

  const playerValue = (p) => (rankBy === 'rating' ? p.rating : rankBy === 'maps' ? p.maps : p.acs)

  return (
    <section id="boards" data-section className="scroll-mt-28 rise-in">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div role="tablist" aria-label="Leaderboards" onKeyDown={onTabKey} className="flex gap-1 p-1 bg-panel border border-line cut-corner-tag">
          {tabs.map((t) => (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              role="tab"
              type="button"
              aria-selected={tab === t.key}
              aria-controls={`panel-${t.key}`}
              tabIndex={tab === t.key ? 0 : -1}
              onClick={() => setTab(t.key)}
              className={`min-h-[40px] px-4 font-mono text-xs cut-corner-tag transition-colors ${
                tab === t.key ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'players' && (
          <div role="group" aria-label="Rank players by" className="flex gap-1">
            {RANK_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                aria-pressed={rankBy === o.key}
                onClick={() => onRankBy(o.key)}
                className={`min-h-[40px] px-3 font-mono text-[11px] border cut-corner-tag transition-colors ${
                  rankBy === o.key ? 'text-brand border-brand-line bg-brand-dim' : 'text-ink-dim border-line hover:text-ink'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === 'players' && (
        <div id="panel-players" role="tabpanel" aria-labelledby="tab-players">
          {rankedPlayers.length === 0 ? (
            <EmptyState>No data loaded.</EmptyState>
          ) : (
            <>
              <Podium
                items={rankedPlayers}
                render={{
                  avatar: (p) => <PlayerPortrait agent={p.best_agent} color="var(--color-brand)" size={88} />,
                  caption: (p) => (
                    <>
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="font-mono text-base text-brand tabular-nums">{playerValue(p)}</div>
                    </>
                  ),
                  color: (rank) => ['var(--color-mvp)', 'var(--color-team-b)', 'var(--color-brand)'][rank],
                }}
              />
              <ol className="grid md:grid-cols-2 gap-x-10">
                {rankedPlayers.slice(3).map((p, i) => (
                  <li key={p.name} className="rise-in flex items-center gap-3.5 py-3 border-t border-line-soft" style={{ animationDelay: `${i * 50}ms` }}>
                    <span className="font-mono text-xs text-ink-faint w-6 tabular-nums">{i + 4}</span>
                    <PlayerPortrait agent={p.best_agent} color="var(--color-ink-faint)" size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-ink-faint truncate">{p.team}</div>
                    </div>
                    <span className="font-mono text-sm text-ink-dim tabular-nums">{playerValue(p)}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}

      {tab === 'teams' && (
        <div id="panel-teams" role="tabpanel" aria-labelledby="tab-teams">
          {stats.team_performance.length === 0 ? (
            <EmptyState>No data loaded.</EmptyState>
          ) : (
            <>
              <Podium
                items={stats.team_performance}
                render={{
                  avatar: (t) => <TeamBadge name={t.name} accent="team-b" size={88} />,
                  caption: (t) => (
                    <>
                      <div className="text-sm font-semibold truncate">{t.name}</div>
                      <div className="font-mono text-base text-win tabular-nums">{(t.win_rate * 100).toFixed(0)}%</div>
                    </>
                  ),
                  color: (rank) => ['var(--color-mvp)', 'var(--color-team-b)', 'var(--color-brand)'][rank],
                }}
              />
              <ol className="grid md:grid-cols-2 gap-x-10">
                {stats.team_performance.slice(3).map((t, i) => (
                  <li key={t.team_id} className="rise-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <button
                      type="button"
                      onClick={() => onOpenTeam(t.team_id)}
                      className="group w-full flex items-center gap-3.5 py-3 border-t border-line-soft text-left hover:bg-panel-raised transition-colors"
                    >
                      <span className="font-mono text-xs text-ink-faint w-6 tabular-nums">{i + 4}</span>
                      <TeamBadge name={t.name} accent="team-b" size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{t.name}</div>
                        <div className="font-mono text-xs text-ink-faint">{t.wins}W / {t.matches - t.wins}L</div>
                      </div>
                      <span className="font-mono text-sm text-win tabular-nums">{(t.win_rate * 100).toFixed(0)}%</span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default function Home({ onOpenMatch, onOpenTeam, onNavigate, onOpenPalette }) {
  const [stats, setStats] = useState(null)
  const [matches, setMatches] = useState(null)
  const [highlights, setHighlights] = useState(null)
  const [meta, setMeta] = useState(null)
  const [rankBy, setRankBy] = useState('acs')
  const [activeSection, setActiveSection] = useState('latest')

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const { signal } = controller
    getOverview({ signal }).then((data) => {
      if (!cancelled) setStats(data)
    })
    getMeta({ signal }).then((data) => {
      if (!cancelled) setMeta(data)
    })
    listMatches({ limit: 30, signal }).then(async ({ matches }) => {
      if (cancelled) return
      setMatches(matches)
      const pool = matches.slice(0, 5)
      const verdicts = (await Promise.all(pool.map(async (m) => (await getMatchVerdict(m.match_id, { signal })).verdict))).filter(Boolean)
      if (!cancelled) setHighlights(verdicts)
    })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  // The index follows the section in the middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-35% 0px -55% 0px' }
    )
    document.querySelectorAll('[data-section]').forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [stats, matches])

  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Top 3 by impact, for the replay to cycle through. useMemo so MatchReplay's
  // effects (keyed on the pool's length and the current match's id) don't see
  // a new array identity, and thus a reset, on every unrelated re-render.
  const replayPool = useMemo(
    () => (highlights && highlights.length ? highlights.slice().sort((a, b) => b.ranked_factors[0].impact - a.ranked_factors[0].impact).slice(0, 3) : null),
    [highlights]
  )

  const notable = (highlights || [])
    .map((m) => {
      if (m.primary_factor.category !== 'Player Impact') return null
      const mvp = extractMvp(m.primary_factor.summary)
      if (!mvp) return null
      const roster = m.roster ? [...(m.roster.team_a || []), ...(m.roster.team_b || [])] : []
      const found = roster.find((p) => p.name === mvp.name)
      const color = mvp.team === m.team_a ? 'var(--color-brand)' : 'var(--color-team-b)'
      return { name: mvp.name, rating: found ? found.rating : null, agent: found ? found.best_agent : null, color, matchId: m.match_id, team: mvp.team }
    })
    .filter(Boolean)

  const topAgents = useMemo(() => {
    if (!meta) return null
    return (meta.agent_meta || [])
      .filter((a) => a.pick_rate > 0 && a.role !== 'Unknown')
      .sort((a, b) => b.pick_rate - a.pick_rate)
      .slice(0, 6)
  }, [meta])

  return (
    <div className="fade-up">
      {/* Hero: an open band with the radar as its visual. No boxes around it. */}
      <section className="relative grid lg:grid-cols-[minmax(0,1fr)_auto] gap-10 items-center pb-12 pt-4">
        <div className="min-w-0">
          <Label tone="brand" className="mb-6">VCT 2021 to 2026</Label>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.02] max-w-3xl">
            Every verdict, <span className="text-brand">backed by evidence.</span>
          </h1>
          <p className="text-ink-dim text-base max-w-xl leading-relaxed mt-6">
            Real pro-scene data and transparent statistics. Every ranked factor links to the round-by-round evidence behind it.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button variant="primary" onClick={onOpenPalette} className="min-h-[44px]">
              Search everything
              <kbd className="hidden sm:inline font-mono text-[10px] opacity-70 border border-current px-1 py-px">Ctrl K</kbd>
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('matches')} className="min-h-[44px]">Browse matches</Button>
          </div>
        </div>
        {stats?.map_stats?.length >= 3 ? (
          <div className="hidden lg:block">
            <MapRadar maps={stats.map_stats} size={380} />
          </div>
        ) : null}
      </section>

      {stats ? (
        <MetricStrip counts={stats.counts} />
      ) : (
        <Skeleton className="h-28" />
      )}

      <div className="sticky top-3 z-30 mt-6 mb-2">
        <SectionIndex active={activeSection} onJump={jumpTo} />
      </div>

      <section id="latest" data-section className="scroll-mt-28 mt-8 mb-14" aria-label="Latest series">
        <SeriesTicker matches={matches} onOpenMatch={onOpenMatch} />
      </section>

      {replayPool && replayPool.length > 0 && (
        <section className="mb-14">
          <MatchReplay pool={replayPool} onOpen={onOpenMatch} />
        </section>
      )}

      {stats && stats.season_journey?.length ? (
        <section id="season" data-section className="scroll-mt-28 mb-14">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Season journey, 2025</h2>
            <Label>Matches per phase, in season order</Label>
          </div>
          <SeasonColumns phases={stats.season_journey} />
        </section>
      ) : null}

      {stats?.map_stats?.length > 0 && (
        <section id="maps" data-section className="scroll-mt-28 mb-14">
          <MapAtlas maps={stats.map_stats} />
        </section>
      )}

      <div className="grid lg:grid-cols-12 gap-12 mb-14">
        <section id="meta" data-section className="scroll-mt-28 lg:col-span-8 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Meta snapshot</h2>
            <Label>Top agents by pick rate across the loaded maps</Label>
          </div>
          <MetaTiles agents={topAgents} />
        </section>
        {notable.length > 0 && (
          <section className="lg:col-span-4 min-w-0">
            <div className="mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold">Notable performances</h2>
              <Label className="mt-2">Player of the match in recent verdicts</Label>
            </div>
            <NotableRow notable={notable} onOpen={onOpenMatch} />
          </section>
        )}
      </div>

      {stats && <Leaderboards stats={stats} rankBy={rankBy} onRankBy={setRankBy} onOpenTeam={onOpenTeam} />}
    </div>
  )
}
