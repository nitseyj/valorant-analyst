import { useEffect, useState } from 'react'
import { getMeta } from '../lib/api'
import { ROLE_COLOR } from '../lib/roles'
import { ChartIcon, RoleGlyph, DotsDeco } from '../components/icons'
import { Panel, ImpactBar, EmptyState, LoadingState } from '../components/ui'

export default function Analytics() {
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    getMeta().then(setMeta)
  }, [])

  return (
    <div className="fade-up">
      <div className="flex items-center gap-2 font-display text-xl font-semibold mb-3">
        <ChartIcon />
        Analytics — Agent Meta
        <DotsDeco className="text-brand opacity-50" />
      </div>
      <p className="text-[13px] text-ink-dim mb-5 max-w-2xl">
        Pick rates across every loaded map this season. "Pick rate" is per team-map slot — two teams pick
        independently on every map, so the max possible rate for a universally-picked agent is 100%.
      </p>

      {meta === null && <LoadingState />}

      {meta && (
        <>
          {meta.role_distribution?.length > 0 && (
            <Panel className="p-5 mb-5">
              <div className="font-mono text-[11px] text-ink-faint mb-3.5">ROLE DISTRIBUTION</div>
              <div className="flex h-6 rounded-sm overflow-hidden mb-3">
                {meta.role_distribution.map((r) => (
                  <div
                    key={r.role}
                    style={{ width: `${r.share * 100}%`, background: ROLE_COLOR[r.role] || 'var(--color-ink-faint)' }}
                    title={`${r.role}: ${(r.share * 100).toFixed(0)}%`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {meta.role_distribution.map((r) => (
                  <div key={r.role} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-[2px] inline-block" style={{ background: ROLE_COLOR[r.role] || 'var(--color-ink-faint)' }} />
                    {r.role} <span className="font-mono text-ink-faint">{(r.share * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel className="p-5">
            <div className="font-mono text-[11px] text-ink-faint mb-3.5">AGENT PICK RATES — SEASON</div>
            {meta.agent_meta?.length === 0 && <EmptyState>No agent pick data loaded.</EmptyState>}
            {meta.agent_meta?.map((a) => {
              const color = ROLE_COLOR[a.role] || 'var(--color-ink-faint)'
              return (
                <div key={a.agent} className="flex items-center gap-2.5 py-1.5 border-t border-line-soft first:border-t-0">
                  <span style={{ color }} className="inline-flex shrink-0"><RoleGlyph role={a.role} /></span>
                  <span className="text-[13px] font-semibold w-[90px] shrink-0 capitalize">{a.agent}</span>
                  <div className="flex-1"><ImpactBar pct={a.pick_rate * 100} color={color} /></div>
                  <span className="font-mono text-xs w-11 text-right shrink-0" style={{ color }}>
                    {(a.pick_rate * 100).toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </Panel>
        </>
      )}
    </div>
  )
}
