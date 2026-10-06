import { useEffect, useRef, useState } from 'react'
import { getPlayersLeaderboard, getPlayerRadar, searchPlayers } from '../lib/api'
import { useCountUp } from '../lib/hooks'
import { Panel, Label, SectionHeader, Button, EmptyState, LoadingState, Skeleton } from '../components/ui'
import PlayerPortrait from '../components/PlayerPortrait'
import RadarChart from '../components/RadarChart'
import { CompareIcon, SearchIcon } from '../components/icons'

const METRICS = [
  { value: 'rating', label: 'Rating' },
  { value: 'acs', label: 'ACS' },
  { value: 'adr', label: 'ADR' },
  { value: 'kast', label: 'KAST%' },
  { value: 'hs', label: 'HS%' },
]
const VIEWS = [
  { key: 'board', label: 'Board' },
  { key: 'scatter', label: 'Scatter' },
]

const TIER_COLOR = ['var(--color-mvp)', 'var(--color-team-b)', 'var(--color-brand)']
const COLOR_A = 'var(--color-brand)'
const COLOR_B = 'var(--color-team-b)'
const MAX_COMPARE = 2
const PLOT = { w: 720, h: 420, l: 56, r: 24, t: 20, b: 44 }

function isPercent(metric) {
  return metric === 'kast' || metric === 'hs'
}

function formatValue(metric, value) {
  if (value == null) return '-'
  return isPercent(metric) ? `${value}%` : value
}

// Count-up keeps the number of decimals the real value has, so the final
// frame matches the exact figure shown in the table.
function decimalsOf(n) {
  const [, fraction = ''] = String(n).split('.')
  return fraction.length
}

function formatAnimated(metric, value, decimals) {
  const shown = value.toFixed(decimals)
  return isPercent(metric) ? `${shown}%` : shown
}

function formatAxis(axis) {
  if (axis.value == null) return '-'
  return axis.is_percentage ? `${axis.value}%` : axis.value
}

