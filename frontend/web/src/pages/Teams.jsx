import { useEffect, useState } from 'react'
import { listTeams } from '../lib/api'
import { SearchIcon } from '../components/icons'
import { SectionHeader, EmptyState, LoadingState } from '../components/ui'
import TeamBadge from '../components/TeamBadge'

export default function Teams({ onOpenTeam }) {
  const [query, setQuery] = useState('')
  const [teams, setTeams] = useState(null)

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(async () => {
      const { teams } = await listTeams({ q: query || undefined })
      if (!cancelled) setTeams(teams)
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query])

  return (
    <div className="fade-up">
      <SectionHeader className="text-xl">Browse teams</SectionHeader>
      <p className="text-[13px] text-ink-dim mb-4">
        Every team with loaded match data, strongest (all-time win rate, minimum 10 matches) first. Click one
        for its full season profile.
      </p>

      <div className="relative mb-5 max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
          <SearchIcon size={15} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search teams..."
          className="w-full bg-panel border border-line text-ink text-sm rounded-sm py-2.5 pl-9 pr-3 font-mono focus:outline-none focus:border-brand/60"
        />
      </div>

      {teams === null && <LoadingState>loading teams…</LoadingState>}
      {teams && teams.length === 0 && <EmptyState>No teams found.</EmptyState>}
      {teams && teams.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {teams.map((t) => (
            <button
              key={t.team_id}
              onClick={() => onOpenTeam(t.team_id)}
              title={t.win_rate != null ? `${t.name} — ${(t.win_rate * 100).toFixed(0)}% (${t.wins}-${t.matches - t.wins})` : t.name}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span className="group-hover:-translate-y-0.5 transition-transform relative">
                <TeamBadge name={t.name} accent="team-b" size={56} />
              </span>
              <div className="font-mono text-[10px] text-ink-dim text-center truncate max-w-full">{t.name}</div>
              {t.win_rate != null && (
                <div className="font-mono text-[9px] text-ink-faint">{(t.win_rate * 100).toFixed(0)}%</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
