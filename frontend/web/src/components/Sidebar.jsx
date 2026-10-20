import { useEffect, useRef, useState } from 'react'
import { HexLogo, HomeIcon, PlayersIcon, TeamsIcon, MatchesIcon, AnalyticsIcon, LegacyIcon, BackIcon } from './icons'

const NAV = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'players', label: 'Players', Icon: PlayersIcon },
  { id: 'teams', label: 'Teams', Icon: TeamsIcon },
  { id: 'matches', label: 'Matches', Icon: MatchesIcon },
  { id: 'analytics', label: 'Analytics', Icon: AnalyticsIcon },
  { id: 'legacy', label: 'Legacy Builder', Icon: LegacyIcon },
]

const TOP_LEVEL = new Set(['home', 'players', 'teams', 'matches', 'analytics', 'legacy'])

export default function Sidebar({ view, onNavigate, onBack, onShowShortcuts }) {
  const showBack = !TOP_LEVEL.has(view)
  const scrollRef = useRef(null)
  // Mobile only: the nav scrolls horizontally to reach every page, but
  // nothing about it looks scrollable (no visible scrollbar). This tracks
  // whether there's more to the right so a fade hint can show only when
  // it's actually true, and disappear once the user has scrolled to the end.
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return undefined
    function update() {
      setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 8)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="relative w-full md:w-72 shrink-0 md:h-screen md:sticky md:top-0 border-b md:border-b-0 md:border-r border-line bg-bg">
      <div
        ref={scrollRef}
        className="relative flex md:flex-col items-center md:items-stretch gap-5 md:gap-0 overflow-x-auto md:overflow-visible no-scrollbar px-4 md:px-5 py-3.5 md:py-8 md:h-full"
      >
        {/* Soft red glow behind the logo + a dot cluster near the bottom:
            the same corner-accent language as the sidebar in the inspired
            UI kit, redrawn as CSS instead of a fixed-size raster image. */}
        <div
          className="hidden md:block absolute -top-16 -left-20 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,59,86,0.14), transparent 70%)' }}
        />
        <div className="hidden md:block dot-texture absolute left-5 bottom-24 w-24 h-16 opacity-40 pointer-events-none" />

        <div className="relative flex items-center gap-3 shrink-0 md:mb-9 md:px-1.5">
          <HexLogo size={34} />
          <div className="font-display text-base font-semibold tracking-wide leading-tight text-ink-dim hidden sm:block">
            VALORANT
            <br />
            <span className="text-ink">ANALYST</span>
          </div>
        </div>

        <nav className="relative flex md:flex-col gap-1 md:gap-1.5 shrink-0">
          {NAV.map(({ id, label, Icon }) => {
            const active = view === id || (id === 'teams' && view === 'team') || (id === 'matches' && view === 'verdict')
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`relative flex items-center gap-3 pl-3.5 pr-4 py-3 rounded-sm text-[15px] font-medium whitespace-nowrap transition-colors ${
                  active ? 'bg-brand' : 'text-ink-dim hover:text-ink hover:bg-panel'
                }`}
                style={active ? { color: '#1a0508' } : undefined}
              >
                <Icon size={19} />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="hidden md:block flex-1" />

        {showBack && (
          <button
            onClick={onBack}
            className="relative hidden md:flex items-center gap-2 px-2 py-3 text-[15px] text-ink-dim hover:text-ink font-mono"
          >
            <BackIcon size={17} />
            back
          </button>
        )}

        <button
          onClick={onShowShortcuts}
          className="relative hidden md:flex items-center gap-2 px-2 py-2.5 text-xs text-ink-faint hover:text-ink-dim font-mono"
        >
          <kbd className="border border-line px-1.5 py-0.5 cut-corner-tag">?</kbd>
          keyboard shortcuts
        </button>
      </div>

      {canScrollRight && (
        <div
          className="md:hidden absolute right-0 top-0 bottom-0 w-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, transparent, var(--color-bg))' }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