// Top three in podium order: second, first, third. The step heights are
// fixed by rank, not by value, so the podium shows order without implying
// a scale. The values are printed on each player.
function Podium({ top, metric, selected, onToggle }) {
  const order = [top[1], top[0], top[2]].filter(Boolean)
  const heights = { 1: 'h-28', 0: 'h-40', 2: 'h-20' }
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-2xl mx-auto mb-8">
      {order.map((p) => {
        const rank = top.indexOf(p)
        const isSelected = selected.some((s) => s.name === p.name)
        const color = TIER_COLOR[rank]
        return (
          <div key={p.name} className="rise-in flex flex-col items-center gap-3 min-w-0" style={{ animationDelay: `${rank * 120}ms` }}>
            <PlayerPortrait agent={p.best_agent} color={color} size={rank === 0 ? 92 : 72} />
            <div className="text-center min-w-0 w-full">
              <div className="text-sm font-semibold truncate">{p.name}</div>
              <div className="font-mono text-xs tabular-nums" style={{ color }}>{formatValue(metric, p.value)}</div>
            </div>
            <div
              className={`w-full ${heights[rank]} cut-corner-tag relative flex items-start justify-center pt-3 border border-line overflow-hidden`}
              style={{ background: `linear-gradient(to bottom, color-mix(in srgb, ${color} 22%, transparent), transparent)` }}
            >
              <span className="font-display text-3xl font-bold" style={{ color }} aria-hidden="true">{rank + 1}</span>
              <span className="sr-only">Rank {rank + 1}</span>
            </div>
            <button
              type="button"
              onClick={() => onToggle(p)}
              aria-pressed={isSelected}
              className={`min-h-[36px] px-3 font-mono text-[11px] border cut-corner-tag transition-colors ${
                isSelected ? 'text-brand border-brand-line bg-brand-dim' : 'text-ink-dim border-line hover:text-ink'
              }`}
            >
              {isSelected ? 'Comparing' : 'Compare'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// Add any player to the comparison, including ones outside the top 20. Search
// runs as you type; a pick is handed to the parent as a full player object.
function AddPlayer({ onAdd, disabled }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [active, setActive] = useState(0)
  const timer = useRef(null)
  const listId = 'player-add-list'

  function onChange(e) {
    const val = e.target.value
    setQuery(val)
    setActive(0)
    clearTimeout(timer.current)
    if (val.trim().length < 2) {
      setResults([])
      return
    }
    timer.current = setTimeout(async () => {
      const found = await searchPlayers(val.trim())
      setResults((found || []).slice(0, 8))
    }, 250)
  }

  function pick(p) {
    onAdd(p)
    setQuery('')
    setResults([])
  }

  function onKeyDown(e) {
    if (results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pick(results[active])
    } else if (e.key === 'Escape') {
      setResults([])
    }
  }

  return (
    <div className="relative w-full sm:w-72">
      <label className="block">
        <span className="sr-only">Add a player to compare</span>
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
          <SearchIcon size={15} />
        </span>
        <input
          type="text"
          value={query}
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
          placeholder={disabled ? 'Comparison is full' : 'Add any player…'}
          className="w-full bg-panel border border-line text-ink text-sm py-2.5 pl-10 pr-3 font-mono cut-corner-tag focus-visible:border-brand placeholder:text-ink-faint disabled:opacity-50"
        />
      </label>
      {results.length > 0 && (
        <ul id={listId} role="listbox" aria-label="Matching players" className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 bg-panel-raised border border-line shadow-2xl max-h-64 overflow-y-auto">
          {results.map((p, i) => (
            <li
              key={`${p.name}-${i}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(p)
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${i === active ? 'bg-panel' : ''}`}
            >
              <PlayerPortrait agent={p.best_agent} color="var(--color-brand)" size={30} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{p.name}</div>
                <div className="text-xs text-ink-faint truncate">{p.team || 'Unknown team'}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Real values for each stat, side by side. The stronger value is bold and
// tinted with its player's colour, so the comparison reads without the radar.
function ComparisonTable({ a, b }) {
  return (
    <div className="rise-in overflow-x-auto">
      <table className="w-full max-w-xl mx-auto border-collapse font-mono text-sm">
        <caption className="sr-only">Real stat values for each player, with the stronger value in bold</caption>
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.14em]">
            <th scope="col" className="text-left font-normal text-ink-faint py-2">Stat</th>
            <th scope="col" className="text-right font-semibold py-2" style={{ color: COLOR_A }}>{a.name}</th>
            <th scope="col" className="text-right font-semibold py-2" style={{ color: COLOR_B }}>{b.name}</th>
          </tr>
        </thead>
        <tbody>
          {a.axes.map((axis, i) => {
            const av = axis.value
            const bv = b.axes[i]?.value
            const bothNumbers = typeof av === 'number' && typeof bv === 'number'
            const aLeads = bothNumbers && av > bv
            const bLeads = bothNumbers && bv > av
            return (
              <tr key={axis.metric} className="border-t border-line-soft">
                <th scope="row" className="text-left font-normal text-ink-dim py-2.5">{axis.label}</th>
                <td className={`text-right tabular-nums py-2.5 ${aLeads ? 'font-semibold' : 'text-ink-dim'}`} style={aLeads ? { color: COLOR_A } : undefined}>
                  {formatAxis(axis)}
                </td>
                <td className={`text-right tabular-nums py-2.5 ${bLeads ? 'font-semibold' : 'text-ink-dim'}`} style={bLeads ? { color: COLOR_B } : undefined}>
                  {formatAxis(b.axes[i] ?? { value: null })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Every ranked player as a dot: x is the selected metric, y is rating. The
// dots use the same list as the board, and clicking one toggles comparison.
function MetricScatter({ players, metric, selected, onToggle }) {
  const [hovered, setHovered] = useState(null)
  const points = players.filter((p) => p.value != null && p.rating != null)
  if (points.length === 0) return <EmptyState>No players with both values loaded.</EmptyState>
  const xs = points.map((p) => p.value)
  const ys = points.map((p) => p.rating)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const pad = (lo, hi) => (hi - lo) * 0.08 || 1
  const x0 = xMin - pad(xMin, xMax)
  const x1 = xMax + pad(xMin, xMax)
  const y0 = yMin - pad(yMin, yMax)
  const y1 = yMax + pad(yMin, yMax)
  const plotW = PLOT.w - PLOT.l - PLOT.r
  const plotH = PLOT.h - PLOT.t - PLOT.b
  const px = (p) => PLOT.l + ((p.value - x0) / (x1 - x0)) * plotW
  const py = (p) => PLOT.t + (1 - (p.rating - y0) / (y1 - y0)) * plotH
  const current = hovered ? points.find((p) => p.name === hovered) : null
  const isSelected = (name) => selected.some((s) => s.name === name)
  const label = METRICS.find((m) => m.value === metric)?.label || metric

  return (
    <div className="relative cut-corner-sm bg-panel border border-line p-4 md:p-6">
      <div className="relative w-full" style={{ aspectRatio: `${PLOT.w} / ${PLOT.h}` }}>
        <svg viewBox={`0 0 ${PLOT.w} ${PLOT.h}`} className="absolute inset-0 w-full h-full" role="img" aria-label={`Scatter of ${label} against rating for the top players`}>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line key={f} x1={PLOT.l} x2={PLOT.w - PLOT.r} y1={PLOT.t + f * plotH} y2={PLOT.t + f * plotH} stroke="var(--color-line-soft)" />
          ))}
          <text x={PLOT.l + plotW / 2} y={PLOT.h - 6} textAnchor="middle" fontSize="11" fill="var(--color-ink-dim)" fontFamily="IBM Plex Mono">{label}</text>
          <text x={14} y={PLOT.t + plotH / 2} textAnchor="middle" fontSize="11" fill="var(--color-ink-dim)" fontFamily="IBM Plex Mono" transform={`rotate(-90 14 ${PLOT.t + plotH / 2})`}>Rating</text>
          {points.map((p) => {
            const on = isSelected(p.name)
            const hot = hovered === p.name
            return (
              <g
                key={p.name}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${p.name}, ${formatValue(metric, p.value)} ${label}, rating ${p.rating}`}
                onMouseEnter={() => setHovered(p.name)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(p.name)}
                onBlur={() => setHovered(null)}
                onClick={() => onToggle(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onToggle(p)
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                <circle
                  cx={px(p)}
                  cy={py(p)}
                  r={hot || on ? 7 : 4.5}
                  fill={on ? 'var(--color-brand)' : 'var(--color-team-b)'}
                  fillOpacity={hot || on ? 1 : 0.7}
                  stroke={hot ? 'var(--color-ink)' : 'none'}
                  strokeWidth="2"
                />
              </g>
            )
          })}
        </svg>
        {current && (
          <div
            className="pointer-events-none absolute z-10 whitespace-nowrap bg-panel-raised border border-line cut-corner-tag px-3 py-2 text-xs"
            style={{ left: `${(px(current) / PLOT.w) * 100}%`, top: `${(py(current) / PLOT.h) * 100}%`, transform: 'translate(-50%, calc(-100% - 12px))' }}
            aria-hidden="true"
          >
            <div className="font-semibold">{current.name}</div>
            <div className="font-mono text-ink-dim tabular-nums">{formatValue(metric, current.value)} {label}, rating {current.rating}</div>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-faint">Click a dot to add or remove that player from the comparison.</p>
    </div>
  )
}

export default function Players() {
  const [metric, setMetric] = useState('acs')
  const [view, setView] = useState('board')
  const [players, setPlayers] = useState(null)
  const [selected, setSelected] = useState([])
  const [radar, setRadar] = useState(undefined) // undefined = loading, null = failed
  const [radarRetry, setRadarRetry] = useState(0)

  useEffect(() => {
    let cancelled = false
    setPlayers(null)
    getPlayersLeaderboard({ metric, limit: 20 }).then(({ players }) => {
      if (!cancelled) setPlayers(players)
    })
    return () => {
      cancelled = true
    }
  }, [metric])

  useEffect(() => {
    if (selected.length === 0) {
      setRadar(undefined)
      return
    }
    let cancelled = false
    setRadar(undefined)
    getPlayerRadar(selected[0].name, selected[1]?.name).then((data) => {
      if (!cancelled) setRadar(data)
    })
    return () => {
      cancelled = true
    }
  }, [selected, radarRetry])

  // Comparisons hold the player object, not a reference into the leaderboard,
  // so a player stays selected when the metric changes the list.
  function toggleSelected(p) {
    setSelected((prev) => {
      if (prev.some((s) => s.name === p.name)) return prev.filter((s) => s.name !== p.name)
      const entry = { name: p.name, team: p.team, best_agent: p.best_agent }
      if (prev.length < MAX_COMPARE) return [...prev, entry]
      return [prev[1], entry]
    })
  }

  const activeIndex = Math.max(0, METRICS.findIndex((m) => m.value === metric))
  const activeLabel = METRICS[activeIndex]?.label || metric
  const leader = players?.[0] ?? null
  const topValue = leader?.value ?? null
  const animatedTop = useCountUp(topValue, 1200)
  const maxValue = players ? Math.max(0, ...players.map((p) => p.value ?? 0)) : 0
  const isSelected = (name) => selected.some((s) => s.name === name)

  return (
    <div className="fade-up">
      <section className="relative overflow-hidden cut-corner border border-line bg-panel px-6 md:px-9 py-8 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand" aria-hidden="true" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="min-w-0 max-w-xl">
            <Label tone="brand" className="mb-3">Players</Label>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Top players</h1>
            <p className="text-sm text-ink-dim mt-3 leading-relaxed">
              The top 20, ranked by average {activeLabel.toLowerCase()} across all loaded seasons (minimum 10 maps).
              Compare any two players, including ones outside the top 20.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 lg:gap-8 shrink-0">
            <div className="min-w-0">
              <dt><Label>Leader</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-2 truncate max-w-[12rem]">
                {players === null ? '…' : leader?.name ?? '-'}
              </dd>
            </div>
            <div>
              <dt><Label>Top {activeLabel}</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-2 tabular-nums text-brand">
                {players === null ? '…' : topValue == null ? '-' : formatAnimated(metric, animatedTop, decimalsOf(topValue))}
              </dd>
            </div>
            <div>
              <dt><Label>Ranked</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-2 tabular-nums" aria-live="polite">
                {players === null ? '…' : players.length}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="flex flex-col xl:flex-row xl:items-center gap-3 mb-6">
        <div role="group" aria-label="Ranking metric" className="relative grid grid-cols-5 w-full sm:w-auto sm:inline-grid p-1 bg-panel border border-line cut-corner-tag">
          <span
            aria-hidden="true"
            className="absolute top-1 bottom-1 left-1 bg-brand cut-corner-tag transition-transform duration-300 ease-out"
            style={{ width: `calc((100% - 8px) / ${METRICS.length})`, transform: `translateX(${activeIndex * 100}%)` }}
          />
          {METRICS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMetric(m.value)}
              aria-pressed={metric === m.value}
              className={`relative z-10 min-h-[40px] px-2 sm:px-0 sm:w-[92px] py-2 font-mono text-sm cut-corner-tag transition-colors ${
                metric === m.value ? 'text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Choose view" className="flex gap-1 p-1 bg-panel border border-line cut-corner-tag self-start">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              aria-pressed={view === v.key}
              onClick={() => setView(v.key)}
              className={`min-h-[40px] px-3.5 font-mono text-xs cut-corner-tag transition-colors ${
                view === v.key ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 xl:ml-auto">
          <AddPlayer
            disabled={selected.length >= MAX_COMPARE}
            onAdd={(p) => toggleSelected(p)}
          />
          <div className="flex items-center gap-3">
            <Label aria-live="polite">Selected {selected.length}/{MAX_COMPARE}</Label>
            {selected.length > 0 && (
              <Button variant="ghost" onClick={() => setSelected([])}>Clear</Button>
            )}
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <Panel className="p-5 md:p-6 mb-6 rise-in" accent={COLOR_A}>
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <SectionHeader className="mb-0">Stat profile comparison</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {selected.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => toggleSelected(s)}
                  aria-label={`Remove ${s.name} from comparison`}
                  className="inline-flex items-center gap-2 min-h-[36px] px-2.5 font-mono text-xs text-brand border border-brand-line bg-brand-dim cut-corner-tag"
                >
                  {s.name} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          </div>
          {radar === undefined && <Skeleton className="h-[340px]" />}
          {radar && radar.a && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-center">
                <RadarChart a={radar.a} b={radar.b} size={340} />
              </div>
              {radar.b?.axes && <ComparisonTable a={radar.a} b={radar.b} />}
            </div>
          )}
          {radar === null && (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-dim mb-3">Could not load the comparison. The backend may be slow to respond.</p>
              <Button variant="secondary" onClick={() => setRadarRetry((n) => n + 1)}>Retry</Button>
            </div>
          )}
          {selected.length === 1 && <p className="text-xs text-ink-faint text-center mt-5">Choose a second player to overlay a comparison.</p>}
        </Panel>
      )}

      {players === null && <LoadingState>Loading leaderboard</LoadingState>}
      {players && players.length === 0 && <EmptyState>No players loaded.</EmptyState>}

      {players && players.length > 0 && view === 'board' && (
        <>
          <Podium top={players.slice(0, 3)} metric={metric} selected={selected} onToggle={toggleSelected} />
          <Panel className="p-3 md:p-5">
            <ol className="flex flex-col">
              {players.map((p, i) => {
                const on = isSelected(p.name)
                const share = maxValue > 0 && p.value != null ? (p.value / maxValue) * 100 : 0
                const tier = i < TIER_COLOR.length ? TIER_COLOR[i] : null
                const delay = Math.min(i * 35, 700)
                return (
                  <li
                    key={p.name}
                    className={`rise-in relative flex items-center gap-3 md:gap-4 overflow-hidden px-2 md:px-4 py-3.5 border-t border-line-soft first:border-t-0 transition-colors ${
                      on ? 'bg-brand-dim' : 'hover:bg-panel-raised'
                    }`}
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    <span aria-hidden="true" className="grow-x absolute inset-y-0 left-0 bg-brand/[0.06] pointer-events-none" style={{ width: `${share}%`, animationDelay: `${delay + 120}ms` }} />
                    {tier && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: tier }} />}
                    <span className="relative font-mono text-sm w-6 md:w-8 shrink-0 tabular-nums font-semibold" style={{ color: tier ?? 'var(--color-ink-faint)' }}>
                      {i + 1}
                    </span>
                    <span className="relative shrink-0">
                      <PlayerPortrait agent={p.best_agent} color={tier ?? 'var(--color-brand)'} size={56} className="!w-11 !h-11 sm:!w-14 sm:!h-14" />
                    </span>
                    <div className="relative min-w-0 flex-1">
                      <div className="text-base font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-ink-faint truncate mt-0.5">{p.team} / {p.maps} maps</div>
                    </div>
                    <div className="relative text-right shrink-0">
                      <div className="font-mono text-base text-brand tabular-nums">
                        {formatValue(metric, p.value)} <span className="hidden sm:inline text-xs text-ink-faint">{activeLabel}</span>
                      </div>
                      {metric !== 'rating' && <div className="font-mono text-xs text-ink-faint mt-0.5 tabular-nums">{p.rating ?? '-'} rtg</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSelected(p)}
                      aria-pressed={on}
                      aria-label={`${on ? 'Remove' : 'Add'} ${p.name} ${on ? 'from' : 'to'} comparison`}
                      title={on ? 'Remove from comparison' : 'Add to comparison'}
                      className={`relative shrink-0 w-10 h-10 flex items-center justify-center border cut-corner-tag transition-colors ${
                        on ? 'text-brand border-brand-line bg-brand-dim' : 'text-ink-faint border-line hover:text-ink hover:border-ink-faint'
                      }`}
                    >
                      <CompareIcon size={17} />
                    </button>
                  </li>
                )
              })}
            </ol>
          </Panel>
        </>
      )}

      {players && players.length > 0 && view === 'scatter' && (
        <MetricScatter players={players} metric={metric} selected={selected} onToggle={toggleSelected} />
      )}
    </div>
  )
}
