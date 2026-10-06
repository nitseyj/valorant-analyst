import { useEffect, useState } from 'react'
import { listTeams } from '../lib/api'
import { SearchIcon } from '../components/icons'
import { Label, EmptyState, Skeleton } from '../components/ui'
import TeamBadge from '../components/TeamBadge'

const TIERS = [
  { key: 'tier1', label: 'Tier 1', description: 'Organisations that have played in Champions, an international Masters, or a franchised league split.' },
  { key: 'tier2', label: 'Tier 2', description: 'Every other loaded team: regional challengers, qualifiers and domestic leagues.' },
  { key: null, label: 'All teams', description: 'Every loaded team, including the slower full list.' },
]

// Stacked wins and losses for one team, drawn from its real record.
function RecordBar({ wins, matches, delay }) {
  const winShare = matches ? (wins / matches) * 100 : 0
  return (
    <div className="flex h-1.5 w-full overflow-hidden bg-line-soft" aria-hidden="true">
      <div className="grow-x h-full bg-win" style={{ width: `${winShare}%`, animationDelay: `${delay}ms` }} />
      <div className="h-full bg-brand/60" style={{ width: `${100 - winShare}%` }} />
    </div>
  )
}

function TeamCard({ team, rank, delay, onOpen }) {
  const losses = team.matches - team.wins
  const featured = rank != null && rank <= 3
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${team.name}${rank != null ? `, rank ${rank}` : ''}, ${team.wins} wins and ${losses} losses`}
      className={`group lift rise-in relative cut-corner-sm bg-panel flex flex-col gap-4 p-5 text-left hover:bg-panel-raised [content-visibility:auto] [contain-intrinsic-size:auto_220px] ${
        featured ? 'shadow-[inset_0_0_0_1px_var(--color-brand-line)]' : 'shadow-[inset_0_0_0_1px_var(--color-line)]'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {featured && <span className="absolute top-0 left-0 h-[2px] w-14 bg-brand" aria-hidden="true" />}
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs text-ink-faint tabular-nums">{rank != null ? `#${rank}` : ''}</span>
        {team.win_rate != null && (
          <span className="font-display text-2xl font-bold text-win tabular-nums leading-none">
            {(team.win_rate * 100).toFixed(0)}%
          </span>
        )}
      </div>
      <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 self-start">
        <TeamBadge name={team.name} accent="team-b" size={64} />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink leading-snug line-clamp-2 min-h-[2.5rem]">{team.name}</div>
        <div className="font-mono text-xs text-ink-faint tabular-nums mt-1">
          {team.wins}W / {losses}L
        </div>
      </div>
      <RecordBar wins={team.wins} matches={team.matches} delay={delay + 120} />
    </button>
  )
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

  const active = TIERS.find((t) => t.key === tier) || TIERS[2]

  return (
    <div className="fade-up">
      <section className="relative overflow-hidden cut-corner border border-line bg-panel px-6 md:px-9 py-8 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand" aria-hidden="true" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="min-w-0">
            <Label tone="brand" className="mb-3">Teams</Label>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Browse teams</h1>
            <p className="text-sm text-ink-dim mt-3 max-w-xl leading-relaxed">
              Ranked by all-time win rate, with at least 10 matches to rank. Open a team for its full season profile.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-4xl font-bold tabular-nums text-ink" aria-live="polite">
              {teams ? teams.length.toLocaleString() : '…'}
            </div>
            <Label className="mt-1">Teams shown</Label>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-3 mb-3">
        <div className="relative flex-1 max-w-xl">
          <label className="block">
          <span className="sr-only">Search teams</span>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-ink-faint pointer-events-none">
            <SearchIcon size={17} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search teams…"
            className="w-full bg-panel border border-line text-ink text-sm py-3 pl-11 pr-11 font-mono cut-corner-tag focus-visible:border-brand placeholder:text-ink-faint"
          />
          </label>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 font-mono text-ink-faint hover:text-brand"
            >
              ×
            </button>
          )}
        </div>
        <div role="group" aria-label="Filter by tier" className="flex gap-1 p-1 bg-panel border border-line cut-corner-tag self-start">
          {TIERS.map((t) => (
            <button
              key={t.label}
              type="button"
              aria-pressed={tier === t.key}
              onClick={() => setTier(t.key)}
              className={`min-h-[40px] px-4 py-2 font-mono text-xs cut-corner-tag transition-colors ${
                tier === t.key ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-ink-faint mb-7 max-w-2xl">
        {active.description} Tiers come from real tournament names in the loaded data, not an official designation.
      </p>

      {teams === null && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-[200px] cut-corner-sm" />
          ))}
        </div>
      )}
      {teams && teams.length === 0 && (
        <EmptyState>
          {query ? `No team matches "${query}" in this tier. Try another tier or clear the search.` : 'No teams in this tier yet.'}
        </EmptyState>
      )}
      {teams && teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {teams.map((t, i) => (
            <TeamCard
              key={t.team_id}
              team={t}
              rank={query ? null : i + 1}
              delay={Math.min(i * 40, 720)}
              onOpen={() => onOpenTeam(t.team_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
