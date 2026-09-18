import { useEffect, useState } from 'react'
import { getPlayersLeaderboard, getPlayerRadar } from '../lib/api'
import { Panel, SectionHeader, EmptyState, LoadingState } from '../components/ui'
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
  if (value == null) return '—'
  return metric === 'kast' || metric === 'hs' ? `${value}%` : value
}

export default function Players() {
  const [metric, setMetric] = useState('acs')
  const [players, setPlayers] = useState(null)
  const [selected, setSelected] = useState([])
  const [radar, setRadar] = useState(undefined) // undefined = loading; null = fetch resolved but failed — see render below
  const [radarRetry, setRadarRetry] = useState(0)

  useEffect(() => {
    setPlayers(null)
    getPlayersLeaderboard({ metric, limit: 20 }).then(({ players }) => setPlayers(players))
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
      return [prev[1], name] // swap out the older pick, keep the most recent + the new one
    })
  }

  const activeLabel = METRICS.find((m) => m.value === metric)?.label || metric

  return (
    <div className="fade-up">
      <SectionHeader className="text-2xl">Top players</SectionHeader>
      <p className="text-sm text-ink-dim mb-6">
        Top 20, ranked by average {activeLabel.toLowerCase()} across all loaded seasons (minimum 10 maps played).
        Pick up to two players to compare their stat profile.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-7">
        {METRICS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMetric(m.value)}
            className={`px-4 py-2.5 rounded-sm text-sm font-mono border transition-colors ${
              metric === m.value
                ? 'text-brand border-brand-line bg-brand-dim'
                : 'text-ink-dim border-line hover:text-ink hover:border-ink-faint'
            }`}
          >
            {m.label}
          </button>
        ))}
        {selected.length > 0 && (
          <button
            onClick={() => setSelected([])}
            className="ml-auto px-4 py-2.5 rounded-sm text-sm font-mono border border-line text-ink-dim hover:text-ink hover:border-ink-faint"
          >
            clear comparison ({selected.length}/2)
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <Panel className="p-6 mb-7">
          <div className="font-mono text-xs text-ink-faint mb-4">STAT PROFILE COMPARISON</div>
          {radar === undefined && <LoadingState>loading stat profile…</LoadingState>}
          {radar && radar.a && (
            <div className="flex justify-center">
              <RadarChart a={radar.a} b={radar.b} size={340} />
            </div>
          )}
          {radar === null && (
            <EmptyState>
              Couldn't load the stat profile (backend unreachable or slow to respond).{' '}
              <button onClick={() => setRadarRetry((n) => n + 1)} className="text-brand underline underline-offset-2">
                retry
              </button>
            </EmptyState>
          )}
          {selected.length === 1 && <p className="text-xs text-ink-faint text-center mt-3">pick a second player to overlay a comparison.</p>}
        </Panel>
      )}

      <Panel className="p-6">
        {players === null && <LoadingState />}
        {players && players.length === 0 && <EmptyState>No players loaded.</EmptyState>}
        {players?.map((p, i) => {
          const isSelected = selected.includes(p.name)
          return (
            <div key={p.name} className="flex items-center gap-5 py-4 border-t border-line-soft first:border-t-0">
              <span className="font-mono text-sm text-ink-faint w-8 shrink-0">#{i + 1}</span>
              <PlayerPortrait agent={p.best_agent} color="var(--color-brand)" size={64} />
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold truncate">{p.name}</div>
                <div className="text-xs text-ink-faint mt-0.5">{p.team} · {p.maps} maps</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-base text-brand">
                  {formatValue(metric, p.value)} <span className="text-xs text-ink-faint">{activeLabel}</span>
                </div>
                {metric !== 'rating' && <div className="font-mono text-xs text-ink-faint mt-0.5">{p.rating ?? '—'} rtg</div>}
              </div>
              <button
                onClick={() => toggleSelected(p.name)}
                title={isSelected ? 'remove from comparison' : 'add to comparison'}
                className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-sm border transition-colors ${
                  isSelected ? 'text-brand border-brand-line bg-brand-dim' : 'text-ink-faint border-line hover:text-ink hover:border-ink-faint'
                }`}
              >
                <CompareIcon size={17} />
              </button>
            </div>
          )
        })}
      </Panel>
    </div>
  )
}
