import { useEffect, useState } from 'react'
import { getPlayersLeaderboard, getPlayerRadar } from '../lib/api'
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

function formatValue(metric, value) {
  if (value == null) return '-'
  return metric === 'kast' || metric === 'hs' ? `${value}%` : value
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

  const activeLabel = METRICS.find((m) => m.value === metric)?.label || metric

  return (
    <div className="fade-up">
      <header className="mb-7">
        <Label tone="brand" className="mb-2">Players</Label>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Top players</h1>
        <p className="text-sm text-ink-dim max-w-2xl leading-relaxed">
          The top 20, ranked by average {activeLabel.toLowerCase()} across all loaded seasons (minimum 10 maps).
          Choose up to two players to compare their stat profiles.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-6" role="group" aria-label="Ranking metric">
        {METRICS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMetric(m.value)}
            aria-pressed={metric === m.value}
            className={`px-4 py-2 font-mono text-sm border cut-corner-tag transition-colors ${
              metric === m.value
                ? 'text-brand border-brand-line bg-brand-dim'
                : 'text-ink-dim border-line hover:text-ink hover:border-ink-faint'
            }`}
          >
            {m.label}
          </button>
        ))}
        {selected.length > 0 && (
          <Button variant="ghost" className="ml-auto" onClick={() => setSelected([])}>
            Clear comparison ({selected.length}/2)
          </Button>
        )}
      </div>

      {selected.length > 0 && (
        <Panel className="p-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <SectionHeader className="mb-0">Stat profile comparison</SectionHeader>
            <Label>Each axis is scaled to the loaded player range</Label>
          </div>
          {radar === undefined && <Skeleton className="h-[340px]" />}
          {radar && radar.a && (
            <div className="flex justify-center">
              <RadarChart a={radar.a} b={radar.b} size={340} />
            </div>
          )}
          {radar === null && (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-dim mb-3">Could not load the comparison. The backend may be slow to respond.</p>
              <Button variant="secondary" onClick={() => setRadarRetry((n) => n + 1)}>Retry</Button>
            </div>
          )}
          {selected.length === 1 && <p className="text-xs text-ink-faint text-center mt-4">Choose a second player to overlay a comparison.</p>}
        </Panel>
      )}

      <Panel className="p-3 md:p-5">
        {players === null && <LoadingState>Loading leaderboard</LoadingState>}
        {players && players.length === 0 && <EmptyState>No players loaded.</EmptyState>}
        {players && players.length > 0 && (
          <ol className="flex flex-col">
            {players.map((p, i) => {
              const isSelected = selected.includes(p.name)
              return (
                <li
                  key={p.name}
                  className={`flex items-center gap-4 px-3 md:px-4 py-3.5 border-t border-line-soft first:border-t-0 transition-colors ${
                    isSelected ? 'bg-brand-dim' : 'hover:bg-panel-raised'
                  }`}
                >
                  <span className="font-mono text-sm text-ink-faint w-8 shrink-0 tabular-nums">{i + 1}</span>
                  <PlayerPortrait agent={p.best_agent} color="var(--color-brand)" size={56} />
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-ink-faint truncate mt-0.5">{p.team} / {p.maps} maps</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-base text-brand tabular-nums">
                      {formatValue(metric, p.value)} <span className="text-xs text-ink-faint">{activeLabel}</span>
                    </div>
                    {metric !== 'rating' && (
                      <div className="font-mono text-xs text-ink-faint mt-0.5 tabular-nums">{p.rating ?? '-'} rtg</div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSelected(p.name)}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? 'Remove' : 'Add'} ${p.name} ${isSelected ? 'from' : 'to'} comparison`}
                    title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
                    className={`shrink-0 w-10 h-10 flex items-center justify-center border cut-corner-tag transition-colors ${
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
