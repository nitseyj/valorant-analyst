import { useEffect, useMemo, useRef, useState } from 'react'
import { listTeams } from '../lib/api'
import { useCountUp, useSlashToFocus } from '../lib/hooks'
import { SearchIcon } from '../components/icons'
import { Label, EmptyState, Skeleton, Panel, SectionHeader } from '../components/ui'
import TeamBadge from '../components/TeamBadge'
import TeamWatermark from '../components/TeamWatermark'

const TIERS = [
  { key: 'tier1', label: 'Tier 1', description: 'Organisations that have played in Champions, an international Masters, or a franchised league split.' },
  { key: 'tier2', label: 'Tier 2', description: 'Every other loaded team: regional challengers, qualifiers and domestic leagues.' },
  { key: null, label: 'All teams', description: 'Every loaded team, including the slower full list.' },
]
const VIEWS = [
  { key: 'cards', label: 'Cards' },
  { key: 'table', label: 'Table' },
  { key: 'scatter', label: 'Scatter' },
]
const SORTS = [
  { key: 'winrate', label: 'Win rate' },
  { key: 'matches', label: 'Matches' },
  { key: 'wins', label: 'Wins' },
  { key: 'name', label: 'A to Z' },
]
const MAX_COMPARE = 2

// Win rate as a percentage, or a dash when the team has no rate yet.
const pct = (v) => (v == null ? '-' : `${(v * 100).toFixed(0)}%`)

