import { useEffect, useState } from 'react'
import { getTeamProfile, getTeamMapLeaders, getTeamRadar, listTeams } from '../lib/api'
import { roleOf } from '../lib/roles'
import { VersusIcon } from '../components/icons'
import { Panel, Label, SectionHeader, ImpactBar, RoleChip, Select, Button, LoadingState, EmptyState, Skeleton } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import PlayerStatRow from '../components/PlayerStatRow'
import WinRateRing from '../components/WinRateRing'
import MapImage from '../components/MapImage'
import RadarChart from '../components/RadarChart'

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
        {cells.map(({ label, entry, suffix }) => (
          <div key={label} className="cut-corner-tag bg-panel-raised border border-line px-4 py-3">
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
      {leaders.small_sample && (
        <p className="text-xs text-ink-faint mt-2">Small sample on this map. Shown anyway, but not a reliable read.</p>
      )}
    </div>
  )
}

export default function TeamProfile({ teamId, onOpenMatch }) {
  const [p, setP] = useState(null)
  const [year, setYear] = useState(null)
  const [expandedMap, setExpandedMap] = useState(null)
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

  if (p === null) return <LoadingState>Loading team profile</LoadingState>
  if (!p) return <EmptyState>Could not load this team. The backend is unreachable and no bundled profile exists for it.</EmptyState>

  return (
    <div className="fade-up">
      <Panel accent="var(--color-brand)" className="relative overflow-hidden p-6 md:p-8 mb-6 flex items-center gap-6 flex-wrap">
        <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand" aria-hidden="true" />
        <TeamBadge name={p.name} accent="brand" size={84} />
        <div className="flex-1 min-w-[220px]">
          <Label tone="brand" className="mb-2">Team profile{p.roster_year ? `, ${p.roster_year}` : ''}</Label>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{p.name}</h1>
          <div className="font-mono text-sm text-ink-dim mt-2 tabular-nums">
            {p.record.wins}W / {p.record.losses}L, {p.record.matches} matches
          </div>
        </div>
        <div className="text-center">
          <WinRateRing winRate={p.win_rate} size={92} />
          <Label className="mt-2">Win rate</Label>
        </div>
      </Panel>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <div className="space-y-6 min-w-0">
          <Panel className="p-6">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <SectionHeader className="mb-0">Map pool</SectionHeader>
              <Label>Select a map for its leaders</Label>
            </div>
            <ul className="flex flex-col">
              {p.map_stats.map((m) => {
                const isOpen = expandedMap === m.map
                const rate = (m.map_win_rate || 0) * 100
                return (
                  <li key={m.map} className="border-t border-line-soft first:border-t-0">
                    <button
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
                      <span
                        className="font-mono text-ink-faint text-xs transition-transform duration-200 shrink-0"
                        style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
                        aria-hidden="true"
                      >
                        ▸
                      </span>
                    </button>
                    {isOpen && <div className="px-1 pb-4"><MapLeadersPanel teamId={teamId} mapName={m.map} /></div>}
                  </li>
                )
              })}
            </ul>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <SectionHeader className="mb-0">
                {p.roster_year ? `${p.roster_year} roster` : 'All-time roster'}
              </SectionHeader>
              {p.roster_years && p.roster_years.length > 1 && (
                <Select
                  value={year}
                  onChange={(v) => setYear(v ? Number(v) : null)}
                  placeholder="All-time roster"
                  options={p.roster_years.map((y) => ({ value: String(y), label: `${y} lineup` }))}
                />
              )}
            </div>
            {p.top_players.length === 0 && <EmptyState>No roster data for that year.</EmptyState>}
            <div className="flex flex-col">
              {p.top_players.map((pl) => (
                <PlayerStatRow key={pl.name} pl={pl} color="var(--color-brand)" />
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6 min-w-0">
          <Panel className="p-6">
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

          <Panel className="p-6">
            <SectionHeader>Agent usage</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {p.agent_usage.map((a) => (
                <RoleChip key={a.agent} role={roleOf(a.agent)} label={`${a.agent} (${a.games_used})`} />
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <section className="mt-8">
        <SectionHeader>Recent matches</SectionHeader>
        <div className="flex flex-col gap-2.5">
          {p.recent_matches.map((m) => (
            <button
              key={m.match_id}
              onClick={() => onOpenMatch(m.match_id)}
              className="cut-corner-tag bg-panel border border-line hover:border-brand/40 hover:bg-panel-raised px-5 py-4 text-left transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate flex items-center gap-2">
                    {m.team_a} <VersusIcon className="text-ink-faint shrink-0" /> {m.team_b}
                  </div>
                  <div className="text-xs text-ink-faint mt-1 truncate">{m.tournament}, {m.match_type}</div>
                </div>
                <div className="font-mono text-base font-semibold shrink-0 tabular-nums">{m.score}</div>
              </div>
            </button>
          ))}
        </div>
        {p.note && <p className="text-xs text-ink-faint mt-4">{p.note}</p>}
      </section>
    </div>
  )
}
