import { useEffect, useMemo, useState } from 'react'
import { getMeta } from '../lib/api'
import { ROLE_COLOR } from '../lib/roles'
import { useCountUp } from '../lib/hooks'
import { Panel, Label, SectionHeader, EmptyState, Select, Skeleton } from '../components/ui'
import AgentImage from '../components/AgentImage'
import { SearchIcon } from '../components/icons'

const TIER_COLOR = ['var(--color-mvp)', 'var(--color-team-b)', 'var(--color-brand)']
const SORTS = [
  { key: 'rate', label: 'Pick rate' },
  { key: 'name', label: 'A to Z' },
]

function roleColor(role) {
  return ROLE_COLOR[role] || 'var(--color-ink-faint)'
}

// Role split as one stacked bar. Hovering a segment previews that role; a
// click makes it the filter for the agent grid below.
function RoleSplit({ roles, activeRole, onPick, onPreview }) {
  const visible = roles.filter((r) => r.share > 0 && r.role !== 'Unknown')
  return (
    <>
      <div className="flex h-10 items-center mb-4 gap-px" role="group" aria-label="Filter agents by role">
        {visible.map((r, i) => {
          const active = activeRole === r.role
          const dimmed = activeRole && !active
          return (
            <button
              key={r.role}
              type="button"
              aria-pressed={active}
              onClick={() => onPick(r.role)}
              onMouseEnter={() => onPreview(r.role)}
              onMouseLeave={() => onPreview(null)}
              onFocus={() => onPreview(r.role)}
              onBlur={() => onPreview(null)}
              title={`${r.role}: ${(r.share * 100).toFixed(0)}%`}
              className="relative h-full min-w-[6px] transition-opacity duration-200"
              style={{ width: `${r.share * 100}%`, opacity: dimmed ? 0.3 : 1 }}
            >
              <span
                className="grow-x absolute inset-x-0 top-1/2 h-7 -translate-y-1/2"
                style={{ background: roleColor(r.role), animationDelay: `${i * 80}ms` }}
              />
              <span className="sr-only">{r.role}, {(r.share * 100).toFixed(0)} percent</span>
            </button>
          )
        })}
      </div>
      <ul className="flex flex-wrap gap-x-2 gap-y-2">
        {visible.map((r) => {
          const active = activeRole === r.role
          return (
            <li key={r.role}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onPick(r.role)}
                onMouseEnter={() => onPreview(r.role)}
                onMouseLeave={() => onPreview(null)}
                className={`inline-flex items-center gap-2 min-h-[40px] px-3 text-sm cut-corner-tag border transition-colors ${
                  active ? 'bg-panel-raised text-ink' : 'text-ink-dim border-transparent hover:text-ink'
                }`}
                style={active ? { borderColor: roleColor(r.role) } : undefined}
              >
                <span className="w-2.5 h-2.5 shrink-0" style={{ background: roleColor(r.role) }} aria-hidden="true" />
                {r.role}
                <span className="font-mono text-ink-dim tabular-nums">{(r.share * 100).toFixed(0)}%</span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default function Analytics() {
  const [meta, setMeta] = useState(null)
  // The filter options come from the first response and are kept, so the
  // dropdowns do not empty out and reset while a filtered request is loading.
  const [options, setOptions] = useState({ years: [], maps: [] })
  const [year, setYear] = useState(null)
  const [map, setMap] = useState(null)
  const [role, setRole] = useState(null)
  const [previewRole, setPreviewRole] = useState(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('rate')

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

  // Agents with real picks, ranked by pick rate. The rank is fixed by pick
  // rate, so it stays the same when the grid is searched or sorted by name.
  const ranked = useMemo(() => {
    if (!meta?.agent_meta) return []
    return meta.agent_meta
      .filter((a) => a.pick_rate > 0 && a.role !== 'Unknown')
      .sort((a, b) => b.pick_rate - a.pick_rate)
  }, [meta])

  const grid = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = ranked
      .map((a, rank) => ({ ...a, rank: rank + 1 }))
      .filter((a) => (!role || a.role === role) && (!q || a.agent.toLowerCase().includes(q)))
    if (sort === 'name') list.sort((a, b) => a.agent.localeCompare(b.agent))
    return list
  }, [ranked, role, query, sort])

  const dominantRole = useMemo(() => {
    const roles = (meta?.role_distribution || []).filter((r) => r.role !== 'Unknown' && r.share > 0)
    return roles.reduce((best, r) => (!best || r.share > best.share ? r : best), null)
  }, [meta])

  const agentCount = useCountUp(meta ? ranked.length : null, 900)
  const scope = [year, map].filter(Boolean).join(', ') || 'all seasons and maps'
  const hasDistribution = meta?.role_distribution?.some((r) => r.share > 0)

  return (
    <div className="fade-up">
      <section className="relative overflow-hidden cut-corner border border-line bg-panel px-6 md:px-9 py-8 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand" aria-hidden="true" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="min-w-0">
            <Label tone="brand" className="mb-3">Analytics</Label>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Agent meta</h1>
            <p className="text-sm text-ink-dim mt-3 max-w-2xl leading-relaxed">
              Pick rates across the loaded matches. A pick rate is per team and map slot. Each team picks
              independently on every map, so an agent that everyone picks reaches 100%.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 lg:gap-8 shrink-0">
            <div className="min-w-0">
              <dt><Label>Most picked</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-2 capitalize truncate max-w-[10rem]">
                {meta ? ranked[0]?.agent ?? '-' : '…'}
              </dd>
            </div>
            <div className="min-w-0">
              <dt><Label>Top role</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-2 truncate max-w-[10rem]" style={{ color: dominantRole ? roleColor(dominantRole.role) : undefined }}>
                {meta ? dominantRole?.role ?? '-' : '…'}
              </dd>
            </div>
            <div>
              <dt><Label>Agents tracked</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-2 tabular-nums" aria-live="polite">
                {meta ? Math.round(agentCount) : '…'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

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
          {hasDistribution && (
            <Panel className="p-6 mb-6 rise-in">
              <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                <SectionHeader className="mb-0">Role distribution</SectionHeader>
                {role && (
                  <button
                    type="button"
                    onClick={() => setRole(null)}
                    className="font-mono text-xs text-brand hover:brightness-110 min-h-[40px] px-2"
                  >
                    Clear {role} filter
                  </button>
                )}
              </div>
              <Label className="mb-4">Share of picks, {scope}. Click a role to filter the agents.</Label>
              <RoleSplit
                roles={meta.role_distribution}
                activeRole={role}
                onPick={(r) => setRole((cur) => (cur === r ? null : r))}
                onPreview={setPreviewRole}
              />
              {previewRole && !role && (
                <p className="font-mono text-xs text-ink-dim mt-3" aria-live="polite">
                  {previewRole}: {ranked.filter((a) => a.role === previewRole).length} agents with picks
                </p>
              )}
            </Panel>
          )}

          <Panel className="p-6 rise-in" style={{ animationDelay: '120ms' }}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <SectionHeader className="mb-1">Agent pick rates</SectionHeader>
                <Label>{scope}</Label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <label className="block">
                    <span className="sr-only">Search agents</span>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-ink-faint pointer-events-none">
                      <SearchIcon size={15} />
                    </span>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      type="text"
                      placeholder="Search agents…"
                      className="w-full sm:w-56 bg-panel-raised border border-line text-ink text-sm py-2.5 pl-10 pr-4 font-mono cut-corner-tag focus-visible:border-brand placeholder:text-ink-faint"
                    />
                  </label>
                </div>
                <div role="group" aria-label="Sort agents" className="flex gap-1 p-1 bg-panel-raised border border-line cut-corner-tag self-start">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      aria-pressed={sort === s.key}
                      onClick={() => setSort(s.key)}
                      className={`min-h-[40px] px-3 font-mono text-[11px] cut-corner-tag transition-colors ${
                        sort === s.key ? 'bg-brand text-[#14060a] font-semibold' : 'text-ink-dim hover:text-ink'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {grid.length === 0 && <EmptyState>No agent pick data loaded for this filter.</EmptyState>}
            <ol className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {grid.map((a, i) => {
                const color = roleColor(a.role)
                const pct = a.pick_rate * 100
                const tier = a.rank <= TIER_COLOR.length ? TIER_COLOR[a.rank - 1] : null
                return (
                  <li
                    key={a.agent}
                    className="lift rise-in relative overflow-hidden cut-corner-tag bg-panel-raised border border-line p-3.5 hover:border-ink-faint"
                    style={{ animationDelay: `${Math.min(i * 35, 600)}ms` }}
                  >
                    {tier && <span className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: tier }} aria-hidden="true" />}
                    <div className="flex items-center gap-3 mb-3">
                      <AgentImage agent={a.agent} className="w-12 h-12 cut-corner-tag shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold capitalize truncate">{a.agent}</div>
                        <div className="font-mono text-[11px] text-ink-faint flex items-center gap-2">
                          <span style={tier ? { color: tier } : undefined}>#{a.rank}</span>
                          <span className="truncate" style={{ color }}>{a.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-mono text-xl font-semibold tabular-nums" style={{ color }}>{pct.toFixed(0)}%</span>
                      <span className="text-[11px] text-ink-faint">pick rate</span>
                    </div>
                    <div className="h-1.5 bg-line-soft overflow-hidden" aria-hidden="true">
                      <div
                        className="grow-x h-full"
                        style={{ width: `${Math.min(100, pct)}%`, background: color, animationDelay: `${Math.min(i * 35, 600) + 150}ms` }}
                      />
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
