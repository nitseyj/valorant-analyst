import { useEffect, useState } from 'react'
import { listMatches } from '../lib/api'
import { impactColor, matchScoreStr } from '../lib/format'
import { SearchIcon, VersusIcon, ChevronRightIcon, CategoryIcon } from '../components/icons'
import { SectionHeader, EmptyState, LoadingState, Select } from '../components/ui'
import TeamBadge from '../components/TeamBadge'

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021]

export default function Matches({ onOpenMatch }) {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState(null)
  const [matches, setMatches] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('loading matches…')
    const t = setTimeout(async () => {
      const { matches, total, live } = await listMatches({ team: query || undefined, year: year || undefined, limit: 50 })
      if (cancelled) return
      setMatches(matches)
      const shown = matches.length
      const totalLabel = total != null && total !== shown ? ` of ${total}` : ''
      setStatus(
        live
          ? `${shown}${totalLabel} match${(total ?? shown) === 1 ? '' : 'es'} · live from your backend`
          : `backend not reachable — showing ${shown} demo match${shown === 1 ? '' : 'es'}`
      )
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, year])

  return (
    <div className="fade-up">
      <SectionHeader className="text-xl">All matches</SectionHeader>
      <div className="flex flex-wrap gap-2 mb-1.5">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
            <SearchIcon size={15} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search by team name..."
            className="w-full bg-panel border border-line text-ink text-sm rounded-sm py-2.5 pl-9 pr-3 font-mono focus:outline-none focus:border-brand/60"
          />
        </div>
        <Select value={year} onChange={setYear} placeholder="All years" options={YEARS.map((y) => ({ value: y, label: String(y) }))} />
      </div>
      <div className="font-mono text-[11px] text-ink-faint mb-4">{status}</div>

      {matches === null && <LoadingState />}
      {matches && matches.length === 0 && <EmptyState>No matches found.</EmptyState>}
      <div className="flex flex-col gap-2.5">
        {(matches || []).map((m) => {
          const pf = m.primary_factor
          const color = impactColor(m.winner, m.team_a)
          return (
            <button
              key={m.match_id}
              onClick={() => onOpenMatch(m.match_id)}
              className="cut-corner-sm bg-panel border border-line hover:border-brand/40 px-5 py-4 text-left transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <TeamBadge name={m.team_a} accent={m.winner === m.team_a ? 'brand' : 'team-b'} size={34} />
                  <div className="min-w-0">
                    <div className="font-display text-[15px] font-semibold truncate flex items-center gap-1">
                      {m.team_a} <VersusIcon className="text-ink-faint shrink-0" /> {m.team_b}
                    </div>
                    <div className="text-xs text-ink-dim mt-0.5 flex items-center gap-1.5 truncate">
                      {pf ? (
                        <>
                          <span style={{ color }} className="inline-flex"><CategoryIcon category={pf.category} /></span>
                          {pf.category} — <span style={{ color }}>{pf.impact_label.toLowerCase()}</span>
                        </>
                      ) : (
                        `${m.tournament || ''}${m.year ? ` · ${m.year}` : ''}`
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="font-mono text-lg font-semibold">{matchScoreStr(m)}</div>
                  <ChevronRightIcon size={16} className="text-ink-faint" />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
