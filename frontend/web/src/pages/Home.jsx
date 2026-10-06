import { useEffect, useMemo, useState } from 'react'
import { getOverview, listMatches, getMatchVerdict } from '../lib/api'
import { extractMvp, impactColor, matchScoreStr } from '../lib/format'
import { PlayersIcon, TeamsIcon, MatchesIcon, FlameIcon, VersusIcon } from '../components/icons'
import { Panel, Label, SectionHeader, Tag, EmptyState, Skeleton } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import PlayerPortrait from '../components/PlayerPortrait'
import MapImage from '../components/MapImage'
import { useCountUp } from '../lib/hooks'

const STAT_CELLS = [
  { key: 'players', label: 'Players', Icon: PlayersIcon },
  { key: 'teams', label: 'Teams', Icon: TeamsIcon },
  { key: 'matches', label: 'Matches', Icon: MatchesIcon },
  { key: 'events', label: 'Events', Icon: FlameIcon },
]

const RANK_OPTIONS = [
  { key: 'acs', label: 'ACS' },
  { key: 'rating', label: 'Rating' },
  { key: 'maps', label: 'Maps played' },
]

function StatCell({ label, Icon, value, delay = 0 }) {
  const animated = useCountUp(value, 1500)
  return (
    <div className="group lift rise-in cut-corner-sm bg-panel border border-line p-5 flex flex-col justify-between min-h-[120px] hover:border-brand/40" style={{ animationDelay: `${delay}ms` }}>
      <span className="text-brand transition-transform group-hover:-translate-y-0.5"><Icon size={18} /></span>
      <div>
        <div className="font-display text-3xl font-bold tabular-nums leading-none">
          {Math.round(animated).toLocaleString()}
        </div>
        <Label className="mt-2">{label}</Label>
      </div>
    </div>
  )
}

// A ring that fills to the spotlight verdict's real impact score (0 to 1).
function ImpactRing({ value, color }) {
  const animated = useCountUp(value * 100, 1600)
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - animated / 100)
  return (
    <div className="relative w-16 h-16 shrink-0" role="img" aria-label={`Impact ${Math.round(value * 100)} out of 100`}>
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold tabular-nums">
        {Math.round(animated)}
      </span>
    </div>
  )
}

// Hero radar: each spoke is one of the six most-picked maps, and the filled
// shape is each map's real pick count, scaled to the busiest map. The sweep
// is decorative; the shape and labels carry the data.
function MapRadar({ maps, size = 280 }) {
  const c = size / 2
  const r = size / 2 - 42
  const n = maps.length
  const max = Math.max(...maps.map((m) => m.played), 1)
  const total = maps.reduce((sum, m) => sum + m.played, 0)
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const point = (i, f) => [c + r * f * Math.cos(angle(i)), c + r * f * Math.sin(angle(i))]
  const shape = maps.map((m, i) => point(i, m.played / max).join(',')).join(' ')
  const rings = [0.25, 0.5, 0.75, 1]
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label="Map pick share radar for the six most-picked maps">
      <div
        className="radar-sweep pointer-events-none absolute inset-0 rounded-full opacity-30"
        style={{ background: 'conic-gradient(from 0deg, transparent 0deg, var(--color-brand) 40deg, transparent 58deg)' }}
        aria-hidden="true"
      />
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
        {rings.map((f) => (
          <polygon
            key={f}
            points={Array.from({ length: n }, (_, i) => point(i, f).join(',')).join(' ')}
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="1"
          />
        ))}
        {maps.map((_, i) => {
          const [x, y] = point(i, 1)
          return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--color-line)" strokeWidth="1" />
        })}
        <g className="poly-in">
          <polygon points={shape} fill="var(--color-brand)" fillOpacity="0.18" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" />
          {maps.map((m, i) => {
            const [x, y] = point(i, m.played / max)
            return <circle key={m.map} cx={x} cy={y} r="3.5" fill="var(--color-brand)" />
          })}
        </g>
      </svg>
      {maps.map((m, i) => {
        const [x, y] = point(i, 1.22)
        const share = total ? ((m.played / total) * 100).toFixed(0) : '0'
        return (
          <div
            key={m.map}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap pointer-events-none"
            style={{ left: x, top: y }}
          >
            <div className="font-mono text-[10px] uppercase tracking-wide text-ink-dim">{m.map}</div>
            <div className="font-mono text-[11px] font-semibold text-ink tabular-nums">{share}%</div>
          </div>
        )
      })}
    </div>
  )
}

