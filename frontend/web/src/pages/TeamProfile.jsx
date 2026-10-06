import { useEffect, useMemo, useState } from 'react'
import { getTeamProfile, getTeamMapLeaders, getTeamRadar, listTeams } from '../lib/api'
import { roleOf } from '../lib/roles'
import { useCountUp } from '../lib/hooks'
import { VersusIcon } from '../components/icons'
import { Panel, Label, SectionHeader, ImpactBar, RoleChip, Select, Button, LoadingState, EmptyState, Skeleton } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import TeamWatermark from '../components/TeamWatermark'
import PlayerStatRow from '../components/PlayerStatRow'
import WinRateRing from '../components/WinRateRing'
import MapImage from '../components/MapImage'
import RadarChart from '../components/RadarChart'

const FORM_LENGTH = 5
const MAP_SORTS = [
  { key: 'played', label: 'Most played' },
  { key: 'rate', label: 'Win rate' },
]
// A map needs this many played before it can be called the strongest or weakest.
const MIN_MAPS_FOR_CALLOUT = 5

// Did this team win a recent match? The score is "a-b" and the team is either
// side, so the result is read from whichever side matches the profile name.
// Returns null when the names do not line up, rather than guessing.
function resultFor(match, teamName) {
  const [a, b] = String(match.score).split('-').map(Number)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  if (match.team_a === teamName) return a > b ? 'W' : a < b ? 'L' : 'D'
  if (match.team_b === teamName) return b > a ? 'W' : b < a ? 'L' : 'D'
  return null
}

// Each opponent in the recent matches, with this team's record against them.
// Sorted by how often they were played, then by name.
function opponentsOf(matches, teamName) {
  const byName = new Map()
  for (const m of matches) {
    const opponent = m.team_a === teamName ? m.team_b : m.team_b === teamName ? m.team_a : null
    if (!opponent) continue
    const entry = byName.get(opponent) ?? { name: opponent, w: 0, l: 0, d: 0, latest: m }
    const r = resultFor(m, teamName)
    if (r === 'W') entry.w += 1
    else if (r === 'L') entry.l += 1
    else if (r === 'D') entry.d += 1
    byName.set(opponent, entry)
  }
  return [...byName.values()].sort((a, b) => b.w + b.l + b.d - (a.w + a.l + a.d) || a.name.localeCompare(b.name))
}

