import { useEffect, useState } from 'react'
import { listTeams } from '../lib/api'
import { SearchIcon } from '../components/icons'
import { Label, SectionHeader, EmptyState, Select, Skeleton } from '../components/ui'
import TeamBadge from '../components/TeamBadge'

const TIER_OPTIONS = [
  { value: 'tier1', label: 'Tier 1: international and franchised' },
  { value: 'tier2', label: 'Tier 2: regional and challengers' },
]

const TIER_DESCRIPTION = {
  tier1: 'Organisations that have played in Champions, an international Masters, or a franchised league split.',
  tier2: 'Every other loaded team: regional challengers, qualifiers and domestic leagues.',
}

export default function Teams({ onOpenTeam }) {
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState('tier1')
  const [teams, setTeams] = useState(null)

  useEffect(() => {
    let cancelled = false
    setTeams(null)
    const t = setTimeout(async () => {
      const { teams } = await listTeams({ q: query || undefined, tier: tier || undefined })
      if (!cancelled) setTeams(teams)
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, tier])

  return (
    <div className="fade-up">
      <header className="mb-7">
        <Label tone="brand" className="mb-2">Teams</Label>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Browse teams</h1>
        <p className="text-sm text-ink-dim max-w-2xl leading-relaxed">
          Every team with loaded match data, strongest first by all-time win rate (minimum 10 matches).
          Open a team for its full season profile.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-3 mb-3 max-w-3xl">
        <label className="relative flex-1">
          <span className="sr-only">Search teams</span>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
            <SearchIcon size={17} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search teams…"
            className="w-full bg-panel border border-line text-ink text-sm py-3 pl-11 pr-4 font-mono cut-corner-tag focus-visible:border-brand placeholder:text-ink-faint"
          />
        </label>
        <Select value={tier} onChange={setTier} placeholder="All tiers (slower)" options={TIER_OPTIONS} className="py-3 px-4 text-sm" />
      </div>
      <p className="text-xs text-ink-faint mb-7">
        {tier ? TIER_DESCRIPTION[tier] : 'Showing every loaded team. Pick a tier to narrow the list.'} Tiers are
        derived from real tournament names in the loaded data, not an official designation.
      </p>

      {teams === null && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-[190px] cut-corner-sm" />
          ))}
        </div>
      )}
      {teams && teams.length === 0 && <EmptyState>No teams match this search.</EmptyState>}
      {teams && teams.length > 0 && (
        <>
          <SectionHeader size="md" className="mb-4">
            <span className="text-ink-dim font-mono text-sm font-normal tabular-nums">{teams.length} teams</span>
          </SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {teams.map((t) => (
              <button
                key={t.team_id}
                onClick={() => onOpenTeam(t.team_id)}
                title={t.win_rate != null ? `${t.name}: ${(t.win_rate * 100).toFixed(0)}% win rate (${t.wins}-${t.matches - t.wins})` : t.name}
                className="group relative cut-corner-sm bg-panel border border-line hover:border-brand/50 hover:bg-panel-raised flex flex-col items-center gap-3 px-4 py-6 transition-colors"
              >
                <span className="transition-transform group-hover:-translate-y-0.5">
                  <TeamBadge name={t.name} accent="team-b" size={84} />
                </span>
                <span className="text-sm font-semibold text-ink text-center truncate max-w-full">{t.name}</span>
                {t.win_rate != null && (
                  <span className="font-mono text-xs text-win tabular-nums">
                    {(t.win_rate * 100).toFixed(0)}% win rate
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
