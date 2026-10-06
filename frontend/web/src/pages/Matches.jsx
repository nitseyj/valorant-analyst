import { useEffect, useMemo, useRef, useState } from 'react'
import { listMatches, getMatchVerdict } from '../lib/api'
import { impactColor, matchScoreStr } from '../lib/format'
import { useCountUp, useSlashToFocus } from '../lib/hooks'
import { SearchIcon, ChevronRightIcon, CategoryIcon } from '../components/icons'
import { Label, EmptyState, Skeleton, Tag, Button, ImpactBar } from '../components/ui'
import TeamBadge from '../components/TeamBadge'

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021]
const SEASONS = [{ key: null, label: 'All seasons' }, ...YEARS.map((y) => ({ key: y, label: String(y) }))]
const SORTS = [
  { key: 'listed', label: 'Listed order' },
  { key: 'closest', label: 'Closest finish' },
  { key: 'biggest', label: 'Biggest margin' },
  { key: 'az', label: 'Team A to Z' },
]
const OUTCOMES = [
  { key: null, label: 'All series' },
  { key: 'sweep', label: 'Sweeps' },
  { key: 'close', label: 'Close series' },
]
const VIEWS = [
  { key: 'list', label: 'List' },
  { key: 'event', label: 'By event' },
]
const PAGE_SIZE = 50
const UNKNOWN_MARGIN = 999

// Parses "2-1" into numbers. Returns null when the score is not two numbers,
// so the bar is simply left out rather than drawn wrong.
function parseScore(str) {
  const [a, b] = String(str).split('-').map(Number)
  return Number.isFinite(a) && Number.isFinite(b) ? [a, b] : null
}

function marginOf(m) {
  const parsed = parseScore(matchScoreStr(m))
  return parsed ? Math.abs(parsed[0] - parsed[1]) : UNKNOWN_MARGIN
}

// A sweep is one side winning every map played. A close series is decided by
// one map with at least three played (2-1 and up). Anything else is standard.
function outcomeOf(m) {
  const parsed = parseScore(matchScoreStr(m))
  if (!parsed) return null
  const [a, b] = parsed
  if (Math.min(a, b) === 0) return 'sweep'
  if (Math.abs(a - b) === 1 && a + b >= 3) return 'close'
  return 'standard'
}

// Maps won by each side as a proportional split bar.
function ScoreBar({ scoreStr, delay }) {
  const parsed = parseScore(scoreStr)
  if (!parsed) return null
  const [a, b] = parsed
  const total = a + b
  const aShare = total ? (a / total) * 100 : 50
  return (
    <div className="flex h-1 w-28 overflow-hidden bg-line-soft" aria-hidden="true">
      <div className="grow-x h-full bg-brand" style={{ width: `${aShare}%`, animationDelay: `${delay}ms` }} />
      <div className="h-full bg-team-b" style={{ width: `${100 - aShare}%` }} />
    </div>
  )
}

function OutcomeTag({ outcome }) {
  if (outcome === 'sweep') return <Tag tone="brand">Sweep</Tag>
  if (outcome === 'close') return <Tag tone="mvp">Close</Tag>
  return null
}

function TeamRow({ name, won, lost, accent }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <TeamBadge name={name} accent={accent} size={32} />
      <span className={`truncate text-sm ${won ? 'font-semibold text-ink' : 'text-ink-dim'}`}>
        {name}
        {won && <span className="sr-only"> (winner)</span>}
      </span>
      {lost && <span className="sr-only"> (lost)</span>}
    </div>
  )
}

