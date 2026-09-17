import { useState } from 'react'
import { CategoryIcon, RoleGlyph } from './icons'
import { ROLE_COLOR } from '../lib/roles'

export function ExpandableRow({ header, children, indent = 'pl-11' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="cut-corner-sm bg-panel border border-line mb-2 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3.5 px-4 py-3 text-left">
        <span
          className="font-mono text-ink-faint text-xs transition-transform duration-200 shrink-0"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
        >
          ▸
        </span>
        {header}
      </button>
      {open && <div className={`px-4 pb-4 ${indent}`}>{children}</div>}
    </div>
  )
}

export function Panel({ children, className = '', accent, ...rest }) {
  return (
    <div
      className={`cut-corner bg-panel border ${className}`}
      style={{ borderColor: accent ? `${accent}55` : 'var(--color-line)' }}
      {...rest}
    >
      {children}
    </div>
  )
}

export function SectionHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-2 font-display text-[15px] font-semibold mb-3 ${className}`}>
      <span
        className="w-[9px] h-[9px] shrink-0 rotate-45 bg-brand"
        style={{ boxShadow: '0 0 8px var(--color-brand-line)' }}
      />
      {children}
    </div>
  )
}

export function StatCard({ icon, label, value }) {
  return (
    <div className="cut-corner-sm bg-panel border border-line flex items-center gap-3 p-4">
      <div className="w-9 h-9 rounded-sm bg-brand-dim text-brand flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-display text-2xl font-bold leading-none">{value}</div>
        <div className="font-mono text-[10px] tracking-wide text-ink-faint mt-1">{label}</div>
      </div>
    </div>
  )
}

export function ImpactBar({ pct, color }) {
  return (
    <div className="h-1.5 rounded-full bg-line-soft overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }}
      />
    </div>
  )
}

export function RoleChip({ role, label }) {
  const color = ROLE_COLOR[role] || ROLE_COLOR.Unknown
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs font-medium"
      style={{ color, borderColor: `${color}33` }}
    >
      <RoleGlyph role={role} style={{ color }} />
      {label}
    </span>
  )
}

export function CategoryBadge({ category, color }) {
  return (
    <span className="inline-flex" style={{ color }}>
      <CategoryIcon category={category} />
    </span>
  )
}

export function Pips({ scoreStr }) {
  const [a, b] = scoreStr.split('-').map(Number)
  const pips = []
  for (let i = 0; i < a; i++) pips.push({ color: 'var(--color-brand)', key: `a${i}` })
  for (let i = 0; i < b; i++) pips.push({ color: 'var(--color-team-b)', key: `b${i}` })
  return (
    <div className="flex flex-wrap gap-[3px]">
      {pips.map((p, i) => (
        <span
          key={p.key}
          className="w-[9px] h-[9px] rounded-[1px] opacity-0 animate-[reveal_.3s_ease_forwards]"
          style={{ background: p.color, animationDelay: `${i * 18}ms` }}
        />
      ))}
    </div>
  )
}

export function EmptyState({ children }) {
  return <div className="py-16 text-center text-ink-faint text-sm font-mono">{children}</div>
}

export function LoadingState({ children = 'loading…' }) {
  return <div className="py-16 text-center text-ink-faint text-[13px] font-mono">{children}</div>
}
