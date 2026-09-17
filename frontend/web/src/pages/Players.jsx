import { useEffect, useState } from 'react'
import { getPlayersLeaderboard } from '../lib/api'
import { Panel, SectionHeader, EmptyState, LoadingState } from '../components/ui'
import PlayerPortrait from '../components/PlayerPortrait'

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

  useEffect(() => {
    setPlayers(null)
    getPlayersLeaderboard({ metric, limit: 20 }).then(({ players }) => setPlayers(players))
  }, [metric])

  const activeLabel = METRICS.find((m) => m.value === metric)?.label || metric

  return (
    <div className="fade-up">
      <SectionHeader className="text-xl">Top players</SectionHeader>
      <p className="text-[13px] text-ink-dim mb-4">
        Top 20, ranked by average {activeLabel.toLowerCase()} across all loaded seasons (minimum 10 maps played).
      </p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {METRICS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMetric(m.value)}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono border transition-colors ${
              metric === m.value
                ? 'text-brand border-brand-line bg-brand-dim'
                : 'text-ink-dim border-line hover:text-ink hover:border-ink-faint'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Panel className="p-5">
        {players === null && <LoadingState />}
        {players && players.length === 0 && <EmptyState>No players loaded.</EmptyState>}
        {players?.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3 py-2.5 border-t border-line-soft first:border-t-0">
            <span className="font-mono text-xs text-ink-faint w-6 shrink-0">#{i + 1}</span>
            <PlayerPortrait color="var(--color-brand)" size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{p.name}</div>
              <div className="text-[11px] text-ink-faint">{p.team} · {p.maps} maps</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-sm text-brand">
                {formatValue(metric, p.value)} <span className="text-[10px] text-ink-faint">{activeLabel}</span>
              </div>
              {metric !== 'rating' && <div className="font-mono text-[11px] text-ink-faint">{p.rating ?? '—'} rtg</div>}
            </div>
          </div>
        ))}
      </Panel>
    </div>
  )
}
