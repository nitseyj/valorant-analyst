import { useEffect, useState } from 'react'
import { getTeamProfile, getTeamMapLeaders, getTeamRadar, listTeams } from '../lib/api'
import { roleOf } from '../lib/roles'
import { VersusIcon } from '../components/icons'
import { Panel, SectionHeader, ImpactBar, RoleChip, Select, LoadingState, EmptyState } from '../components/ui'
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

  if (leaders === null) return <div className="text-[11px] text-ink-faint font-mono py-2">loading {mapName} leaders…</div>
  if (!leaders || (!leaders.most_kills && !leaders.most_assists && !leaders.most_effective)) {
    return <div className="text-[11px] text-ink-faint font-mono py-2">not enough loaded data on {mapName} for this team.</div>
  }

  const cells = [
    { label: 'Most kills', entry: leaders.most_kills, suffix: 'kills' },
    { label: 'Most assists', entry: leaders.most_assists, suffix: 'assists' },
    { label: 'Most effective', entry: leaders.most_effective, suffix: 'avg rating' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3 py-2.5 px-1">
      {cells.map(({ label, entry, suffix }) => (
        <div key={label} className="cut-corner-sm bg-panel-raised px-3 py-2.5">
          <div className="font-mono text-[9px] text-ink-faint mb-1">{label.toUpperCase()}</div>
          {entry ? (
            <>
              <div className="text-[13px] font-semibold truncate">{entry.name}</div>
              <div className="font-mono text-[11px] text-brand">{entry.value} {suffix}</div>
            </>
          ) : (
            <div className="text-[11px] text-ink-faint">—</div>
          )}
        </div>
      ))}
      {leaders.small_sample && (
        <div className="col-span-3 text-[10px] text-ink-faint">small sample on this map — shown anyway, just not a reliable read.</div>
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
  const [radar, setRadar] = useState(undefined)
  const [radarRetry, setRadarRetry] = useState(0)

  // TeamProfile doesn't remount when navigating between teams (no `key`
  // in App.jsx — same reason TeamBadge/MapImage/AgentImage reset their
  // own state during render, see those components). Reset the
  // team-scoped UI state synchronously here rather than in an effect.
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
    setRadar(undefined) // undefined = loading; null = fetch resolved but failed — see render below
    getTeamRadar(teamId, compareWith).then((data) => {
      if (!cancelled) setRadar(data)
    })
    return () => {
      cancelled = true
    }
  }, [teamId, compareWith, radarRetry])

  if (p === null) return <LoadingState>loading team profile…</LoadingState>
  if (!p) return <EmptyState>Couldn't load this team. The backend isn't reachable and no demo profile exists for this team.</EmptyState>

  return (
    <div className="fade-up">
      <Panel accent="var(--color-brand)" className="p-7 mb-6 flex items-center gap-6 relative overflow-hidden flex-wrap sm:flex-nowrap">
        <svg className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none" width="320" height="320" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="150" stroke="var(--color-brand)" strokeWidth="1" fill="none" />
          <circle cx="160" cy="160" r="100" stroke="var(--color-brand)" strokeWidth="1" fill="none" />
          <circle cx="160" cy="160" r="50" stroke="var(--color-brand)" strokeWidth="1" fill="none" />
        </svg>
        <div className="relative"><TeamBadge name={p.name} accent="brand" size={72} /></div>
        <div className="relative flex-1 min-w-0">
          <div className="font-display text-2xl sm:text-3xl font-bold leading-tight">{p.name}</div>
          <div className="font-mono text-[13px] text-ink-dim mt-1.5">
            {p.record.wins}W – {p.record.losses}L &nbsp;·&nbsp; {p.record.matches} matches
          </div>
        </div>
        <div className="relative text-center">
          <WinRateRing winRate={p.win_rate} size={84} />
          <div className="font-mono text-[9px] text-ink-faint mt-1 tracking-wide">WIN RATE</div>
        </div>
      </Panel>

      <Panel className="p-5 mb-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="font-mono text-[11px] text-ink-faint">MAP POOL</div>
          <div className="font-mono text-[10px] text-ink-faint">click a map for per-map leaders</div>
        </div>
        {p.map_stats.map((m) => {
          const isOpen = expandedMap === m.map
          return (
            <div key={m.map} className="mb-1">
              <button
                onClick={() => setExpandedMap(isOpen ? null : m.map)}
                className="w-full flex items-center gap-2.5 py-1 text-left hover:opacity-80 transition-opacity"
              >
                <MapImage map={m.map} className="w-9 h-9 rounded-sm shrink-0" />
                <span className="text-xs w-[72px] shrink-0">{m.map}</span>
                <div className="flex-1"><ImpactBar pct={(m.map_win_rate || 0) * 100} color={(m.map_win_rate || 0) >= 0.5 ? 'var(--color-brand)' : 'var(--color-team-b)'} /></div>
                <span className="font-mono text-[11px] text-ink-dim w-20 text-right shrink-0">
                  {m.maps_won}/{m.maps_played} ({((m.map_win_rate || 0) * 100).toFixed(0)}%)
                </span>
                <span
                  className="font-mono text-ink-faint text-xs transition-transform duration-200 shrink-0"
                  style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
                >
                  ▸
                </span>
              </button>
              {isOpen && <MapLeadersPanel teamId={teamId} mapName={m.map} />}
            </div>
          )
        })}
      </Panel>

      <Panel className="p-5 mb-5">
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="font-mono text-[11px] text-ink-faint">
            TOP PLAYERS {p.roster_year ? `— ${p.roster_year} ROSTER` : '— ALL-TIME'}
          </div>
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
        {p.top_players.map((pl) => (
          <PlayerStatRow key={pl.name} pl={pl} color="var(--color-brand)" />
        ))}
      </Panel>

      <Panel className="p-5 mb-5">
        <div className="font-mono text-[11px] text-ink-faint mb-3">AGENT USAGE</div>
        <div className="flex flex-wrap gap-2">
          {p.agent_usage.map((a) => (
            <RoleChip key={a.agent} role={roleOf(a.agent)} label={`${a.agent} (${a.games_used})`} />
          ))}
        </div>
      </Panel>

      <Panel className="p-5 mb-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="font-mono text-[11px] text-ink-faint">STAT PROFILE</div>
          {compareOptions && compareOptions.length > 0 && (
            <Select
              value={compareWith ? String(compareWith) : null}
              onChange={(v) => setCompareWith(v ? Number(v) : null)}
              placeholder="Compare with a team…"
              options={compareOptions.map((t) => ({ value: String(t.team_id), label: t.name }))}
            />
          )}
        </div>
        {radar === undefined && <LoadingState>loading stat profile…</LoadingState>}
        {radar && radar.a && (
          <div className="flex justify-center">
            <RadarChart a={radar.a} b={radar.b} />
          </div>
        )}
        {radar !== undefined && !radar?.a && (
          <EmptyState>
            Couldn't load the stat profile (backend unreachable or slow to respond).{' '}
            <button onClick={() => setRadarRetry((n) => n + 1)} className="text-brand underline underline-offset-2">
              retry
            </button>
          </EmptyState>
        )}
      </Panel>

      <SectionHeader>Recent matches</SectionHeader>
      <div className="flex flex-col gap-2">
        {p.recent_matches.map((m) => (
          <button
            key={m.match_id}
            onClick={() => onOpenMatch(m.match_id)}
            className="cut-corner-sm bg-panel border border-line hover:border-brand/40 px-4 py-3.5 text-left transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate flex items-center gap-1">
                  {m.team_a} <VersusIcon className="text-ink-faint" /> {m.team_b}
                </div>
                <div className="text-[11px] text-ink-faint mt-0.5">{m.tournament} — {m.match_type}</div>
              </div>
              <div className="font-mono text-sm font-semibold shrink-0">{m.score}</div>
            </div>
          </button>
        ))}
      </div>
      {p.note && <p className="text-[11px] text-ink-faint mt-3">{p.note}</p>}
    </div>
  )
}
