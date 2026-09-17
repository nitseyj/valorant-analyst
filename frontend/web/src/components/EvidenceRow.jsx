import { formatEvidenceValue } from '../lib/format'
import { roleOf } from '../lib/roles'
import { RoleChip, ImpactBar } from './ui'
import { TierIcon } from './icons'

function CompChips({ str }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {str
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((agent) => (
          <RoleChip key={agent} role={roleOf(agent)} label={agent} />
        ))}
    </div>
  )
}

export default function EvidenceRow({ ev }) {
  const isComp = /Comp$|Composition/.test(ev.metric)
  if (isComp && typeof ev.team_a === 'string') {
    return (
      <div className="py-2.5 border-t border-line-soft">
        <div className="font-mono text-[11px] text-ink-faint mb-1.5">{ev.metric.toUpperCase()}</div>
        <div className="mb-1.5"><CompChips str={ev.team_a} /></div>
        <CompChips str={ev.team_b} />
      </div>
    )
  }

  const a = ev.team_a
  const b = ev.team_b
  const isPct = /Rate/.test(ev.metric) && typeof a === 'number' && Math.abs(a) <= 1
  let maxVal = 1
  if (!isPct) {
    const nums = [a, b].filter((v) => typeof v === 'number')
    maxVal = Math.max(1, ...nums.map(Math.abs))
  }
  const aWidth = typeof a === 'number' ? (isPct ? a * 100 : (Math.abs(a) / maxVal) * 100) : 0
  const bWidth = typeof b === 'number' ? (isPct ? b * 100 : (Math.abs(b) / maxVal) * 100) : 0

  let tier = null
  if (/^Full Buy/.test(ev.metric)) tier = 'full'
  else if (/^Eco/.test(ev.metric)) tier = 'eco'

  return (
    <div className="py-2 border-t border-line-soft">
      <div className="font-mono text-[11px] text-ink-faint mb-1 flex items-center gap-1.5">
        {tier && <TierIcon tier={tier} />}
        {ev.metric.toUpperCase()}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-xs text-brand shrink-0">{formatEvidenceValue(ev.metric, a)}</span>
          <div className="w-full flex justify-end">
            <div className="w-full max-w-[110px]"><ImpactBar pct={aWidth} color="var(--color-brand)" /></div>
          </div>
        </div>
        <div className="w-px h-4 bg-line" />
        <div className="flex items-center gap-2">
          <div className="w-full max-w-[110px]"><ImpactBar pct={bWidth} color="var(--color-team-b)" /></div>
          <span className="font-mono text-xs text-team-b shrink-0">{formatEvidenceValue(ev.metric, b)}</span>
        </div>
      </div>
    </div>
  )
}
