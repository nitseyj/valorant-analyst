import { ExpandableRow } from './ui'
import PlayerPortrait from './PlayerPortrait'

function StatCell({ label, value }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-ink-faint">{label.toUpperCase()}</div>
      <div className="font-mono text-[13px]">{value ?? '—'}</div>
    </div>
  )
}

export default function PlayerStatRow({ pl, color = 'var(--color-brand)' }) {
  return (
    <ExpandableRow
      indent="pl-[62px]"
      header={
        <>
          <PlayerPortrait color={color} size={34} />
          <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2.5">
            <span className="font-display font-semibold text-sm">{pl.name}</span>
            <span className="font-mono text-[13px]" style={{ color }}>
              {pl.rating != null ? pl.rating.toFixed(2) : '—'} rtg
            </span>
          </div>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-x-4 gap-y-2">
        <StatCell label="ACS" value={pl.acs} />
        <StatCell label="ADR" value={pl.adr} />
        <StatCell label="KAST" value={pl.kast_pct != null ? `${(pl.kast_pct * 100).toFixed(0)}%` : '—'} />
        <StatCell label="K / D / A" value={`${pl.kills ?? '—'} / ${pl.deaths ?? '—'} / ${pl.assists ?? '—'}`} />
        <StatCell label="First Kills" value={pl.first_kills} />
        <StatCell label="First Deaths" value={pl.first_deaths} />
        <StatCell label="Maps Played" value={pl.maps_played} />
      </div>
    </ExpandableRow>
  )
}
