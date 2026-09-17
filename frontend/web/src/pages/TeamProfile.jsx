import { useEffect, useState } from 'react'
import { getTeamProfile } from '../lib/api'
import { roleOf } from '../lib/roles'
import { VersusIcon, MapGlyph } from '../components/icons'
import { Panel, SectionHeader, ImpactBar, RoleChip, LoadingState, EmptyState } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import PlayerStatRow from '../components/PlayerStatRow'
import WinRateRing from '../components/WinRateRing'

export default function TeamProfile({ teamId, onOpenMatch }) {
  const [p, setP] = useState(null)

  useEffect(() => {
    setP(null)
    getTeamProfile(teamId).then(({ profile }) => setP(profile))
  }, [teamId])

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
        <div className="font-mono text-[11px] text-ink-faint mb-3.5">MAP POOL</div>
        {p.map_stats.map((m) => (
          <div key={m.map} className="flex items-center gap-2.5 mb-2.5">
            <span className="w-3.5 inline-flex text-ink-faint shrink-0"><MapGlyph map={m.map} /></span>
            <span className="text-xs w-[72px] shrink-0">{m.map}</span>
            <div className="flex-1"><ImpactBar pct={(m.map_win_rate || 0) * 100} color={(m.map_win_rate || 0) >= 0.5 ? 'var(--color-brand)' : 'var(--color-team-b)'} /></div>
            <span className="font-mono text-[11px] text-ink-dim w-20 text-right shrink-0">
              {m.maps_won}/{m.maps_played} ({((m.map_win_rate || 0) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </Panel>

      <Panel className="p-5 mb-5">
        <div className="font-mono text-[11px] text-ink-faint mb-3.5">TOP PLAYERS</div>
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
