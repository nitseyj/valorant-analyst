import { useEffect, useMemo, useRef, useState } from 'react'
import { getMeta } from '../lib/api'
import { ROLE_COLOR } from '../lib/roles'
import { useCountUp, useSlashToFocus } from '../lib/hooks'
import { Panel, Label, SectionHeader, EmptyState, Select, Skeleton } from '../components/ui'
import AgentImage from '../components/AgentImage'
import MapImage from '../components/MapImage'
import { SearchIcon } from '../components/icons'

const ROLE_ORDER = ['Duelist', 'Initiator', 'Controller', 'Sentinel']
const MOVERS = 3
const TREEMAP = { w: 1600, h: 900 }

function roleColor(role) {
  return ROLE_COLOR[role] || 'var(--color-ink-faint)'
}

// Change in pick rate against the all-seasons, all-maps baseline, in points.
function formatDelta(points) {
  if (points == null) return null
  const sign = points > 0 ? '+' : points < 0 ? '-' : ''
  return `${sign}${Math.abs(points).toFixed(1)} pts`
}

// The whole agent image, never cropped. The art sits at its true proportions
// inside the frame, and a blurred copy of it fills the empty space around.
function FramedArt({ agent, hover = false }) {
  return (
    <>
      <AgentImage agent={agent} className="absolute inset-0 w-full h-full scale-110 blur-2xl opacity-40" />
      <AgentImage agent={agent} fit="contain" className={`absolute inset-0 w-full h-full transition-transform duration-700 ${hover ? 'group-hover:scale-[1.03]' : ''}`} />
    </>
  )
}

// Squarified treemap. Each rectangle's area is proportional to the agent's
// pick rate. Rectangles are laid out in a fixed 1600 by 900 space, so the
// container can keep a 16:9 shape and stay exact at any size.
function squarify(items, W, H) {
  const out = []
  let x = 0
  let y = 0
  let w = W
  let h = H
  let rest = items.slice()
  const worst = (row, side) => {
    const s = row.reduce((sum, r) => sum + r.area, 0)
    const max = Math.max(...row.map((r) => r.area))
    const min = Math.min(...row.map((r) => r.area))
    return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min))
  }
  while (rest.length && w > 0 && h > 0) {
    const side = Math.min(w, h)
    let row = [rest[0]]
    let k = 1
    while (k < rest.length && worst([...row, rest[k]], side) <= worst(row, side)) {
      row = [...row, rest[k]]
      k += 1
    }
    const rowArea = row.reduce((sum, r) => sum + r.area, 0)
    if (w >= h) {
      const colW = rowArea / h
      let yy = y
      for (const r of row) {
        const rh = r.area / colW
        out.push({ a: r.a, x, y: yy, w: colW, h: rh })
        yy += rh
      }
      x += colW
      w -= colW
    } else {
      const rowH = rowArea / w
      let xx = x
      for (const r of row) {
        const rw = r.area / rowH
        out.push({ a: r.a, x: xx, y, w: rw, h: rowH })
        xx += rw
      }
      y += rowH
      h -= rowH
    }
    rest = rest.slice(row.length)
  }
  return out
}