// The list arrives ranked by win rate, so that order is kept as-is.
function sortTeams(teams, key) {
  const list = [...teams]
  if (key === 'matches') list.sort((a, b) => b.matches - a.matches)
  else if (key === 'wins') list.sort((a, b) => b.wins - a.wins)
  else if (key === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
  return list
}

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

function CompareToggle({ compared, disabled, onClick, name }) {
  return (
    <button
      type="button"
      aria-pressed={compared}
      disabled={disabled}
      onClick={onClick}
      aria-label={`${compared ? 'Remove' : 'Add'} ${name} ${compared ? 'from' : 'to'} comparison`}
      className={`min-h-[36px] px-2.5 font-mono text-[11px] border cut-corner-tag transition-colors disabled:opacity-40 disabled:pointer-events-none ${
        compared ? 'text-brand border-brand-line bg-brand-dim' : 'text-ink-dim border-line hover:text-ink hover:border-ink-faint'
      }`}
    >
      {compared ? 'Comparing' : 'Compare'}
    </button>
  )
}

function TeamCard({ team, rank, delay, onOpen, compared, compareDisabled, onCompare }) {
  const losses = team.matches - team.wins
  const featured = rank != null && rank <= 3
  return (
    <div
      className={`rise-in group relative overflow-hidden flex flex-col cut-corner-sm bg-panel [content-visibility:auto] [contain-intrinsic-size:auto_240px] ${
        featured ? 'shadow-[inset_0_0_0_1px_var(--color-brand-line)]' : 'shadow-[inset_0_0_0_1px_var(--color-line)]'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <TeamWatermark name={team.name} size={260} reveal className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${team.name}${rank != null ? `, rank ${rank}` : ''}, ${team.wins} wins and ${losses} losses`}
        className="lift relative z-10 flex flex-col gap-4 p-5 pb-4 flex-1 text-left hover:bg-panel-raised/60 transition-colors"
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
      <div className="relative z-10 px-5 pb-4 pt-1">
        <CompareToggle compared={compared} disabled={compareDisabled} onClick={() => onCompare(team.team_id)} name={team.name} />
      </div>
    </div>
  )
}

// Sortable table. Column headers are real buttons with aria-sort, so keyboard
// and screen reader users get the same sorting as mouse users.
function TeamTable({ teams, sortKey, onSort, rankOn, onOpen, compareIds, onCompare }) {
  const columns = [
    { key: 'name', label: 'Team' },
    { key: 'wins', label: 'W', align: 'right' },
    { key: 'losses', label: 'L', align: 'right' },
    { key: 'matches', label: 'Matches', align: 'right' },
    { key: 'winrate', label: 'Win rate', align: 'right' },
  ]
  const ariaSort = (key) => {
    if (sortKey !== key) return 'none'
    return key === 'name' ? 'ascending' : 'descending'
  }
  return (
    <div className="overflow-x-auto cut-corner-sm bg-panel border border-line">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">Teams. Use the column headers to sort.</caption>
        <thead>
          <tr className="border-b border-line">
            {rankOn && <th scope="col" className="w-12 py-3 px-4 text-left font-mono text-[11px] font-normal text-ink-faint">#</th>}
            {columns.map((c) => (
              <th key={c.key} scope="col" aria-sort={ariaSort(c.key === 'losses' ? 'matches' : c.key)} className={`py-3 px-4 font-normal ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                <button
                  type="button"
                  onClick={() => onSort(c.key === 'losses' ? 'matches' : c.key)}
                  className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink min-h-[36px]"
                >
                  {c.label}
                </button>
              </th>
            ))}
            <th scope="col" className="py-3 px-4 text-right font-mono text-[11px] font-normal text-ink-faint">Compare</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t, i) => {
            const losses = t.matches - t.wins
            const compared = compareIds.includes(t.team_id)
            return (
              <tr key={t.team_id} className="rise-in border-t border-line-soft hover:bg-panel-raised transition-colors" style={{ animationDelay: `${Math.min(i * 25, 500)}ms` }}>
                {rankOn && <td className="py-3 px-4 font-mono text-xs text-ink-faint tabular-nums">{i + 1}</td>}
                <td className="py-3 px-4">
                  <button type="button" onClick={() => onOpen(t.team_id)} className="flex items-center gap-3 min-w-0 min-h-[36px] text-left">
                    <TeamBadge name={t.name} accent="team-b" size={32} />
                    <span className="font-semibold truncate hover:text-brand transition-colors">{t.name}</span>
                  </button>
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-win">{t.wins}</td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-brand">{losses}</td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">{t.matches}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-3">
                    <div className="w-24 hidden sm:block"><RecordBar wins={t.wins} matches={t.matches} delay={0} /></div>
                    <span className="font-mono tabular-nums w-12 text-right">{t.win_rate != null ? `${(t.win_rate * 100).toFixed(0)}%` : '-'}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <CompareToggle
                    compared={compared}
                    disabled={!compared && compareIds.length >= MAX_COMPARE}
                    onClick={() => onCompare(t.team_id)}
                    name={t.name}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Every team as a dot: x is matches played, y is win rate. Hovering or
// focusing a dot shows its record, and clicking it opens the profile.
const PLOT = { w: 720, h: 420, l: 56, r: 24, t: 20, b: 44 }

function TeamScatter({ teams, compareIds, onOpen }) {
  const [hovered, setHovered] = useState(null)
  const plotW = PLOT.w - PLOT.l - PLOT.r
  const plotH = PLOT.h - PLOT.t - PLOT.b
  const xMax = Math.max(10, Math.ceil(Math.max(...teams.map((t) => t.matches), 1) / 10) * 10)
  const px = (t) => PLOT.l + (t.matches / xMax) * plotW
  const py = (t) => PLOT.t + (1 - (t.win_rate ?? 0)) * plotH
  const current = hovered ? teams.find((t) => t.team_id === hovered) : null
  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="relative cut-corner-sm bg-panel border border-line p-4 md:p-6">
      <div className="relative w-full" style={{ aspectRatio: `${PLOT.w} / ${PLOT.h}` }}>
        <svg viewBox={`0 0 ${PLOT.w} ${PLOT.h}`} className="absolute inset-0 w-full h-full" role="img" aria-label="Scatter of teams by matches played and win rate">
          {yTicks.map((f) => (
            <g key={f}>
              <line x1={PLOT.l} x2={PLOT.w - PLOT.r} y1={PLOT.t + (1 - f) * plotH} y2={PLOT.t + (1 - f) * plotH} stroke={f === 0.5 ? 'var(--color-ink-faint)' : 'var(--color-line-soft)'} strokeDasharray={f === 0.5 ? '4 4' : undefined} />
              <text x={PLOT.l - 10} y={PLOT.t + (1 - f) * plotH + 4} textAnchor="end" fontSize="11" fill="var(--color-ink-faint)" fontFamily="IBM Plex Mono">
                {Math.round(f * 100)}%
              </text>
            </g>
          ))}
          {[0, xMax / 2, xMax].map((v) => (
            <text key={v} x={PLOT.l + (v / xMax) * plotW} y={PLOT.h - PLOT.b + 22} textAnchor="middle" fontSize="11" fill="var(--color-ink-faint)" fontFamily="IBM Plex Mono">
              {Math.round(v)}
            </text>
          ))}
          <text x={PLOT.l + plotW / 2} y={PLOT.h - 6} textAnchor="middle" fontSize="11" fill="var(--color-ink-dim)" fontFamily="IBM Plex Mono">
            Matches played
          </text>
          <text x={14} y={PLOT.t + plotH / 2} textAnchor="middle" fontSize="11" fill="var(--color-ink-dim)" fontFamily="IBM Plex Mono" transform={`rotate(-90 14 ${PLOT.t + plotH / 2})`}>
            Win rate
          </text>
          {teams.map((t) => {
            const compared = compareIds.includes(t.team_id)
            const isHover = hovered === t.team_id
            return (
              <g
                key={t.team_id}
                role="button"
                tabIndex={0}
                aria-label={`${t.name}, ${t.wins} wins and ${t.matches - t.wins} losses, ${t.matches} matches`}
                onMouseEnter={() => setHovered(t.team_id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(t.team_id)}
                onBlur={() => setHovered(null)}
                onClick={() => onOpen(t.team_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpen(t.team_id)
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                <circle
                  cx={px(t)}
                  cy={py(t)}
                  r={isHover || compared ? 7 : 4.5}
                  fill={compared ? 'var(--color-brand)' : 'var(--color-team-b)'}
                  fillOpacity={isHover || compared ? 1 : 0.7}
                  stroke={isHover ? 'var(--color-ink)' : 'none'}
                  strokeWidth="2"
                  style={{ transition: 'r 150ms ease-out' }}
                />
              </g>
            )
          })}
        </svg>
        {current && (
          <div
            className="pointer-events-none absolute z-10 whitespace-nowrap bg-panel-raised border border-line cut-corner-tag px-3 py-2 text-xs"
            style={{
              left: `${(px(current) / PLOT.w) * 100}%`,
              top: `${(py(current) / PLOT.h) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
            aria-hidden="true"
          >
            <div className="font-semibold">{current.name}</div>
            <div className="font-mono text-ink-dim tabular-nums">
              {current.wins}W / {current.matches - current.wins}L, {pct(current.win_rate)} over {current.matches} matches
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-faint">Dots in brand colour are in your comparison. Click a dot to open the team.</p>
    </div>
  )
}

// Side-by-side record of the selected teams, with the gap between them.
function ComparePanel({ teams, onClear, onOpen }) {
  if (teams.length === 0) return null
  const [a, b] = teams
  const gap = b && a.win_rate != null && b.win_rate != null ? (a.win_rate - b.win_rate) * 100 : null
  return (
    <Panel accent="var(--color-brand)" className="relative overflow-hidden p-5 md:p-6 mb-6 rise-in">
      {teams.map((t, i) => (
        <TeamWatermark
          key={t.team_id}
          name={t.name}
          size={380}
          className={i === 0 ? '-left-28 top-1/2 -translate-y-1/2' : '-right-28 top-1/2 -translate-y-1/2'}
        />
      ))}
      <div className="relative z-10 flex items-center justify-between gap-3 mb-5 flex-wrap">
        <SectionHeader className="mb-0">Comparison</SectionHeader>
        <button type="button" onClick={onClear} className="font-mono text-xs text-ink-dim hover:text-brand min-h-[40px] px-2">
          Clear
        </button>
      </div>
      <div className={`relative z-10 grid gap-6 ${b ? 'md:grid-cols-2' : ''}`}>
        {teams.map((t) => (
          <button key={t.team_id} type="button" onClick={() => onOpen(t.team_id)} className="group flex items-center gap-4 min-w-0 text-left">
            <TeamBadge name={t.name} accent="team-b" size={52} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-lg font-bold truncate group-hover:text-brand transition-colors">{t.name}</div>
              <div className="font-mono text-xs text-ink-dim tabular-nums mt-1">
                {t.wins}W / {t.matches - t.wins}L, {t.matches} matches
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-3xl font-bold text-win tabular-nums leading-none">{pct(t.win_rate)}</span>
                <span className="text-xs text-ink-faint">win rate</span>
              </div>
              <RecordBar wins={t.wins} matches={t.matches} delay={0} />
            </div>
          </button>
        ))}
      </div>
      {b && gap != null && (
        <p className="mt-5 font-mono text-xs text-ink-dim" aria-live="polite">
          {Math.abs(gap) < 0.05
            ? 'Identical win rates.'
            : `${gap > 0 ? a.name : b.name} has the higher win rate, by ${Math.abs(gap).toFixed(1)} points.`}
        </p>
      )}
      {!b && <p className="mt-5 text-xs text-ink-faint">Choose a second team to compare.</p>}
    </Panel>
  )
}

export default function Teams({ onOpenTeam }) {
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState('tier1')
  const [teams, setTeams] = useState(null)
  const [view, setView] = useState('cards')
  const [sortKey, setSortKey] = useState('winrate')
  const [compareIds, setCompareIds] = useState([])
  // Teams seen so far, keyed by id. The comparison outlives the search, so a
  // compared team stays in the panel even when the current list filters it out.
  const [known, setKnown] = useState({})
  const searchRef = useRef(null)
  useSlashToFocus(searchRef)

  useEffect(() => {
    if (teams) setKnown((prev) => ({ ...prev, ...Object.fromEntries(teams.map((t) => [t.team_id, t])) }))
  }, [teams])

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
  const sorted = useMemo(() => (teams ? sortTeams(teams, sortKey) : null), [teams, sortKey])
  const rankOn = sortKey === 'winrate' && !query
  const count = useCountUp(teams ? teams.length : null, 900)
  const leader = teams && teams.length ? teams.reduce((best, t) => (t.win_rate > best.win_rate ? t : best), teams[0]) : null
  const mostPlayed = teams && teams.length ? teams.reduce((best, t) => (t.matches > best.matches ? t : best), teams[0]) : null
  const selected = compareIds.map((id) => known[id]).filter(Boolean)

  function toggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length < MAX_COMPARE) return [...prev, id]
      return [prev[1], id]
    })
  }

  function sortBy(key) {
    setSortKey(key)
  }

  return (
    <div className="fade-up">
      <section className="relative overflow-hidden cut-corner border border-line bg-panel px-6 md:px-9 py-8 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand" aria-hidden="true" />
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="min-w-0 max-w-xl">
            <Label tone="brand" className="mb-3">Teams</Label>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Browse teams</h1>
            <p className="text-sm text-ink-dim mt-3 leading-relaxed">
              Ranked by all-time win rate, with at least 10 matches to rank. Switch between cards, a sortable table, and a
              scatter of matches against win rate. Compare any two teams.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 xl:gap-8 shrink-0">
            <div>
              <dt><Label>Teams shown</Label></dt>
              <dd className="font-display text-3xl md:text-4xl font-bold tabular-nums mt-2" aria-live="polite">
                {teams ? Math.round(count).toLocaleString() : '…'}
              </dd>
            </div>
            <div className="min-w-0">
              <dt><Label>Best win rate</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-3 truncate max-w-[10rem]">
                {leader ? `${leader.name}` : '…'}
              </dd>
              {leader && <div className="font-mono text-xs text-win tabular-nums">{(leader.win_rate * 100).toFixed(0)}%</div>}
            </div>
            <div className="min-w-0">
              <dt><Label>Most matches</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-3 truncate max-w-[10rem]">
                {mostPlayed ? mostPlayed.name : '…'}
              </dd>
              {mostPlayed && <div className="font-mono text-xs text-ink-dim tabular-nums">{mostPlayed.matches} matches</div>}
            </div>
          </dl>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
        <div className="relative flex-1 max-w-xl">
          <label className="block">
            <span className="sr-only">Search teams</span>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-ink-faint pointer-events-none">
              <SearchIcon size={17} />
            </span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search teams…"
              className="w-full bg-panel border border-line text-ink text-sm py-3 pl-11 pr-11 font-mono cut-corner-tag focus-visible:border-brand placeholder:text-ink-faint"
            />
          </label>
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 font-mono text-ink-faint hover:text-brand">
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <p className="text-xs text-ink-faint max-w-2xl">
          {active.description} Tiers come from real tournament names in the loaded data, not an official designation.
        </p>
        <div className="flex flex-wrap gap-2 shrink-0">
          <div role="group" aria-label="Sort teams" className="flex gap-1 p-1 bg-panel border border-line cut-corner-tag">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                aria-pressed={sortKey === s.key}
                onClick={() => sortBy(s.key)}
                className={`min-h-[36px] px-2.5 font-mono text-[11px] cut-corner-tag transition-colors ${
                  sortKey === s.key ? 'bg-panel-raised text-brand border border-brand-line' : 'text-ink-dim hover:text-ink border border-transparent'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Choose view" className="flex gap-1 p-1 bg-panel border border-line cut-corner-tag">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-pressed={view === v.key}
                onClick={() => setView(v.key)}
                className={`min-h-[36px] px-2.5 font-mono text-[11px] cut-corner-tag transition-colors ${
                  view === v.key ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ComparePanel teams={selected} onClear={() => setCompareIds([])} onOpen={onOpenTeam} />

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

      {sorted && sorted.length > 0 && view === 'cards' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sorted.map((t, i) => (
            <TeamCard
              key={t.team_id}
              team={t}
              rank={rankOn ? i + 1 : null}
              delay={Math.min(i * 40, 720)}
              onOpen={() => onOpenTeam(t.team_id)}
              compared={compareIds.includes(t.team_id)}
              compareDisabled={!compareIds.includes(t.team_id) && compareIds.length >= MAX_COMPARE}
              onCompare={toggleCompare}
            />
          ))}
        </div>
      )}
      {sorted && sorted.length > 0 && view === 'table' && (
        <TeamTable teams={sorted} sortKey={sortKey} onSort={sortBy} rankOn={rankOn} onOpen={onOpenTeam} compareIds={compareIds} onCompare={toggleCompare} />
      )}
      {sorted && sorted.length > 0 && view === 'scatter' && (
        <TeamScatter teams={sorted} compareIds={compareIds} onOpen={onOpenTeam} />
      )}
    </div>
  )
}
