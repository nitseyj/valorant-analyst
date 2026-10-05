import { useEffect, useState } from 'react'
import { getMeta } from '../lib/api'
import { ROLE_COLOR } from '../lib/roles'
import { Panel, Label, SectionHeader, EmptyState, Select, Skeleton } from '../components/ui'
import AgentImage from '../components/AgentImage'

export default function Analytics() {
  const [meta, setMeta] = useState(null)
  // The filter options come from the first response and are kept, so the
  // dropdowns do not empty out and reset while a filtered request is loading.
  const [options, setOptions] = useState({ years: [], maps: [] })
  const [year, setYear] = useState(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    let cancelled = false
    setMeta(null)
    getMeta({ year, map }).then((data) => {
      if (cancelled) return
      setMeta(data)
      if (!options.years.length && data.available_years?.length) {
        setOptions({ years: data.available_years, maps: data.available_maps || [] })
      }
    })
    return () => {
      cancelled = true
    }
    // options is set from the first response only, so it is not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, map])

  const scope = [year, map].filter(Boolean).join(', ') || 'all seasons and maps'

  return (
    <div className="fade-up">
      <header className="mb-7">
        <Label tone="brand" className="mb-2">Analytics</Label>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Agent meta</h1>
        <p className="text-sm text-ink-dim max-w-2xl leading-relaxed">
          Pick rates across the loaded matches. A pick rate is per team and map slot. Each team picks
          independently on every map, so an agent that everyone picks reaches 100%.
        </p>
      </header>

      <div className="flex flex-wrap gap-3 mb-7">
        <Select
          value={year}
          onChange={setYear}
          placeholder="All seasons"
          options={options.years.map((y) => ({ value: y, label: String(y) }))}
          className="py-2.5 px-3.5 text-sm"
        />
        <Select
          value={map}
          onChange={setMap}
          placeholder="All maps"
          options={options.maps.map((m) => ({ value: m, label: m }))}
          className="py-2.5 px-3.5 text-sm"
        />
      </div>

      {meta === null && (
        <div className="space-y-5">
          <Skeleton className="h-24 cut-corner" />
          <Skeleton className="h-64 cut-corner" />
        </div>
      )}

      {meta && (
        <>
          {meta.role_distribution?.some((r) => r.share > 0) && (
            <Panel className="p-6 mb-6">
              <SectionHeader>Role distribution</SectionHeader>
              <Label className="mb-4">Share of picks, {scope}</Label>
              <div className="flex h-7 overflow-hidden mb-4">
                {meta.role_distribution.map((r) => (
                  <div
                    key={r.role}
                    style={{ width: `${r.share * 100}%`, background: ROLE_COLOR[r.role] || 'var(--color-ink-faint)' }}
                    title={`${r.role}: ${(r.share * 100).toFixed(0)}%`}
                  />
                ))}
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {meta.role_distribution.filter((r) => r.share > 0 && r.role !== 'Unknown').map((r) => (
                  <li key={r.role} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 shrink-0" style={{ background: ROLE_COLOR[r.role] || 'var(--color-ink-faint)' }} />
                    {r.role}
                    <span className="font-mono text-ink-dim tabular-nums">{(r.share * 100).toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel className="p-6">
            <SectionHeader>Agent pick rates</SectionHeader>
            <Label className="mb-5">{scope}</Label>
            {meta.agent_meta?.length === 0 && <EmptyState>No agent pick data loaded for this filter.</EmptyState>}
            <ol className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {meta.agent_meta?.filter((a) => a.pick_rate > 0 && a.role !== 'Unknown').map((a, i) => {
                const color = ROLE_COLOR[a.role] || 'var(--color-ink-faint)'
                const pct = a.pick_rate * 100
                return (
                  <li key={a.agent} className="cut-corner-tag bg-panel-raised border border-line p-3.5">
                    <div className="flex items-center gap-3 mb-3">
                      <AgentImage agent={a.agent} className="w-12 h-12 cut-corner-tag shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold capitalize truncate">{a.agent}</div>
                        <div className="font-mono text-[11px] text-ink-faint">#{i + 1}</div>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-mono text-xl font-semibold tabular-nums" style={{ color }}>{pct.toFixed(0)}%</span>
                      <span className="text-[11px] text-ink-faint">pick rate</span>
                    </div>
                    <div className="h-1.5 bg-line-soft overflow-hidden">
                      <div className="h-full" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
                    </div>
                  </li>
                )
              })}
            </ol>
          </Panel>
        </>
      )}
    </div>
  )
}
