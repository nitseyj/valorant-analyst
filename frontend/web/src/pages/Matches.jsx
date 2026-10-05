import { useEffect, useState } from 'react'
import { listMatches } from '../lib/api'
import { impactColor, matchScoreStr } from '../lib/format'
import { SearchIcon, VersusIcon, ChevronRightIcon, CategoryIcon } from '../components/icons'
import { Label, EmptyState, Select, Skeleton, Tag } from '../components/ui'
import TeamBadge from '../components/TeamBadge'

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021]

export default function Matches({ onOpenMatch }) {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState(null)
  const [matches, setMatches] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let cancelled = false
    setStatus('Loading matches…')
    const t = setTimeout(async () => {
      const { matches, total, live } = await listMatches({ team: query || undefined, year: year || undefined, limit: 50 })
      if (cancelled) return
      setMatches(matches)
      const shown = matches.length
      const totalLabel = total != null && total !== shown ? ` of ${total}` : ''
      setStatus(
        live
          ? `Showing ${shown}${totalLabel} match${(total ?? shown) === 1 ? '' : 'es'}, live from the backend`
          : `Backend not reachable. Showing ${shown} bundled match${shown === 1 ? '' : 'es'}.`
      )
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, year])

  return (
    <div className="fade-up">
      <header className="mb-7">
        <Label tone="brand" className="mb-2">Matches</Label>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">All matches</h1>
        <p className="text-sm text-ink-dim max-w-2xl leading-relaxed">
          Search by team, or narrow by season. Open any match for its ranked verdict and round evidence.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-3 mb-3 max-w-3xl">
        <label className="relative flex-1">
          <span className="sr-only">Search by team</span>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
            <SearchIcon size={16} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search by team name…"
            className="w-full bg-panel border border-line text-ink text-sm py-3 pl-11 pr-4 font-mono cut-corner-tag focus-visible:border-brand placeholder:text-ink-faint"
          />
        </label>
        <Select value={year} onChange={setYear} placeholder="All seasons" options={YEARS.map((y) => ({ value: y, label: String(y) }))} className="py-3 px-4 text-sm" />
      </div>
      <Label className="mb-6" aria-live="polite">{status}</Label>

      {matches === null && (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[76px] cut-corner-tag" />
          ))}
        </div>
      )}
      {matches && matches.length === 0 && <EmptyState>No matches found for this search.</EmptyState>}
      <div className="flex flex-col gap-2.5">
        {(matches || []).map((m) => {
          const pf = m.primary_factor
          const color = impactColor(m.winner, m.team_a)
          return (
            <button
              key={m.match_id}
              onClick={() => onOpenMatch(m.match_id)}
              className="group cut-corner-tag bg-panel border border-line hover:border-brand/40 hover:bg-panel-raised px-5 py-4 text-left transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <TeamBadge name={m.team_a} accent={m.winner === m.team_a ? 'brand' : 'team-b'} size={38} />
                  <div className="min-w-0">
                    <div className="font-display text-base font-semibold truncate flex items-center gap-2">
                      {m.team_a} <VersusIcon className="text-ink-faint shrink-0" /> {m.team_b}
                    </div>
                    <div className="text-xs text-ink-dim mt-1 flex items-center gap-2 min-w-0">
                      {pf ? (
                        <>
                          <span style={{ color }} className="inline-flex shrink-0"><CategoryIcon category={pf.category} /></span>
                          <span className="truncate">
                            {pf.category}, <span style={{ color }}>{pf.impact_label.toLowerCase()}</span>
                          </span>
                        </>
                      ) : (
                        <span className="truncate">{[m.tournament, m.year].filter(Boolean).join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {m.year && <Tag tone="neutral" className="hidden sm:inline-flex">{m.year}</Tag>}
                  <div className="font-mono text-lg font-semibold tabular-nums">{matchScoreStr(m)}</div>
                  <ChevronRightIcon size={16} className="text-ink-faint group-hover:text-brand transition-colors" />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
