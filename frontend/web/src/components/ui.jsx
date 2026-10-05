import { useState } from 'react'
import { RoleGlyph } from './icons'
import { ROLE_COLOR } from '../lib/roles'

// Accepts any CSS colour, including var(--token), which the old `${accent}55`
// string concatenation silently broke. color-mix() works on both.
function tint(color, percent = 35) {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`
}

export function Panel({ children, className = '', accent, ...rest }) {
  return (
    <div
      className={`cut-corner bg-panel border ${className}`}
      style={{ borderColor: accent ? tint(accent) : 'var(--color-line)' }}
      {...rest}
    >
      {children}
    </div>
  )
}

// Small mono uppercase label used for panel titles and metadata. One
// component so every panel label has the same size, tracking and colour.
export function Label({ children, className = '', tone = 'faint', ...rest }) {
  const toneClass = tone === 'brand' ? 'text-brand' : tone === 'dim' ? 'text-ink-dim' : 'text-ink-faint'
  return (
    <div className={`font-mono text-[11px] uppercase tracking-[0.14em] ${toneClass} ${className}`} {...rest}>{children}</div>
  )
}

const SECTION_SIZE = {
  md: 'text-base',
  lg: 'text-2xl',
}

export function SectionHeader({ children, className = '', size = 'md', as: Heading = 'h2' }) {
  return (
    <Heading className={`flex items-center gap-2.5 font-display font-semibold mb-3 ${SECTION_SIZE[size]} ${className}`}>
      <span
        className="w-2.5 h-2.5 shrink-0 rotate-45 bg-brand"
        style={{ boxShadow: '0 0 10px var(--color-brand-line)' }}
      />
      {children}
    </Heading>
  )
}

export function StatCard({ icon, label, value }) {
  return (
    <div className="relative cut-corner-sm bg-panel border border-line flex items-center gap-4 p-5">
      <span
        className="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none bg-brand"
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
      />
      {icon && (
        <div className="w-10 h-10 bg-brand-dim text-brand flex items-center justify-center shrink-0 cut-corner-tag">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="font-display text-3xl font-bold leading-none tabular-nums">{value}</div>
        <Label className="mt-2">{label}</Label>
      </div>
    </div>
  )
}

const BUTTON_VARIANT = {
  primary: 'bg-brand text-[#14060a] border-brand hover:brightness-110',
  secondary: 'bg-panel-raised text-ink border-line hover:border-ink-faint',
  ghost: 'bg-transparent text-ink-dim border-transparent hover:text-ink hover:bg-panel',
}

export function Button({ variant = 'secondary', className = '', children, ...rest }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 border font-mono text-sm font-semibold cut-corner-tag transition active:translate-y-px disabled:opacity-40 disabled:pointer-events-none ${BUTTON_VARIANT[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

const TAG_TONE = {
  neutral: 'text-ink-dim border-line',
  brand: 'text-brand border-brand-line bg-brand-dim',
  mvp: 'text-mvp border-mvp/40 bg-mvp-dim',
}

export function Tag({ tone = 'neutral', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 border font-mono text-[11px] font-semibold uppercase tracking-wide cut-corner-tag ${TAG_TONE[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function ImpactBar({ pct, color }) {
  return (
    <div className="h-1.5 bg-line-soft overflow-hidden">
      <div
        className="h-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }}
      />
    </div>
  )
}

export function ExpandableRow({ header, children, indent = 'pl-11' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="cut-corner-sm bg-panel border border-line mb-2 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3.5 px-4 py-3 text-left"
      >
        <span
          aria-hidden="true"
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

export function RoleChip({ role, label }) {
  const color = ROLE_COLOR[role] || ROLE_COLOR.Unknown
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border font-mono text-xs font-medium cut-corner-tag"
      style={{ color, borderColor: tint(color, 40), background: tint(color, 10) }}
    >
      <RoleGlyph role={role} style={{ color }} />
      {label}
    </span>
  )
}

export function Pips({ scoreStr }) {
  const [a, b] = scoreStr.split('-').map(Number)
  const pips = []
  for (let i = 0; i < a; i++) pips.push({ color: 'var(--color-brand)', key: `a${i}` })
  for (let i = 0; i < b; i++) pips.push({ color: 'var(--color-team-b)', key: `b${i}` })
  return (
    <div className="flex flex-wrap gap-[5px]">
      {pips.map((p, i) => (
        <span
          key={p.key}
          className="w-[13px] h-[13px] opacity-0 animate-[reveal_.3s_ease_forwards]"
          style={{ background: p.color, animationDelay: `${i * 18}ms` }}
        />
      ))}
    </div>
  )
}

// Round totals for one map. The winning side is bold and full brightness, so
// the result reads at a glance without matching pip colours to the header.
export function MapScoreLine({ scoreStr }) {
  const [a, b] = scoreStr.split('-').map(Number)
  const aWon = a > b
  const bWon = b > a
  return (
    <span className="font-mono text-sm shrink-0 flex items-center gap-1.5">
      <span style={{ color: 'var(--color-brand)' }} className={aWon ? 'font-bold' : 'opacity-60'}>{a}</span>
      <span className="text-ink-faint">/</span>
      <span style={{ color: 'var(--color-team-b)' }} className={bWon ? 'font-bold' : 'opacity-60'}>{b}</span>
    </span>
  )
}

export function Select({ value, onChange, options, placeholder, className = '' }) {
  return (
    <select
      aria-label={placeholder}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`bg-panel border border-line text-ink text-xs font-mono py-2 px-3 cut-corner-tag focus-visible:border-brand ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// Skeleton blocks shaped like the content they stand in for, so the layout
// does not jump when data arrives (preferred over a generic spinner).
export function Skeleton({ className = '' }) {
  return <div className={`bg-line-soft animate-pulse ${className}`} />
}

export function EmptyState({ children }) {
  return <div className="py-16 text-center text-ink-faint text-sm font-mono">{children}</div>
}

export function LoadingState({ children = 'Loading…' }) {
  return (
    <div className="py-10 flex flex-col gap-2.5 max-w-md mx-auto" role="status" aria-live="polite">
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
      <span className="sr-only">{children}</span>
    </div>
  )
}
