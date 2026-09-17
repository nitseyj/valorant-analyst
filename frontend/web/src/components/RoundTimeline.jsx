import { Panel, SectionHeader } from './ui'
import { WinMethodGlyph } from './icons'

export default function RoundTimeline({ games, teamA, teamB }) {
  if (!games || games.length === 0) return null

  return (
    <Panel className="p-5">
      <SectionHeader>Round timeline</SectionHeader>
      <div className="flex flex-wrap gap-3 text-[11px] text-ink-faint mb-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[2px] bg-brand inline-block" /> {teamA}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[2px] bg-team-b inline-block" /> {teamB}
        </span>
        <span className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1"><WinMethodGlyph method="Elimination" /> elimination</span>
          <span className="flex items-center gap-1"><WinMethodGlyph method="Defused" /> defused</span>
          <span className="flex items-center gap-1"><WinMethodGlyph method="Detonated" /> detonated</span>
          <span className="flex items-center gap-1"><WinMethodGlyph method="Time Expiry (No Plant)" /> time expiry</span>
        </span>
      </div>
      <div className="flex flex-col gap-3.5">
        {games.map((g) => (
          <div key={g.game_id}>
            <div className="text-[11px] text-ink-dim mb-1.5">{g.map}</div>
            <div className="flex flex-wrap gap-[3px]">
              {g.rounds.map((r) => {
                const color = r.winner === 'a' ? 'var(--color-brand)' : 'var(--color-team-b)'
                return (
                  <div
                    key={r.round}
                    title={`Round ${r.round}: ${r.method}`}
                    className="w-5 h-5 flex items-center justify-center rounded-sm border text-[10px]"
                    style={{ background: `${color}22`, borderColor: color, color }}
                  >
                    <WinMethodGlyph method={r.method} />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