// The featured agent. The art sits at its true proportions beside the numbers,
// including the agent's share of its own role's picks.
function AgentSpotlight({ agent, rank, scopeLabel, roleShare }) {
  const pct = agent.pick_rate * 100
  const shown = useCountUp(pct, 900)
  const color = roleColor(agent.role)
  return (
    <section
      aria-label={`Featured agent: ${agent.agent}`}
      className="rise-in relative overflow-hidden cut-corner border border-line bg-panel mb-6 grid md:grid-cols-[260px_minmax(0,1fr)]"
      style={{ background: `radial-gradient(600px circle at 20% 30%, color-mix(in srgb, ${color} 16%, transparent), transparent 60%), var(--color-panel)` }}
    >
      <div className="group relative min-h-[300px] md:min-h-[340px] overflow-hidden">
        <FramedArt agent={agent.agent} hover />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,10,13,0.9) 0%, transparent 45%)' }} aria-hidden="true" />
        <span className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }} aria-hidden="true" />
      </div>
      <div className="flex flex-col justify-between gap-6 p-6 md:p-8">
        <div>
          <Label style={{ color }} className="mb-4">{agent.role} · rank #{rank}</Label>
          <h2 className="font-display text-4xl md:text-5xl font-bold capitalize leading-none">{agent.agent}</h2>
          <p className="text-sm text-ink-dim mt-4 max-w-md leading-relaxed">Pick rate in {scopeLabel}, as a share of every team and map slot.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <div className="font-display text-6xl font-bold tabular-nums leading-none" style={{ color }}>
              {shown.toFixed(0)}<span className="text-3xl text-ink-dim">%</span>
            </div>
            <div className="h-2 bg-line-soft overflow-hidden mt-4" aria-hidden="true">
              <div className="grow-x h-full" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
            </div>
            <div className="text-[11px] text-ink-faint mt-2">pick rate</div>
          </div>
          <div>
            <div className="font-display text-4xl font-bold tabular-nums leading-none">
              {roleShare != null ? `${roleShare.toFixed(0)}%` : '-'}
            </div>
            <div className="h-2 bg-line-soft overflow-hidden mt-4" aria-hidden="true">
              <div className="grow-x h-full" style={{ width: `${roleShare ?? 0}%`, background: 'var(--color-ink-dim)' }} />
            </div>
            <div className="text-[11px] text-ink-faint mt-2">of all {agent.role} picks</div>
          </div>
        </div>
        {agent.delta != null && (
          <p className="font-mono text-sm tabular-nums" style={{ color: agent.delta >= 0 ? 'var(--color-win)' : 'var(--color-brand)' }}>
            {formatDelta(agent.delta)} against all seasons and maps
          </p>
        )}
      </div>
    </section>
  )
}