// Top three ranked factors for one match, loaded when the card is peeked.
// `factors` is undefined until requested, 'loading' while fetching, and null
// when the verdict is unavailable.
function FactorPeek({ match, factors, panelId }) {
  return (
    <div id={panelId} className="px-4 md:px-5 pb-4 rise-in">
      <div className="border-t border-line-soft pt-4">
        <Label className="mb-3">Top factors by measured impact</Label>
        {factors === 'loading' || factors === undefined ? (
          <div className="flex flex-col gap-2.5" role="status">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-1.5 w-full" />
            <span className="sr-only">Loading factors</span>
          </div>
        ) : factors === null || factors.length === 0 ? (
          <p className="text-xs text-ink-faint">Factors are not available for this match offline.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {factors.map((f, i) => (
              <li key={`${f.category}-${i}`} className="rise-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-baseline justify-between gap-3 text-xs mb-1.5">
                  <span className="text-ink truncate">{f.category}</span>
                  <span className="font-mono shrink-0" style={{ color: impactColor(f.winner, match.team_a) }}>
                    {f.impact_label}
                  </span>
                </div>
                <ImpactBar pct={f.impact * 100} color={impactColor(f.winner, match.team_a)} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

function MatchCard({ m, delay, onOpen, open, onTogglePeek, factors }) {
  const pf = m.primary_factor
  const color = impactColor(m.winner, m.team_a)
  const scoreStr = matchScoreStr(m)
  const parsed = parseScore(scoreStr)
  const aWon = m.winner === m.team_a
  const bWon = m.winner === m.team_b
  const panelId = `peek-${m.match_id}`
  const outcome = outcomeOf(m)

  // The spotlight follows the pointer through CSS variables rather than React
  // state, so moving the mouse never re-renders the list.
  function trackPointer(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <article
      onPointerMove={trackPointer}
      className="group relative rise-in cut-corner-tag border border-line hover:border-brand/40 transition-colors [content-visibility:auto] [contain-intrinsic-size:auto_96px]"
      style={{
        animationDelay: `${delay}ms`,
        background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-brand) 10%, transparent), transparent 70%), var(--color-panel)`,
      }}
    >
      <button
        type="button"
        data-match-open
        onClick={onOpen}
        aria-label={`${m.team_a} ${scoreStr} ${m.team_b}${m.winner ? `, ${m.winner} won` : ''}, open verdict`}
        className="lift block w-full px-4 md:px-5 pt-4 pb-3 text-left rounded-[inherit]"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 md:gap-6">
          <div className="min-w-0 flex flex-col gap-2">
            <TeamRow name={m.team_a} won={aWon} lost={bWon} accent={aWon ? 'brand' : 'team-b'} />
            <TeamRow name={m.team_b} won={bWon} lost={aWon} accent={bWon ? 'brand' : 'team-b'} />
            <div className="text-xs text-ink-dim flex items-center gap-2 min-w-0 mt-0.5">
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

          <div className="flex flex-col items-center gap-2">
            <div className="font-mono text-xl md:text-2xl font-semibold tabular-nums flex items-center gap-2">
              <span className={aWon ? 'text-brand' : 'text-ink-dim'}>{parsed ? parsed[0] : scoreStr}</span>
              <span className="text-ink-faint text-sm" aria-hidden="true">:</span>
              <span className={bWon ? 'text-team-b' : 'text-ink-dim'}>{parsed ? parsed[1] : ''}</span>
            </div>
            {parsed && <ScoreBar scoreStr={scoreStr} delay={delay + 120} />}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex"><OutcomeTag outcome={outcome} /></span>
              {m.year && <Tag tone="neutral" className="hidden md:inline-flex">{m.year}</Tag>}
            </div>
            <ChevronRightIcon size={16} className="text-ink-faint group-hover:text-brand transition-colors" />
          </div>
        </div>
      </button>

      <div className="flex items-center justify-between gap-3 px-4 md:px-5 pb-3">
        <button
          type="button"
          onClick={onTogglePeek}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex items-center gap-2 min-h-[40px] font-mono text-xs text-ink-dim hover:text-brand transition-colors"
        >
          <ChevronRightIcon size={12} className="transition-transform duration-200" style={{ transform: open ? 'rotate(90deg)' : 'none' }} />
          {open ? 'Hide factors' : 'Peek factors'}
        </button>
        <span className="font-mono text-[11px] text-ink-faint hidden sm:inline">Enter to open</span>
      </div>

      {open && <FactorPeek match={m} factors={factors} panelId={panelId} />}
    </article>
  )
}

// Four numbers about the loaded series, with the sweep share drawn as a bar.
// They describe what was loaded, not the filtered view.
function SeriesProfile({ matches }) {
  const scored = matches.map((m) => ({ m, parsed: parseScore(matchScoreStr(m)) })).filter((x) => x.parsed)
  const n = scored.length || 1
  const sweeps = scored.filter((x) => outcomeOf(x.m) === 'sweep').length
  const close = scored.filter((x) => outcomeOf(x.m) === 'close').length
  const avgMaps = scored.reduce((sum, x) => sum + x.parsed[0] + x.parsed[1], 0) / n
  const sweepShare = (sweeps / n) * 100
  const closeShare = (close / n) * 100
  const loaded = useCountUp(matches.length, 900)

  const cells = [
    { label: 'Series loaded', value: Math.round(loaded).toLocaleString(), sub: 'in this view' },
    { label: 'Sweeps', value: `${sweepShare.toFixed(0)}%`, sub: `${sweeps} series, one side took every map`, bar: sweepShare, color: 'var(--color-brand)' },
    { label: 'Close series', value: `${closeShare.toFixed(0)}%`, sub: `${close} series decided by one map`, bar: closeShare, color: 'var(--color-mvp)' },
    { label: 'Maps per series', value: avgMaps.toFixed(1), sub: 'average, both sides combined' },
  ]

  return (
    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cells.map((c, i) => (
        <div key={c.label} className="rise-in cut-corner-sm bg-panel border border-line p-4" style={{ animationDelay: `${i * 70}ms` }}>
          <dt><Label>{c.label}</Label></dt>
          <dd className="font-display text-2xl font-bold tabular-nums mt-2">{c.value}</dd>
          {c.bar != null && (
            <div className="h-1 bg-line-soft mt-2.5 overflow-hidden" aria-hidden="true">
              <div className="grow-x h-full" style={{ width: `${c.bar}%`, background: c.color }} />
            </div>
          )}
          <div className="text-[11px] text-ink-faint mt-2 leading-snug">{c.sub}</div>
        </div>
      ))}
    </dl>
  )
}

export default function Matches({ onOpenMatch }) {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState(null)
  const [sort, setSort] = useState('listed')
  const [outcome, setOutcome] = useState(null)
  const [view, setView] = useState('list')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const [matches, setMatches] = useState(null)
  const [total, setTotal] = useState(null)
  const [live, setLive] = useState(null)
  const [status, setStatus] = useState('')
  const [openPeeks, setOpenPeeks] = useState({})
  const [peekData, setPeekData] = useState({})
  const searchRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setStatus('Loading matches…')
    const t = setTimeout(async () => {
      const result = await listMatches({ team: query || undefined, year: year || undefined, limit })
      if (cancelled) return
      const { matches, total, live } = result
      setMatches(matches)
      setTotal(total ?? null)
      setLive(live)
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
  }, [query, year, limit])

  useSlashToFocus(searchRef)

  // Up and down arrows move focus between match cards, across event groups too.
  function onListKeyDown(e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const buttons = [...(listRef.current?.querySelectorAll('[data-match-open]') ?? [])]
    const index = buttons.indexOf(document.activeElement)
    if (index === -1) return
    e.preventDefault()
    const next = e.key === 'ArrowDown' ? Math.min(index + 1, buttons.length - 1) : Math.max(index - 1, 0)
    buttons[next].focus()
    buttons[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  // Changing a filter starts again from the first page of results.
  function updateQuery(value) {
    setQuery(value)
    setLimit(PAGE_SIZE)
  }
  function updateYear(value) {
    setYear(value)
    setLimit(PAGE_SIZE)
  }

  async function togglePeek(id) {
    const isOpen = Boolean(openPeeks[id])
    setOpenPeeks((prev) => ({ ...prev, [id]: !isOpen }))
    if (isOpen || peekData[id] !== undefined) return
    setPeekData((prev) => ({ ...prev, [id]: 'loading' }))
    const { verdict } = await getMatchVerdict(id)
    const factors = verdict?.ranked_factors ? verdict.ranked_factors.slice(0, 3) : null
    setPeekData((prev) => ({ ...prev, [id]: factors }))
  }

  const sorted = useMemo(() => {
    if (!matches) return null
    const list = [...matches]
    if (sort === 'closest') list.sort((a, b) => marginOf(a) - marginOf(b))
    if (sort === 'biggest') list.sort((a, b) => marginOf(b) - marginOf(a))
    if (sort === 'az') list.sort((a, b) => a.team_a.localeCompare(b.team_a))
    return list
  }, [matches, sort])

  const shown = useMemo(() => (sorted && outcome ? sorted.filter((m) => outcomeOf(m) === outcome) : sorted), [sorted, outcome])

  // Groups keep the order their first match appeared in, so the event order
  // from the list is preserved.
  const groups = useMemo(() => {
    if (!shown) return []
    const map = new Map()
    for (const m of shown) {
      const key = m.tournament || 'Unknown event'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(m)
    }
    return [...map.entries()]
  }, [shown])

  const headline = total ?? matches?.length ?? null
  const animatedCount = useCountUp(headline, 1000)
  const canShowMore = matches && total != null && total > matches.length
  const chips = [
    ...(query ? [{ id: 'team', label: `Team: ${query}`, clear: () => updateQuery('') }] : []),
    ...(year ? [{ id: 'year', label: `Season: ${year}`, clear: () => updateYear(null) }] : []),
    ...(outcome ? [{ id: 'outcome', label: OUTCOMES.find((o) => o.key === outcome).label, clear: () => setOutcome(null) }] : []),
  ]

  function renderCard(m, i) {
    return (
      <MatchCard
        key={m.match_id}
        m={m}
        delay={Math.min(i * 30, 600)}
        onOpen={() => onOpenMatch(m.match_id)}
        open={Boolean(openPeeks[m.match_id])}
        onTogglePeek={() => togglePeek(m.match_id)}
        factors={peekData[m.match_id]}
      />
    )
  }

  return (
    <div className="fade-up">
      <section className="relative overflow-hidden cut-corner border border-line bg-panel px-6 md:px-9 py-8 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand" aria-hidden="true" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="min-w-0 max-w-2xl">
            <Label tone="brand" className="mb-3">Matches</Label>
            <h1 className="font-display text-3xl md:text-4xl font-bold">All matches</h1>
            <p className="text-sm text-ink-dim mt-3 leading-relaxed">
              Search by team, or narrow by season and outcome. Group matches by event, peek at the top factors, or open any
              match for its ranked verdict and round evidence.
            </p>
          </div>
          <dl className="flex items-end gap-8 shrink-0">
            <div>
              <dt><Label>All matches</Label></dt>
              <dd className="font-display text-4xl font-bold tabular-nums mt-2" aria-live="polite">
                {headline == null ? '…' : Math.round(animatedCount).toLocaleString()}
              </dd>
            </div>
            <div className="pb-1">
              <dt className="sr-only">Data source</dt>
              <dd>{live === null ? null : live ? <Tag tone="brand">Live backend</Tag> : <Tag tone="neutral">Bundled data</Tag>}</dd>
            </div>
          </dl>
        </div>
      </section>

      {matches && matches.length > 0 && <SeriesProfile matches={matches} />}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
        <div className="relative flex-1 max-w-xl">
          <label className="block">
            <span className="sr-only">Search by team</span>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-ink-faint pointer-events-none">
              <SearchIcon size={16} />
            </span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              type="text"
              placeholder="Search by team name…"
              className="w-full bg-panel border border-line text-ink text-sm py-3 pl-11 pr-14 font-mono cut-corner-tag focus-visible:border-brand placeholder:text-ink-faint"
            />
          </label>
          <kbd className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:inline-flex font-mono text-[11px] text-ink-faint border border-line px-1.5 py-0.5 pointer-events-none" aria-hidden="true">/</kbd>
          {query && (
            <button type="button" onClick={() => updateQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 font-mono text-ink-faint hover:text-brand">
              ×
            </button>
          )}
        </div>
        <div role="group" aria-label="Filter by season" className="flex flex-wrap gap-1 p-1 bg-panel border border-line cut-corner-tag self-start">
          {SEASONS.map((s) => (
            <button
              key={s.label}
              type="button"
              aria-pressed={year === s.key}
              onClick={() => updateYear(s.key)}
              className={`min-h-[40px] px-3 md:px-4 py-2 font-mono text-xs cut-corner-tag transition-colors ${
                year === s.key ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div role="group" aria-label="Filter by outcome" className="flex flex-wrap gap-1 p-1 bg-panel border border-line cut-corner-tag self-start">
          {OUTCOMES.map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={outcome === o.key}
              onClick={() => setOutcome(o.key)}
              className={`min-h-[36px] px-3 font-mono text-[11px] cut-corner-tag transition-colors ${
                outcome === o.key ? 'bg-panel-raised text-brand border border-brand-line' : 'text-ink-dim hover:text-ink border border-transparent'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <div role="group" aria-label="Choose view" className="flex gap-1 p-1 bg-panel border border-line cut-corner-tag">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={view === v.key}
                onClick={() => setView(v.key)}
                className={`min-h-[36px] px-3 font-mono text-[11px] cut-corner-tag transition-colors ${
                  view === v.key ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Sort loaded matches" className="flex flex-wrap gap-1 p-1 bg-panel border border-line cut-corner-tag">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={sort === s.key}
                onClick={() => setSort(s.key)}
                className={`min-h-[36px] px-3 py-1.5 font-mono text-[11px] cut-corner-tag transition-colors ${
                  sort === s.key ? 'bg-panel-raised text-brand border border-brand-line' : 'text-ink-dim hover:text-ink border border-transparent'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4" aria-label="Active filters">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={c.clear}
              aria-label={`Remove ${c.label} filter`}
              className="inline-flex items-center gap-2 min-h-[36px] px-3 font-mono text-xs text-brand border border-brand-line bg-brand-dim cut-corner-tag hover:brightness-110"
            >
              {c.label}
              <span aria-hidden="true" className="text-sm leading-none">×</span>
            </button>
          ))}
          {chips.length > 1 && (
            <Button
              variant="ghost"
              className="min-h-[36px] px-2 py-1 text-xs"
              onClick={() => {
                updateQuery('')
                updateYear(null)
                setOutcome(null)
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      <Label className="mb-5" aria-live="polite">{status}</Label>

      {sorted === null && (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[100px] cut-corner-tag" />
          ))}
        </div>
      )}
      {shown && shown.length === 0 && <EmptyState>No matches found for this search and filter.</EmptyState>}

      {shown && shown.length > 0 && view === 'list' && (
        <div ref={listRef} onKeyDown={onListKeyDown} className="flex flex-col gap-2.5">
          {shown.map((m, i) => renderCard(m, i))}
        </div>
      )}

      {shown && shown.length > 0 && view === 'event' && (
        <div ref={listRef} onKeyDown={onListKeyDown} className="flex flex-col gap-8">
          {groups.map(([event, items]) => {
            const sweeps = items.filter((m) => outcomeOf(m) === 'sweep').length
            const close = items.filter((m) => outcomeOf(m) === 'close').length
            return (
              <section key={event} aria-label={event}>
                <header className="sticky top-2 z-20 flex items-center justify-between gap-4 mb-3 py-2 px-3 bg-bg/90 backdrop-blur-sm border border-line cut-corner-tag">
                  <div className="min-w-0">
                    <div className="font-display text-base font-semibold truncate">{event}</div>
                    <div className="font-mono text-[11px] text-ink-faint tabular-nums">
                      {items.length} series, {sweeps} sweeps, {close} close
                    </div>
                  </div>
                  <div className="flex h-1.5 w-24 shrink-0 overflow-hidden bg-line-soft" aria-hidden="true">
                    <div className="h-full bg-brand" style={{ width: `${(sweeps / items.length) * 100}%` }} />
                    <div className="h-full bg-mvp" style={{ width: `${(close / items.length) * 100}%` }} />
                  </div>
                </header>
                <div className="flex flex-col gap-2.5">{items.map((m, i) => renderCard(m, i))}</div>
              </section>
            )
          })}
        </div>
      )}

      {canShowMore && (
        <div className="flex justify-center mt-6">
          <Button variant="secondary" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
            Show more ({matches.length} of {total})
          </Button>
        </div>
      )}
    </div>
  )
}
