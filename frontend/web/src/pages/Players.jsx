import { useEffect, useState } from 'react'
import { getPlayersLeaderboard, getPlayerRadar } from '../lib/api'
import { useCountUp } from '../lib/hooks'
import { Panel, Label, SectionHeader, Button, EmptyState, LoadingState, Skeleton } from '../components/ui'
import PlayerPortrait from '../components/PlayerPortrait'
import RadarChart from '../components/RadarChart'
import { CompareIcon } from '../components/icons'

const METRICS = [
  { value: 'rating', label: 'Rating' },
  { value: 'acs', label: 'ACS' },
  { value: 'adr', label: 'ADR' },
  { value: 'kast', label: 'KAST%' },
  { value: 'hs', label: 'HS%' },
]

// Gold, silver and bronze style tiers for the top three rows.
const TIER_COLOR = ['var(--color-mvp)', 'var(--color-team-b)', 'var(--color-brand)']
const COLOR_A = 'var(--color-brand)'
const COLOR_B = 'var(--color-team-b)'

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

// Real values for each stat, side by side. The stronger value is bold so the
// comparison reads without the radar.
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
                <td className={`text-right tabular-nums py-2.5 ${aLeads ? 'font-semibold text-ink' : 'text-ink-dim'}`}>
                  {formatAxis(axis)}
                </td>
                <td className={`text-right tabular-nums py-2.5 ${bLeads ? 'font-semibold text-ink' : 'text-ink-dim'}`}>
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

export default function Players() {
  const [metric, setMetric] = useState('acs')
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
    getPlayerRadar(selected[0], selected[1]).then((data) => {
      if (!cancelled) setRadar(data)
    })
    return () => {
      cancelled = true
    }
  }, [selected, radarRetry])

  function toggleSelected(name) {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name)
      if (prev.length < 2) return [...prev, name]
      return [prev[1], name] // keep the most recent pick and the new one
    })
  }

  const activeIndex = Math.max(0, METRICS.findIndex((m) => m.value === metric))
  const activeLabel = METRICS[activeIndex]?.label || metric
  const leader = players?.[0] ?? null
  const topValue = leader?.value ?? null
  const animatedTop = useCountUp(topValue, 1200)
  const maxValue = players ? Math.max(0, ...players.map((p) => p.value ?? 0)) : 0

  return (
    <div className="fade-up">
      <section className="relative overflow-hidden cut-corner border border-line bg-panel px-6 md:px-9 py-8 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand" aria-hidden="true" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="min-w-0">
            <Label tone="brand" className="mb-3">Players</Label>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Top players</h1>
            <p className="text-sm text-ink-dim mt-3 max-w-2xl leading-relaxed">
              The top 20, ranked by average {activeLabel.toLowerCase()} across all loaded seasons (minimum 10 maps).
              Choose up to two players to compare their stat profiles.
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

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div
          role="group"
          aria-label="Ranking metric"
          className="relative grid grid-cols-5 w-full sm:w-auto sm:inline-grid p-1 bg-panel border border-line cut-corner-tag"
        >
          <span
            aria-hidden="true"
            className="absolute top-1 bottom-1 left-1 bg-brand cut-corner-tag transition-transform duration-300 ease-out"
            style={{
              width: `calc((100% - 8px) / ${METRICS.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
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
        <div className="flex items-center gap-3 ml-auto">
          <Label aria-live="polite">Selected {selected.length}/2</Label>
          {selected.length > 0 && (
            <Button variant="ghost" onClick={() => setSelected([])}>
              Clear comparison
            </Button>
          )}
        </div>
      </div>

      {selected.length > 0 && (
        <Panel className="p-5 md:p-6 mb-6 rise-in" accent={COLOR_A}>
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <SectionHeader className="mb-0">Stat profile comparison</SectionHeader>
            <Label>Each axis is scaled to the loaded player range</Label>
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

      <Panel className="p-3 md:p-5">
        {players === null && <LoadingState>Loading leaderboard</LoadingState>}
        {players && players.length === 0 && <EmptyState>No players loaded.</EmptyState>}
        {players && players.length > 0 && (
          <ol className="flex flex-col">
            {players.map((p, i) => {
              const isSelected = selected.includes(p.name)
              const share = maxValue > 0 && p.value != null ? (p.value / maxValue) * 100 : 0
              const tier = i < TIER_COLOR.length ? TIER_COLOR[i] : null
              const delay = Math.min(i * 35, 700)
              return (
                <li
                  key={p.name}
                  className={`rise-in relative flex items-center gap-3 md:gap-4 overflow-hidden px-2 md:px-4 py-3.5 border-t border-line-soft first:border-t-0 transition-colors ${
                    isSelected ? 'bg-brand-dim' : 'hover:bg-panel-raised'
                  }`}
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <span
                    aria-hidden="true"
                    className="grow-x absolute inset-y-0 left-0 bg-brand/[0.06] pointer-events-none"
                    style={{ width: `${share}%`, animationDelay: `${delay + 120}ms` }}
                  />
                  {tier && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: tier }} />}
                  <span
                    className="relative font-mono text-sm w-6 md:w-8 shrink-0 tabular-nums font-semibold"
                    style={{ color: tier ?? 'var(--color-ink-faint)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="relative shrink-0">
                    <PlayerPortrait
                      agent={p.best_agent}
                      color={tier ?? 'var(--color-brand)'}
                      size={56}
                      className="!w-11 !h-11 sm:!w-14 sm:!h-14"
                    />
                  </span>
                  <div className="relative min-w-0 flex-1">
                    <div className="text-base font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-ink-faint truncate mt-0.5">{p.team} / {p.maps} maps</div>
                  </div>
                  <div className="relative text-right shrink-0">
                    <div className="font-mono text-base text-brand tabular-nums">
                      {formatValue(metric, p.value)} <span className="hidden sm:inline text-xs text-ink-faint">{activeLabel}</span>
                    </div>
                    {metric !== 'rating' && (
                      <div className="font-mono text-xs text-ink-faint mt-0.5 tabular-nums">{p.rating ?? '-'} rtg</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSelected(p.name)}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? 'Remove' : 'Add'} ${p.name} ${isSelected ? 'from' : 'to'} comparison`}
                    title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
                    className={`relative shrink-0 w-10 h-10 flex items-center justify-center border cut-corner-tag transition-colors ${
                      isSelected ? 'text-brand border-brand-line bg-brand-dim' : 'text-ink-faint border-line hover:text-ink hover:border-ink-faint'
                    }`}
                  >
                    <CompareIcon size={17} />
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </Panel>
    </div>
  )
}
