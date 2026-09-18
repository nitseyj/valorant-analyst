import { useEffect, useState } from 'react'
import { listTeams } from '../lib/api'
import { SearchIcon } from '../components/icons'
import { SectionHeader, EmptyState, LoadingState, Select } from '../components/ui'
import TeamBadge from '../components/TeamBadge'

const TIER_OPTIONS = [
  { value: 'tier1', label: 'Tier 1 — international/franchised' },
  { value: 'tier2', label: 'Tier 2 — regional/challengers' },
]

const TIER_DESCRIPTION = {
  tier1: 'Orgs that have played in Champions, an international Masters, or a franchised regional league split.',
  tier2: 'Every other loaded team — regional Challengers, qualifiers, domestic leagues, and the rest.',
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
      <SectionHeader className="text-2xl">Browse teams</SectionHeader>
      <p className="text-sm text-ink-dim mb-1.5">
        Every team with loaded match data, strongest (all-time win rate, minimum 10 matches) first. Click one
        for its full season profile.
      </p>
      <p className="text-xs text-ink-faint mb-6">
        {tier ? TIER_DESCRIPTION[tier] : 'Showing all 4,000+ loaded teams — pick a tier to narrow it down.'} Tier is
        derived from real tournament names in the loaded data, not an official Riot designation.
      </p>

      <div className="flex flex-wrap gap-3 mb-7 max-w-2xl">
        <div className="relative flex-1 min-w-[260px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
            <SearchIcon size={18} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search teams..."
            className="w-full bg-panel border border-line text-ink text-base rounded-sm py-3.5 pl-11 pr-4 font-mono focus:outline-none focus:border-brand/60"
          />
        </div>
        <Select value={tier} onChange={setTier} placeholder="All tiers (slower)" options={TIER_OPTIONS} className="!text-sm !py-3.5 !px-4" />
      </div>

      {teams === null && <LoadingState>loading teams…</LoadingState>}
      {teams && teams.length === 0 && <EmptyState>No teams found.</EmptyState>}
      {teams && teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {teams.map((t) => (
            <button
              key={t.team_id}
              onClick={() => onOpenTeam(t.team_id)}
              title={t.win_rate != null ? `${t.name} — ${(t.win_rate * 100).toFixed(0)}% (${t.wins}-${t.matches - t.wins})` : t.name}
              className="cut-corner-sm bg-panel border border-line hover:border-brand/50 flex flex-col items-center gap-3 px-4 py-6 transition-colors group"
            >
              <span className="group-hover:-translate-y-0.5 transition-transform relative">
                <TeamBadge name={t.name} accent="team-b" size={92} />
              </span>
              <div className="text-sm font-semibold text-ink text-center truncate max-w-full">{t.name}</div>
              {t.win_rate != null && (
                <div className="font-mono text-xs text-brand">{(t.win_rate * 100).toFixed(0)}% win rate</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