// Stacked win and loss split, drawn from the real win and match counts.
function WinLossBar({ wins, matches }) {
  const winShare = matches ? (wins / matches) * 100 : 0
  return (
    <div className="flex h-1.5 w-full overflow-hidden bg-line-soft mt-2" aria-hidden="true">
      <div className="grow-x h-full bg-win" style={{ width: `${winShare}%`, animationDelay: '500ms' }} />
      <div className="h-full bg-brand/60" style={{ width: `${100 - winShare}%` }} />
    </div>
  )
}

export default function Home({ onOpenMatch, onOpenTeam }) {
  const [stats, setStats] = useState(null)
  const [highlights, setHighlights] = useState(null)
  const [rankBy, setRankBy] = useState('acs')
  const [activePhase, setActivePhase] = useState(null)

  useEffect(() => {
    let cancelled = false
    getOverview().then((data) => {
      if (!cancelled) setStats(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { matches } = await listMatches({ limit: 30 })
      const pool = matches.slice(0, 5)
      const verdicts = (
        await Promise.all(
          pool.map(async (m) => {
            const { verdict } = await getMatchVerdict(m.match_id)
            return verdict
          })
        )
      ).filter(Boolean)
      if (!cancelled) setHighlights(verdicts)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const spotlight = highlights && highlights.length
    ? highlights.slice().sort((a, b) => b.ranked_factors[0].impact - a.ranked_factors[0].impact)[0]
    : null

  const notable = (highlights || [])
    .map((m) => {
      if (m.primary_factor.category !== 'Player Impact') return null
      const mvp = extractMvp(m.primary_factor.summary)
      if (!mvp) return null
      const roster = m.roster ? [...(m.roster.team_a || []), ...(m.roster.team_b || [])] : []
      const found = roster.find((p) => p.name === mvp.name)
      const color = mvp.team === m.team_a ? 'var(--color-brand)' : 'var(--color-team-b)'
      return {
        name: mvp.name,
        rating: found ? found.rating : null,
        agent: found ? found.best_agent : null,
        color,
        matchId: m.match_id,
        team: mvp.team,
      }
    })
    .filter(Boolean)

  const journeyTotal = useMemo(
    () => (stats?.season_journey || []).reduce((sum, p) => sum + p.matches, 0),
    [stats]
  )
  const journeyMax = useMemo(
    () => (stats?.season_journey?.length ? Math.max(...stats.season_journey.map((p) => p.matches)) : 0),
    [stats]
  )
  const mapTotal = useMemo(
    () => (stats?.map_stats || []).reduce((sum, m) => sum + m.played, 0),
    [stats]
  )
  const rankedPlayers = useMemo(() => {
    if (!stats) return []
    const list = [...stats.top_players]
    if (rankBy === 'rating') list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    if (rankBy === 'maps') list.sort((a, b) => b.maps - a.maps)
    return list
  }, [stats, rankBy])

  const activeRow = activePhase && stats
    ? stats.season_journey.find((p) => p.phase === activePhase)
    : null

  return (
    <div className="fade-up grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
      <section className="lg:col-span-8 relative overflow-hidden cut-corner border border-line bg-panel px-7 md:px-10 py-10 min-h-[300px] rise-in">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand" aria-hidden="true" />
        <div className="relative grid md:grid-cols-[minmax(0,1fr)_auto] gap-8 items-center h-full">
          <div className="flex flex-col justify-between gap-6 min-w-0">
            <div>
              <Label tone="brand" className="mb-5">VCT 2021 to 2026, all seasons loaded</Label>
              <h1 className="font-display text-4xl md:text-[2.75rem] font-bold leading-[1.08]">
                Every verdict, <span className="text-brand">backed by evidence.</span>
              </h1>
            </div>
            <p className="text-ink-dim text-sm md:text-base max-w-sm leading-relaxed">
              Real pro-scene data and transparent statistics. No black-box model and no invented predictions. Each
              ranked factor links to the round-by-round evidence behind it.
            </p>
          </div>
          {stats?.map_stats?.length >= 3 ? (
            <div className="hidden md:block">
              <MapRadar maps={stats.map_stats.slice(0, 6)} size={236} />
            </div>
          ) : null}
        </div>
      </section>

      <div className="lg:col-span-4 grid grid-cols-2 gap-4 lg:gap-5">
        {stats
          ? STAT_CELLS.map(({ key, label, Icon }, idx) => (
              <StatCell key={key} label={label} Icon={Icon} value={stats.counts[key]} delay={idx * 90} />
            ))
          : [0, 1, 2, 3].map((i) => <Skeleton key={i} className="min-h-[120px] cut-corner-sm" />)}
      </div>

      {stats && stats.season_journey?.length ? (
        <Panel className="lg:col-span-7 lg:row-span-2 p-6 flex flex-col rise-in" style={{ animationDelay: '180ms' }}>
          <SectionHeader>Season journey, 2025</SectionHeader>
          <Label className="mb-6">Matches per phase, in season order</Label>
          <ol className="flex flex-1 flex-col justify-between gap-3">
            {stats.season_journey.map((p) => {
              const active = activePhase === p.phase
              return (
                <li
                  key={p.phase}
                  tabIndex={0}
                  onMouseEnter={() => setActivePhase(p.phase)}
                  onMouseLeave={() => setActivePhase(null)}
                  onFocus={() => setActivePhase(p.phase)}
                  onBlur={() => setActivePhase(null)}
                  className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 cursor-default focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span className={`text-sm font-semibold truncate transition-colors ${active ? 'text-brand' : ''}`}>{p.phase}</span>
                  <div className="h-2.5 bg-line-soft overflow-hidden">
                    <div
                      className={`grow-x h-full transition-[background-color] duration-300 ${active ? 'bg-brand' : 'bg-brand/70'}`}
                      style={{ width: `${(p.matches / journeyMax) * 100}%`, animationDelay: `${300 + stats.season_journey.indexOf(p) * 90}ms` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-ink-dim text-right tabular-nums">{p.matches}</span>
                </li>
              )
            })}
          </ol>
          <p className="mt-5 min-h-[1.25rem] font-mono text-xs text-ink-faint" aria-live="polite">
            {activeRow
              ? `${activeRow.phase}: ${((activeRow.matches / journeyTotal) * 100).toFixed(1)}% of the season's matches`
              : 'Hover or focus a phase to see its share of the season.'}
          </p>
        </Panel>
      ) : null}

      {spotlight && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenMatch(spotlight.match_id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpenMatch(spotlight.match_id)
            }
          }}
          className="lg:col-span-5 group cursor-pointer"
        >
          <Panel accent="var(--color-brand)" className="p-6 h-full flex flex-col rise-in lift transition-colors group-hover:bg-panel-raised" style={{ animationDelay: '240ms' }}>
            <div className="flex items-center justify-between gap-3 mb-5">
              <Tag tone="brand"><FlameIcon size={11} /> Spotlight match</Tag>
              <span className="font-mono text-xs text-ink-faint group-hover:text-brand transition-colors">Open verdict</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="font-display text-lg font-bold flex items-center gap-2 min-w-0">
                <span className="truncate">{spotlight.team_a}</span>
                <VersusIcon className="text-ink-faint shrink-0" />
                <span className="truncate">{spotlight.team_b}</span>
              </div>
              <div className="font-mono text-2xl font-semibold tabular-nums shrink-0">{matchScoreStr(spotlight)}</div>
            </div>
            <div className="flex items-center gap-4 mt-5">
              <ImpactRing
                value={spotlight.ranked_factors[0].impact}
                color={impactColor(spotlight.primary_factor.winner || spotlight.winner, spotlight.team_a)}
              />
              <p className="text-sm text-ink-dim leading-relaxed">{spotlight.primary_factor.summary}</p>
            </div>
            <div
              className="mt-auto pt-4 text-xs font-mono"
              style={{ color: impactColor(spotlight.primary_factor.winner || spotlight.winner, spotlight.team_a) }}
            >
              {spotlight.primary_factor.category}: {spotlight.primary_factor.impact_label.toLowerCase()}
            </div>
          </Panel>
        </div>
      )}

      {notable.length > 0 && (
        <Panel className="lg:col-span-5 p-6 rise-in" style={{ animationDelay: '300ms' }}>
          <SectionHeader>Notable performances</SectionHeader>
          <Label className="mb-5">Player of the match in recent verdicts</Label>
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-1">
            {notable.map((n) => (
              <button
                key={n.matchId}
                onClick={() => onOpenMatch(n.matchId)}
                className="group flex flex-col items-center gap-2 shrink-0 w-24 text-center"
              >
                <span className="transition-transform group-hover:-translate-y-1">
                  <PlayerPortrait agent={n.agent} color={n.color} size={60} />
                </span>
                <div className="text-xs font-semibold truncate w-full">{n.name}</div>
                {n.rating != null && <div className="font-mono text-[11px] text-ink-dim">{n.rating.toFixed(2)} rtg</div>}
                <div className="text-[11px] text-ink-faint truncate w-full">{n.team}</div>
              </button>
            ))}
          </div>
        </Panel>
      )}

      {stats && (
        <>
          <Panel className="lg:col-span-6 p-6 rise-in" style={{ animationDelay: '360ms' }}>
            <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
              <SectionHeader>Top players</SectionHeader>
              <div role="group" aria-label="Rank players by" className="flex gap-1 shrink-0">
                {RANK_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    aria-pressed={rankBy === o.key}
                    onClick={() => setRankBy(o.key)}
                    className={`px-2.5 py-1 font-mono text-[11px] border cut-corner-tag transition-colors ${
                      rankBy === o.key ? 'text-brand border-brand-line bg-brand-dim' : 'text-ink-dim border-line hover:text-ink'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <Label className="mb-4">Ranked by {RANK_OPTIONS.find((o) => o.key === rankBy).label.toLowerCase()}</Label>
            {rankedPlayers.length === 0 && <EmptyState>No data loaded.</EmptyState>}
            <ol className="flex flex-col">
              {rankedPlayers.map((p, i) => {
                const value = rankBy === 'rating' ? p.rating : rankBy === 'maps' ? p.maps : p.acs
                return (
                  <li key={p.name} className="group flex items-center gap-3.5 py-2.5 border-t border-line-soft first:border-t-0">
                    <span className="font-mono text-xs text-ink-faint w-6 tabular-nums">{i + 1}</span>
                    <span className="transition-transform group-hover:scale-105">
                      <PlayerPortrait agent={p.best_agent} color="var(--color-brand)" size={40} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-ink-faint truncate">{p.team}</div>
                    </div>
                    <span className="font-mono text-sm text-brand tabular-nums">{value}</span>
                  </li>
                )
              })}
            </ol>
          </Panel>

          <Panel className="lg:col-span-6 p-6 rise-in" style={{ animationDelay: '420ms' }}>
            <SectionHeader>Team performance</SectionHeader>
            <Label className="mb-4">Ranked by all-time win rate</Label>
            {stats.team_performance.length === 0 && <EmptyState>No data loaded.</EmptyState>}
            <ol className="flex flex-col">
              {stats.team_performance.map((t, i) => (
                <li key={t.team_id}>
                  <button
                    type="button"
                    onClick={() => onOpenTeam(t.team_id)}
                    className="group w-full flex items-center gap-3.5 py-2.5 border-t border-line-soft first:border-t-0 text-left hover:bg-panel-raised transition-colors"
                  >
                    <span className="font-mono text-xs text-ink-faint w-6 tabular-nums">{i + 1}</span>
                    <TeamBadge name={t.name} accent="team-b" size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{t.name}</div>
                      <div className="font-mono text-xs text-ink-faint">{t.wins}W / {t.matches - t.wins}L</div>
                      <WinLossBar wins={t.wins} matches={t.matches} />
                    </div>
                    <span className="font-mono text-sm text-win tabular-nums">{(t.win_rate * 100).toFixed(0)}%</span>
                  </button>
                </li>
              ))}
            </ol>
          </Panel>

          {stats.map_stats?.length > 0 && (
            <section className="lg:col-span-12">
              <SectionHeader>Map pick counts</SectionHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map_stats.slice(0, 6).map((m) => {
                  const share = mapTotal ? (m.played / mapTotal) * 100 : 0
                  return (
                    <div key={m.map} className="group cut-corner-sm bg-panel border border-line overflow-hidden">
                      <div className="relative overflow-hidden">
                        <MapImage map={m.map} className="w-full h-28 transition-transform duration-500 group-hover:scale-[1.04]" />
                        <span className="absolute bottom-0 left-0 h-1 bg-brand transition-[width] duration-700" style={{ width: `${share}%` }} />
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-semibold">{m.map}</div>
                        <div className="font-mono text-xs text-ink-faint mt-0.5 tabular-nums">
                          {m.played} played, {share.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
