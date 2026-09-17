import { useEffect, useState } from 'react'
import { getOverview } from '../lib/api'
import { Panel, SectionHeader, EmptyState, LoadingState } from '../components/ui'
import PlayerPortrait from '../components/PlayerPortrait'

export default function Players() {
  const [players, setPlayers] = useState(null)

  useEffect(() => {
    getOverview().then((stats) => setPlayers(stats.top_players || []))
  }, [])

  return (
    <div className="fade-up">
      <SectionHeader className="text-xl">Top players</SectionHeader>
      <p className="text-[13px] text-ink-dim mb-5">Ranked by average ACS across the loaded season (minimum 10 maps played).</p>
      <Panel className="p-5">
        {players === null && <LoadingState />}
        {players && players.length === 0 && <EmptyState>No players loaded.</EmptyState>}
        {players?.map((p, i) => (
          <div key={p.name} className="flex items-center gap-3 py-2.5 border-t border-line-soft first:border-t-0">
            <span className="font-mono text-xs text-ink-faint w-5">#{i + 1}</span>
            <PlayerPortrait color="var(--color-brand)" size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{p.name}</div>
              <div className="text-[11px] text-ink-faint">{p.team} · {p.maps} maps</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-sm text-brand">
                {p.acs} <span className="text-[10px] text-ink-faint">ACS</span>
              </div>
              <div className="font-mono text-[11px] text-ink-faint">{p.rating} rtg</div>
            </div>
          </div>
        ))}
      </Panel>
    </div>
  )
}