// The last few results as a row of pills, newest first.
function FormStrip({ matches, teamName }) {
  const results = matches.slice(0, FORM_LENGTH).map((m) => ({ id: m.match_id, r: resultFor(m, teamName) }))
  if (results.length === 0) return null
  return (
    <div className="flex items-center gap-2" role="list" aria-label={`Last ${results.length} results, newest first`}>
      {results.map(({ id, r }, i) => {
        const tone =
          r === 'W' ? 'bg-win/15 text-win border-win/40' : r === 'L' ? 'bg-brand-dim text-brand border-brand-line' : 'bg-line-soft text-ink-dim border-line'
        return (
          <span
            key={id}
            role="listitem"
            className={`rise-in inline-flex items-center justify-center w-8 h-8 font-mono text-xs font-semibold border cut-corner-tag ${tone}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="sr-only">{r === 'W' ? 'Win' : r === 'L' ? 'Loss' : 'Unknown'}</span>
            <span aria-hidden="true">{r ?? '-'}</span>
          </span>
        )
      })}
    </div>
  )
}

// Roster years as a timeline. Clicking a tick or stepping with the arrow keys
// picks the lineup; "All time" is the first tick and clears the year.
function EraTrack({ years, value, onChange }) {
  const items = [{ key: null, label: 'All time' }, ...[...years].sort((a, b) => a - b).map((y) => ({ key: y, label: String(y) }))]
  const index = Math.max(0, items.findIndex((i) => i.key === value))
  const active = items[index]

  function onKeyDown(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next = e.key === 'ArrowRight' ? Math.min(index + 1, items.length - 1) : Math.max(index - 1, 0)
    onChange(items[next].key)
    e.currentTarget.querySelectorAll('button')[next]?.focus()
  }

  return (
    <div>
      <div role="group" aria-label="Choose roster year" onKeyDown={onKeyDown} className="relative flex justify-between gap-1 pt-2 overflow-x-auto no-scrollbar">
        <div className="absolute left-4 right-4 top-[1.1rem] h-px bg-line" aria-hidden="true" />
        <div
          className="absolute left-4 top-[1.1rem] h-px bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `calc((100% - 2rem) * ${items.length > 1 ? index / (items.length - 1) : 0})` }}
          aria-hidden="true"
        />
        {items.map((it, i) => {
          const on = i === index
          return (
            <button
              key={it.label}
              type="button"
              aria-pressed={on}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(it.key)}
              className="relative z-10 flex flex-col items-center gap-2 min-h-[40px] min-w-[3.25rem] px-1 font-mono text-[11px] transition-colors"
              style={{ color: on ? 'var(--color-brand)' : undefined }}
            >
              <span
                className={`block w-2.5 h-2.5 rotate-45 transition-colors ${on ? 'bg-brand' : 'bg-line'}`}
                style={on ? { boxShadow: '0 0 10px var(--color-brand-line)' } : undefined}
                aria-hidden="true"
              />
              <span className={on ? '' : 'text-ink-faint hover:text-ink'}>{it.label}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 font-mono text-xs text-ink-faint" aria-live="polite">
        {active.key == null ? 'Showing the all-time roster across every loaded season.' : `Showing the ${active.label} lineup.`}
      </p>
    </div>
  )
}

// Best and worst maps by win rate, among maps with enough games to mean something.
function MapCallouts({ maps }) {
  const eligible = maps.filter((m) => m.maps_played >= MIN_MAPS_FOR_CALLOUT)
  if (eligible.length < 2) return null
  const sorted = [...eligible].sort((a, b) => (b.map_win_rate || 0) - (a.map_win_rate || 0))
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  const cells = [
    { label: 'Strongest map', m: best, tone: 'var(--color-win)' },
    { label: 'Weakest map', m: worst, tone: 'var(--color-brand)' },
  ]
  return (
    <div className="grid sm:grid-cols-2 gap-3 mb-5">
      {cells.map(({ label, m, tone }, i) => (
        <div key={label} className="rise-in cut-corner-tag bg-panel-raised border border-line px-4 py-3 flex items-center gap-3" style={{ animationDelay: `${i * 90}ms` }}>
          <MapImage map={m.map} className="w-10 h-10 shrink-0 cut-corner-tag" />
          <div className="min-w-0">
            <Label className="mb-1">{label}</Label>
            <div className="text-sm font-semibold truncate">{m.map}</div>
            <div className="font-mono text-xs tabular-nums" style={{ color: tone }}>
              {((m.map_win_rate || 0) * 100).toFixed(0)}% over {m.maps_played} maps
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function OpponentGrid({ opponents, onOpenMatch }) {
  if (opponents.length === 0) return null
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {opponents.map((o, i) => {
        const played = o.w + o.l + o.d
        const winShare = played ? (o.w / played) * 100 : 0
        return (
          <li key={o.name} className="rise-in" style={{ animationDelay: `${i * 60}ms` }}>
            <button
              type="button"
              onClick={() => onOpenMatch(o.latest.match_id)}
              className="lift group w-full cut-corner-tag bg-panel border border-line hover:border-brand/40 px-4 py-3.5 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold truncate group-hover:text-brand transition-colors">{o.name}</span>
                <span className="font-mono text-xs tabular-nums shrink-0">
                  <span className="text-win">{o.w}W</span> <span className="text-brand">{o.l}L</span>
                  {o.d > 0 && <span className="text-ink-dim"> {o.d}D</span>}
                </span>
              </div>
              <div className="flex h-1.5 mt-3 overflow-hidden bg-line-soft" aria-hidden="true">
                <div className="grow-x h-full bg-win" style={{ width: `${winShare}%`, animationDelay: `${i * 60 + 200}ms` }} />
                <div className="h-full bg-brand/60" style={{ width: `${100 - winShare}%` }} />
              </div>
              <div className="font-mono text-[11px] text-ink-faint mt-2">Open the latest meeting</div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function MapLeadersPanel({ teamId, mapName }) {
  const [leaders, setLeaders] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLeaders(null)
    getTeamMapLeaders(teamId, mapName).then((data) => {
      if (!cancelled) setLeaders(data)
    })
    return () => {
      cancelled = true
    }
  }, [teamId, mapName])

  if (leaders === null) return <Skeleton className="h-16 mt-3" />
  if (!leaders || (!leaders.most_kills && !leaders.most_assists && !leaders.most_effective)) {
    return <p className="text-xs text-ink-faint font-mono py-3">Not enough loaded data on {mapName} for this team.</p>
  }

  const cells = [
    { label: 'Most kills', entry: leaders.most_kills, suffix: 'kills' },
    { label: 'Most assists', entry: leaders.most_assists, suffix: 'assists' },
    { label: 'Most effective', entry: leaders.most_effective, suffix: 'avg rating' },
  ]

  return (
    <div className="pt-3 pb-1">
      <div className="grid sm:grid-cols-3 gap-3">
        {cells.map(({ label, entry, suffix }, i) => (
          <div key={label} className="rise-in lift cut-corner-tag bg-panel-raised border border-line px-4 py-3" style={{ animationDelay: `${i * 80}ms` }}>
            <Label className="mb-1.5">{label}</Label>
            {entry ? (
              <>
                <div className="text-sm font-semibold truncate">{entry.name}</div>
                <div className="font-mono text-xs text-brand tabular-nums">{entry.value} {suffix}</div>
              </>
            ) : (
              <div className="text-xs text-ink-faint">No data</div>
            )}
          </div>
        ))}
      </div>
      {leaders.small_sample && <p className="text-xs text-ink-faint mt-2">Small sample on this map. Shown anyway, but not a reliable read.</p>}
    </div>
  )
}

export default function TeamProfile({ teamId, onOpenMatch }) {
  const [p, setP] = useState(null)
  const [year, setYear] = useState(null)
  const [expandedMap, setExpandedMap] = useState(null)
  const [mapSort, setMapSort] = useState('played')
  const [compareOptions, setCompareOptions] = useState(null)
  const [compareWith, setCompareWith] = useState(null)
  const [radar, setRadar] = useState(undefined) // undefined = loading, null = failed
  const [radarRetry, setRadarRetry] = useState(0)

  // TeamProfile is not remounted between teams (App.jsx sets no key), so the
  // team-scoped UI state is reset during render when the team changes.
  const [trackedTeamId, setTrackedTeamId] = useState(teamId)
  if (teamId !== trackedTeamId) {
    setTrackedTeamId(teamId)
    setYear(null)
    setExpandedMap(null)
    setCompareWith(null)
  }

  useEffect(() => {
    let cancelled = false
    setP(null)
    getTeamProfile(teamId, { year }).then(({ profile }) => {
      if (!cancelled) setP(profile)
    })
    return () => {
      cancelled = true
    }
  }, [teamId, year])

  useEffect(() => {
    let cancelled = false
    listTeams({ tier: 'tier1' }).then(({ teams }) => {
      if (!cancelled) setCompareOptions((teams || []).filter((t) => t.team_id !== teamId))
    })
    return () => {
      cancelled = true
    }
  }, [teamId])

  useEffect(() => {
    let cancelled = false
    setRadar(undefined)
    getTeamRadar(teamId, compareWith).then((data) => {
      if (!cancelled) setRadar(data)
    })
    return () => {
      cancelled = true
    }
  }, [teamId, compareWith, radarRetry])

  const sortedMaps = useMemo(() => {
    if (!p) return []
    const list = [...p.map_stats]
    if (mapSort === 'rate') list.sort((a, b) => (b.map_win_rate || 0) - (a.map_win_rate || 0))
    else list.sort((a, b) => b.maps_played - a.maps_played)
    return list
  }, [p, mapSort])

  const opponents = useMemo(() => (p ? opponentsOf(p.recent_matches, p.name) : []), [p])
  const agentTotal = useMemo(() => (p ? p.agent_usage.reduce((sum, a) => sum + a.games_used, 0) : 0), [p])
  const winsCount = useCountUp(p ? p.record.wins : null, 1000)
  const lossesCount = useCountUp(p ? p.record.losses : null, 1000)
  const matchesCount = useCountUp(p ? p.record.matches : null, 1000)

  if (p === null) return <LoadingState>Loading team profile</LoadingState>
  if (!p) return <EmptyState>Could not load this team. The backend is unreachable and no bundled profile exists for it.</EmptyState>

  return (
    <div className="fade-up">
      <section className="relative overflow-hidden cut-corner border border-line bg-panel px-6 md:px-9 py-8 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand" aria-hidden="true" />
        <TeamWatermark name={p.name} size={460} className="-right-32 top-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <TeamBadge name={p.name} accent="brand" size={84} />
            <div className="min-w-0">
              <Label tone="brand" className="mb-2">Team profile{p.roster_year ? `, ${p.roster_year}` : ''}</Label>
              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{p.name}</h1>
              <dl className="flex flex-wrap gap-x-7 gap-y-3 mt-4">
                <div>
                  <dt><Label>Wins</Label></dt>
                  <dd className="font-display text-2xl font-bold tabular-nums text-win mt-1">{Math.round(winsCount)}</dd>
                </div>
                <div>
                  <dt><Label>Losses</Label></dt>
                  <dd className="font-display text-2xl font-bold tabular-nums text-brand mt-1">{Math.round(lossesCount)}</dd>
                </div>
                <div>
                  <dt><Label>Matches</Label></dt>
                  <dd className="font-display text-2xl font-bold tabular-nums mt-1">{Math.round(matchesCount)}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="flex items-center gap-8 shrink-0">
            {p.recent_matches.length > 0 && (
              <div>
                <Label className="mb-2">Form</Label>
                <FormStrip matches={p.recent_matches} teamName={p.name} />
              </div>
            )}
            <div className="text-center">
              <WinRateRing winRate={p.win_rate} size={92} />
              <Label className="mt-2">Win rate</Label>
            </div>
          </div>
        </div>
      </section>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <div className="space-y-6 min-w-0">
          <Panel className="p-6 rise-in" style={{ animationDelay: '120ms' }}>
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <SectionHeader className="mb-0">Map pool</SectionHeader>
              <div role="group" aria-label="Sort maps" className="flex gap-1 p-1 bg-panel-raised border border-line cut-corner-tag">
                {MAP_SORTS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={mapSort === s.key}
                    onClick={() => setMapSort(s.key)}
                    className={`min-h-[36px] px-3 font-mono text-[11px] cut-corner-tag transition-colors ${
                      mapSort === s.key ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <MapCallouts maps={p.map_stats} />
            <ul className="flex flex-col">
              {sortedMaps.map((m, i) => {
                const isOpen = expandedMap === m.map
                const rate = (m.map_win_rate || 0) * 100
                return (
                  <li key={m.map} className="rise-in border-t border-line-soft first:border-t-0" style={{ animationDelay: `${180 + i * 60}ms` }}>
                    <button
                      type="button"
                      onClick={() => setExpandedMap(isOpen ? null : m.map)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center gap-3 py-3 text-left hover:bg-panel-raised transition-colors px-1"
                    >
                      <MapImage map={m.map} className="w-11 h-11 shrink-0" />
                      <span className="text-sm font-semibold w-20 shrink-0">{m.map}</span>
                      <div className="flex-1 min-w-0"><ImpactBar pct={rate} color={rate >= 50 ? 'var(--color-win)' : 'var(--color-brand)'} /></div>
                      <span className="font-mono text-xs text-ink-dim w-28 text-right shrink-0 tabular-nums">
                        {m.maps_won} of {m.maps_played} ({rate.toFixed(0)}%)
                      </span>
                      <span className="font-mono text-ink-faint text-xs transition-transform duration-200 shrink-0" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }} aria-hidden="true">
                        ▸
                      </span>
                    </button>
                    {isOpen && <div className="px-1 pb-4"><MapLeadersPanel teamId={teamId} mapName={m.map} /></div>}
                  </li>
                )
              })}
            </ul>
          </Panel>

          <Panel className="p-6 rise-in" style={{ animationDelay: '240ms' }}>
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <SectionHeader className="mb-0">{p.roster_year ? `${p.roster_year} roster` : 'All-time roster'}</SectionHeader>
            </div>
            {p.roster_years && p.roster_years.length > 1 && (
              <div className="mb-6">
                <EraTrack years={p.roster_years} value={year} onChange={setYear} />
              </div>
            )}
            {p.top_players.length === 0 && <EmptyState>No roster data for that year.</EmptyState>}
            <div className="flex flex-col">
              {p.top_players.map((pl, i) => (
                <div key={pl.name} className="rise-in" style={{ animationDelay: `${300 + i * 60}ms` }}>
                  <PlayerStatRow pl={pl} color="var(--color-brand)" />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6 min-w-0">
          <Panel className="p-6 rise-in" style={{ animationDelay: '160ms' }}>
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <SectionHeader className="mb-0">Stat profile</SectionHeader>
              {compareOptions && compareOptions.length > 0 && (
                <Select
                  value={compareWith ? String(compareWith) : null}
                  onChange={(v) => setCompareWith(v ? Number(v) : null)}
                  placeholder="Compare with a team"
                  options={compareOptions.map((t) => ({ value: String(t.team_id), label: t.name }))}
                />
              )}
            </div>
            {radar === undefined && <Skeleton className="h-[320px]" />}
            {radar && radar.a && (
              <div className="flex justify-center">
                <RadarChart a={radar.a} b={radar.b} />
              </div>
            )}
            {radar === null && (
              <div className="py-8 text-center">
                <p className="text-sm text-ink-dim mb-3">Could not load the stat profile. The backend may be slow to respond.</p>
                <Button variant="secondary" onClick={() => setRadarRetry((n) => n + 1)}>Retry</Button>
              </div>
            )}
          </Panel>

          <Panel className="p-6 rise-in" style={{ animationDelay: '280ms' }}>
            <div className="flex items-center justify-between gap-3 mb-5">
              <SectionHeader className="mb-0">Agent usage</SectionHeader>
              <Label>Share of games</Label>
            </div>
            <ul className="flex flex-col gap-3">
              {p.agent_usage.map((a, i) => {
                const share = agentTotal ? (a.games_used / agentTotal) * 100 : 0
                return (
                  <li key={a.agent} className="rise-in" style={{ animationDelay: `${320 + i * 50}ms` }}>
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <RoleChip role={roleOf(a.agent)} label={a.agent} />
                      <span className="font-mono text-xs text-ink-dim tabular-nums">
                        {a.games_used} games, {share.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1 bg-line-soft overflow-hidden" aria-hidden="true">
                      <div className="grow-x h-full bg-brand" style={{ width: `${share}%`, animationDelay: `${360 + i * 50}ms` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </Panel>
        </div>
      </div>

      {opponents.length > 0 && (
        <section className="mt-8">
          <SectionHeader>Opponents in recent matches</SectionHeader>
          <Label className="mb-5">Record against each opponent, from the matches listed below</Label>
          <OpponentGrid opponents={opponents} onOpenMatch={onOpenMatch} />
        </section>
      )}

      <section className="mt-8">
        <SectionHeader>Recent matches</SectionHeader>
        <div className="flex flex-col gap-2.5">
          {p.recent_matches.map((m, i) => {
            const result = resultFor(m, p.name)
            return (
              <button
                key={m.match_id}
                type="button"
                onClick={() => onOpenMatch(m.match_id)}
                className="lift rise-in group cut-corner-tag bg-panel border border-line hover:border-brand/40 hover:bg-panel-raised px-5 py-4 text-left transition-colors"
                style={{ animationDelay: `${400 + i * 50}ms` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate flex items-center gap-2">
                      {m.team_a} <VersusIcon className="text-ink-faint shrink-0" /> {m.team_b}
                    </div>
                    <div className="text-xs text-ink-faint mt-1 truncate">{m.tournament}, {m.match_type}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {result && (
                      <span
                        className={`inline-flex items-center px-2 py-1 border font-mono text-[11px] font-semibold uppercase tracking-wide cut-corner-tag ${
                          result === 'W' ? 'text-win border-win/40 bg-win/10' : result === 'L' ? 'text-brand border-brand-line bg-brand-dim' : 'text-ink-dim border-line'
                        }`}
                      >
                        {result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
                      </span>
                    )}
                    <div className="font-mono text-base font-semibold tabular-nums">{m.score}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {p.note && <p className="text-xs text-ink-faint mt-4">{p.note}</p>}
      </section>
    </div>
  )
}