// Every agent as a rectangle sized by pick rate. The layout is computed once
// per data change. Hovering shows the figures, clicking features the agent,
// and a role or search filter dims the rectangles that do not match.
function PickMap({ agents, featured, role, query, onPick }) {
  const [hovered, setHovered] = useState(null)
  const rects = useMemo(() => {
    const total = agents.reduce((sum, a) => sum + a.pick_rate, 0)
    if (total <= 0) return []
    const items = agents
      .map((a) => ({ a, area: (a.pick_rate / total) * TREEMAP.w * TREEMAP.h }))
      .sort((p, q) => q.area - p.area)
    return squarify(items, TREEMAP.w, TREEMAP.h)
  }, [agents])
  const q = query.trim().toLowerCase()
  const hoveredAgent = hovered ? agents.find((a) => a.agent === hovered) : null

  return (
    <div className="relative w-full aspect-[16/9] bg-bg border border-line cut-corner overflow-hidden" role="group" aria-label="Pick map. Each rectangle is one agent, sized by pick rate.">
      {rects.map((r, i) => {
        const a = r.a
        const dim = (role && a.role !== role) || (q && !a.agent.toLowerCase().includes(q))
        const left = (r.x / TREEMAP.w) * 100
        const top = (r.y / TREEMAP.h) * 100
        const width = (r.w / TREEMAP.w) * 100
        const height = (r.h / TREEMAP.h) * 100
        const big = width * height > 1.6
        const on = featured === a.agent
        return (
          <button
            key={a.agent}
            type="button"
            aria-pressed={on}
            aria-label={`${a.agent}, ${a.role}, ${(a.pick_rate * 100).toFixed(1)}% pick rate`}
            onClick={() => onPick(a.agent)}
            onPointerEnter={() => setHovered(a.agent)}
            onPointerLeave={() => setHovered(null)}
            onFocus={() => setHovered(a.agent)}
            onBlur={() => setHovered(null)}
            className="rise-in group absolute overflow-hidden text-left transition-opacity duration-300"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
              opacity: dim ? 0.18 : 1,
              outline: `1px solid ${on ? 'var(--color-brand)' : 'var(--color-bg)'}`,
              outlineOffset: '-1px',
              animationDelay: `${Math.min(i * 12, 400)}ms`,
            }}
          >
            <FramedArt agent={a.agent} hover />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(to top, rgba(10,10,13,0.85), transparent 60%)` }} aria-hidden="true" />
            <span className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: roleColor(a.role) }} aria-hidden="true" />
            {big && (
              <span className="absolute inset-x-0 bottom-0 p-2">
                <span className="block font-display text-sm md:text-base font-bold capitalize truncate">{a.agent}</span>
                <span className="block font-mono text-[10px] tabular-nums" style={{ color: roleColor(a.role) }}>{(a.pick_rate * 100).toFixed(0)}%</span>
              </span>
            )}
          </button>
        )
      })}
      {hoveredAgent && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-10 bg-panel-raised/95 border border-line cut-corner-tag px-3 py-2 text-xs" aria-hidden="true">
          <div className="font-semibold capitalize">{hoveredAgent.agent}</div>
          <div className="font-mono text-ink-dim tabular-nums">
            {hoveredAgent.role}, {(hoveredAgent.pick_rate * 100).toFixed(1)}% · {hoveredAgent.picks?.toLocaleString?.() ?? hoveredAgent.picks} picks
          </div>
        </div>
      )}
    </div>
  )
}

// One column per role: its share of all picks, then its agents, largest first.
// Clicking a role's heading filters the whole page to that role.
function RoleLanes({ roles, agents, active, onPick, onPreview }) {
  const shares = new Map((roles || []).map((r) => [r.role, r.share]))
  const lanes = ROLE_ORDER.filter((r) => shares.get(r) > 0 || agents.some((a) => a.role === r))
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3" role="group" aria-label="Filter by role">
      {lanes.map((role, li) => {
        const color = roleColor(role)
        const share = (shares.get(role) ?? 0) * 100
        const members = agents.filter((a) => a.role === role)
        const on = active === role
        const dimmed = active && !on
        return (
          <section
            key={role}
            className="rise-in cut-corner-tag bg-panel-raised border border-line p-4 transition-opacity duration-300"
            style={{ animationDelay: `${li * 70}ms`, opacity: dimmed ? 0.45 : 1, borderColor: on ? color : undefined }}
            aria-label={`${role} lane`}
          >
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onPick(on ? null : role)}
              onPointerEnter={() => onPreview(role)}
              onPointerLeave={() => onPreview(null)}
              className="group w-full text-left"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-lg font-semibold" style={{ color }}>{role}</span>
                <span className="font-display text-2xl font-bold tabular-nums">{share.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-line-soft overflow-hidden mt-2 mb-3" aria-hidden="true">
                <div className="grow-x h-full" style={{ width: `${share}%`, background: color }} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint group-hover:text-ink">
                {on ? 'Showing this role. Clear' : `${members.length} agents. Filter`}
              </span>
            </button>
            <ul className="mt-4 flex flex-col gap-2">
              {members.map((a) => (
                <li key={a.agent}>
                  <button
                    type="button"
                    onClick={() => onPick(null, a.agent)}
                    className="w-full min-h-[40px] flex items-center gap-2.5 px-1.5 py-1 text-left hover:bg-panel rounded-sm transition-colors"
                  >
                    <AgentImage agent={a.agent} className="w-7 h-7 cut-corner-tag shrink-0" />
                    <span className="text-sm capitalize truncate flex-1">{a.agent}</span>
                    <span className="font-mono text-[11px] tabular-nums text-ink-dim">{(a.pick_rate * 100).toFixed(0)}%</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

// Agents that gained or lost the most pick rate against the baseline. Only
// shown when the scope is narrowed, since the baseline is the same otherwise.
function Movers({ rows, onPick }) {
  const risers = rows.filter((r) => r.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, MOVERS)
  const fallers = rows.filter((r) => r.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, MOVERS)
  if (risers.length === 0 && fallers.length === 0) return null
  const scale = Math.max(1, ...rows.map((r) => Math.abs(r.delta)))
  const column = (title, list, tone) => (
    <div className="min-w-0">
      <Label className="mb-3" style={{ color: tone }}>{title}</Label>
      <ol className="flex flex-col gap-2.5">
        {list.map((r, i) => (
          <li key={r.agent} className="rise-in" style={{ animationDelay: `${i * 80}ms` }}>
            <button type="button" onClick={() => onPick(null, r.agent)} className="w-full text-left">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm font-semibold capitalize truncate">{r.agent}</span>
                <span className="font-mono text-xs tabular-nums shrink-0" style={{ color: tone }}>{formatDelta(r.delta)}</span>
              </div>
              <div className="h-1.5 bg-line-soft overflow-hidden" aria-hidden="true">
                <div className="grow-x h-full" style={{ width: `${(Math.abs(r.delta) / scale) * 100}%`, background: tone, animationDelay: `${i * 80 + 150}ms` }} />
              </div>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
  return (
    <Panel className="p-6 mb-6 rise-in">
      <SectionHeader>Biggest movers</SectionHeader>
      <Label className="mb-5">Change in pick rate against all seasons and all maps. Select an agent to feature it.</Label>
      <div className="grid md:grid-cols-2 gap-8">
        {column('Gaining', risers, 'var(--color-win)')}
        {column('Losing', fallers, 'var(--color-brand)')}
      </div>
    </Panel>
  )
}

// The available maps as photo tiles. Picking one scopes the page to that map.
function MapShowcase({ maps, value, onPick }) {
  if (maps.length === 0) return null
  return (
    <section className="mb-6">
      <SectionHeader>Map showcase</SectionHeader>
      <Label className="mb-5">Pick a map to scope every panel on this page</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {maps.map((m, i) => {
          const on = value === m
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(on ? null : m)}
              className={`rise-in group relative overflow-hidden cut-corner-sm border text-left transition-colors ${
                on ? 'border-brand-line' : 'border-line hover:border-ink-faint'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative aspect-video overflow-hidden">
                <MapImage map={m} className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to top, rgba(10,10,13,0.85), transparent 55%)' }} aria-hidden="true" />
                {on && <span className="absolute top-2 right-2 font-mono text-[10px] uppercase tracking-[0.12em] text-brand bg-bg/80 px-2 py-1 border border-brand-line">Scoped</span>}
              </div>
              <div className="px-3 py-2.5 bg-panel">
                <div className={`font-display font-semibold ${on ? 'text-brand' : ''}`}>{m}</div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// The full table. Column headers are sort buttons with aria-sort, and the
// change column appears only when a baseline comparison is active.
function AgentTable({ rows, showDelta, sortKey, onSort, featured, onPick }) {
  const columns = [
    { key: 'rank', label: '#', sortable: false },
    { key: 'agent', label: 'Agent', sortable: true },
    { key: 'role', label: 'Role', sortable: false },
    { key: 'rate', label: 'Pick rate', sortable: true },
    ...(showDelta ? [{ key: 'delta', label: 'Change', sortable: true }] : []),
    { key: 'picks', label: 'Picks', sortable: false },
  ]
  const scaleMax = Math.max(0.0001, ...rows.map((r) => r.pick_rate))
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <caption className="sr-only">Agents in this scope. Use the column headers to sort.</caption>
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                aria-sort={c.sortable && sortKey === c.key ? (c.key === 'agent' ? 'ascending' : 'descending') : c.sortable ? 'none' : undefined}
                className={`py-3 px-3 font-normal ${c.key === 'rate' || c.key === 'delta' || c.key === 'picks' ? 'text-right' : 'text-left'}`}
              >
                {c.sortable ? (
                  <button type="button" onClick={() => onSort(c.key)} className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint hover:text-ink min-h-[36px]">
                    {c.label}
                  </button>
                ) : (
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">{c.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((a, i) => {
            const color = roleColor(a.role)
            const on = featured === a.agent
            return (
              <tr
                key={a.agent}
                onClick={() => onPick(null, a.agent)}
                className={`rise-in border-t border-line-soft cursor-pointer transition-colors ${on ? 'bg-brand-dim' : 'hover:bg-panel-raised'}`}
                style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
              >
                <td className="py-2.5 px-3 font-mono text-xs text-ink-faint tabular-nums">{a.rank}</td>
                <td className="py-2.5 px-3">
                  <span className="flex items-center gap-3 min-w-0">
                    <AgentImage agent={a.agent} className="w-9 h-9 cut-corner-tag shrink-0" />
                    <span className="font-semibold capitalize truncate">{a.agent}</span>
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="inline-flex items-center gap-2 text-xs" style={{ color }}>
                    <span className="w-2 h-2 rotate-45" style={{ background: color }} aria-hidden="true" />
                    {a.role}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center justify-end gap-3">
                    <div className="hidden sm:block w-28 h-1.5 bg-line-soft overflow-hidden" aria-hidden="true">
                      <div className="h-full" style={{ width: `${(a.pick_rate / scaleMax) * 100}%`, background: color }} />
                    </div>
                    <span className="font-mono tabular-nums w-12 text-right" style={{ color }}>{(a.pick_rate * 100).toFixed(1)}%</span>
                  </div>
                </td>
                {showDelta && (
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs" style={{ color: a.delta >= 0 ? 'var(--color-win)' : 'var(--color-brand)' }}>
                    {formatDelta(a.delta)}
                  </td>
                )}
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs text-ink-dim">{a.picks?.toLocaleString?.() ?? a.picks}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function Analytics() {
  const [meta, setMeta] = useState(null)
  const [baseline, setBaseline] = useState(null)
  // The filter options come from the first response and are kept, so the
  // dropdowns do not empty out and reset while a filtered request is loading.
  const [options, setOptions] = useState({ years: [], maps: [] })
  const [year, setYear] = useState(null)
  const [map, setMap] = useState(null)
  const [compare, setCompare] = useState(false)
  const [role, setRole] = useState(null)
  const [previewRole, setPreviewRole] = useState(null)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('rate')
  const [featuredName, setFeaturedName] = useState(null)
  const searchRef = useRef(null)
  useSlashToFocus(searchRef)

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

  // The baseline is fetched the first time comparison is switched on.
  useEffect(() => {
    if (!compare || baseline) return undefined
    let cancelled = false
    getMeta().then((data) => {
      if (!cancelled) setBaseline(data)
    })
    return () => {
      cancelled = true
    }
  }, [compare, baseline])

  // Agents with real picks, ranked by pick rate. The rank is fixed by pick
  // rate, so it does not change when the table is sorted or filtered.
  const ranked = useMemo(() => {
    if (!meta?.agent_meta) return []
    return meta.agent_meta.filter((a) => a.pick_rate > 0 && a.role !== 'Unknown').sort((a, b) => b.pick_rate - a.pick_rate)
  }, [meta])

  const baseRates = useMemo(() => new Map((baseline?.agent_meta || []).map((a) => [a.agent, a.pick_rate])), [baseline])
  const scopeIsBaseline = !year && !map
  const showDelta = compare && Boolean(baseline) && !scopeIsBaseline

  // Each agent's pick rate change against the baseline, in points, and its
  // share of its own role's picks.
  const withDelta = useMemo(() => {
    const roleTotals = new Map()
    for (const a of ranked) roleTotals.set(a.role, (roleTotals.get(a.role) ?? 0) + a.picks)
    return ranked.map((a, i) => ({
      ...a,
      rank: i + 1,
      delta: showDelta ? (a.pick_rate - (baseRates.get(a.agent) ?? 0)) * 100 : null,
      roleShare: roleTotals.get(a.role) ? (a.picks / roleTotals.get(a.role)) * 100 : null,
    }))
  }, [ranked, baseRates, showDelta])

  const featured = withDelta.find((a) => a.agent === featuredName) ?? withDelta[0] ?? null

  // The table rows follow the role lane and search filters, then the sort.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = withDelta.filter((a) => (!role || a.role === role) && (!q || a.agent.toLowerCase().includes(q)))
    if (sortKey === 'agent') list.sort((a, b) => a.agent.localeCompare(b.agent))
    if (sortKey === 'delta') list.sort((a, b) => (b.delta ?? -Infinity) - (a.delta ?? -Infinity))
    return list
  }, [withDelta, role, query, sortKey])

  const dominantRole = useMemo(() => {
    const roles = (meta?.role_distribution || []).filter((r) => r.role !== 'Unknown' && r.share > 0)
    return roles.reduce((best, r) => (!best || r.share > best.share ? r : best), null)
  }, [meta])

  const agentCount = useCountUp(meta ? ranked.length : null, 900)
  const scope = [year, map].filter(Boolean).join(', ') || 'all seasons and maps'

  // A click on a role lane, a movers entry, a map, or a table row either sets
  // the role filter or features the agent, depending on which is given.
  function pickFromLane(nextRole, agentName) {
    if (agentName) setFeaturedName(agentName)
    else setRole(nextRole)
  }

  return (
    <div className="fade-up">
      <section className="relative overflow-hidden cut-corner border border-line bg-panel px-6 md:px-9 py-8 mb-6">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand" aria-hidden="true" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="min-w-0 max-w-2xl">
            <Label tone="brand" className="mb-3">Analytics</Label>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Agent meta</h1>
            <p className="text-sm text-ink-dim mt-3 leading-relaxed">
              Pick rates across the loaded matches. A pick rate is per team and map slot. Each team picks
              independently on every map, so an agent that everyone picks reaches 100%.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-6 lg:gap-8 shrink-0">
            <div className="min-w-0">
              <dt><Label>Most picked</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-2 capitalize truncate max-w-[10rem]">{meta ? ranked[0]?.agent ?? '-' : '…'}</dd>
            </div>
            <div className="min-w-0">
              <dt><Label>Top role</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-2 truncate max-w-[10rem]" style={{ color: dominantRole ? roleColor(dominantRole.role) : undefined }}>
                {meta ? dominantRole?.role ?? '-' : '…'}
              </dd>
            </div>
            <div>
              <dt><Label>Agents tracked</Label></dt>
              <dd className="font-display text-lg md:text-xl font-bold mt-2 tabular-nums" aria-live="polite">{meta ? Math.round(agentCount) : '…'}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 mb-7">
        <Select value={year} onChange={setYear} placeholder="All seasons" options={options.years.map((y) => ({ value: y, label: String(y) }))} className="py-2.5 px-3.5 text-sm" />
        <Select value={map} onChange={setMap} placeholder="All maps" options={options.maps.map((m) => ({ value: m, label: m }))} className="py-2.5 px-3.5 text-sm" />
        <button
          type="button"
          aria-pressed={compare}
          onClick={() => setCompare((c) => !c)}
          className={`min-h-[40px] px-3.5 font-mono text-xs border cut-corner-tag transition-colors ${
            compare ? 'text-brand border-brand-line bg-brand-dim' : 'text-ink-dim border-line hover:text-ink'
          }`}
        >
          {compare ? 'Comparing to all seasons' : 'Compare to all seasons'}
        </button>
        {role && (
          <button type="button" onClick={() => setRole(null)} className="inline-flex items-center gap-2 min-h-[40px] px-3.5 font-mono text-xs border border-brand-line bg-brand-dim text-brand cut-corner-tag">
            {role} only <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {compare && scopeIsBaseline && (
        <p className="font-mono text-xs text-ink-faint mb-6">Choose a season or map to see how the scope changes pick rates against all seasons.</p>
      )}

      {meta === null && (
        <div className="space-y-5">
          <Skeleton className="h-[420px] cut-corner" />
          <Skeleton className="h-64 cut-corner" />
        </div>
      )}

      {meta && (
        <>
          {featured && <AgentSpotlight agent={featured} rank={featured.rank} scopeLabel={scope} roleShare={featured.roleShare} />}

          {/* The pick map needs room to read. On phones the role lanes and table carry the same data. */}
          <section className="mb-6 hidden md:block">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
              <div>
                <SectionHeader className="mb-1">Pick map</SectionHeader>
                <Label>Each rectangle is one agent, sized by its pick rate. Select one to feature it.</Label>
              </div>
            </div>
            {ranked.length === 0 ? (
              <EmptyState>No agent pick data loaded for this scope.</EmptyState>
            ) : (
              <PickMap agents={withDelta} featured={featured?.agent} role={role} query={query} onPick={(name) => setFeaturedName(name)} />
            )}
          </section>

          <section className="mb-6">
            <SectionHeader className="mb-1">Roles</SectionHeader>
            <Label className="mb-5">Each column is one role's share of all picks. Select a role to filter the page to it.</Label>
            <RoleLanes
              roles={meta.role_distribution}
              agents={withDelta}
              active={role}
              onPick={(r, name) => pickFromLane(r, name)}
              onPreview={setPreviewRole}
            />
            {previewRole && !role && (
              <p className="font-mono text-xs text-ink-dim mt-3" aria-live="polite">
                {previewRole}: {ranked.filter((a) => a.role === previewRole).length} agents with picks
              </p>
            )}
          </section>

          <MapShowcase maps={options.maps} value={map} onPick={setMap} />

          {showDelta && <Movers rows={withDelta} onPick={(r, name) => pickFromLane(r, name)} />}

          <Panel className="p-6 rise-in" style={{ animationDelay: '120ms' }}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <SectionHeader className="mb-1">All agents</SectionHeader>
                <Label>{scope}{role ? `, ${role} only` : ''}</Label>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="relative block">
                  <span className="sr-only">Search agents</span>
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-ink-faint pointer-events-none">
                    <SearchIcon size={15} />
                  </span>
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                    placeholder="Search agents…"
                    className="w-full sm:w-56 bg-panel-raised border border-line text-ink text-sm py-2.5 pl-10 pr-4 font-mono cut-corner-tag focus-visible:border-brand placeholder:text-ink-faint"
                  />
                </label>
              </div>
            </div>
            {rows.length === 0 ? (
              <EmptyState>No agent pick data loaded for this filter.</EmptyState>
            ) : (
              <AgentTable
                rows={rows}
                showDelta={showDelta}
                sortKey={sortKey}
                onSort={setSortKey}
                featured={featured?.agent}
                onPick={(r, name) => pickFromLane(r, name)}
              />
            )}
          </Panel>
        </>
      )}
    </div>
  )
}
