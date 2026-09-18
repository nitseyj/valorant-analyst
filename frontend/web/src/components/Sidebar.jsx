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

export default function Sidebar({ view, onNavigate, onBack }) {
  const showBack = !TOP_LEVEL.has(view)

  return (
    <div className="relative flex md:flex-col items-center md:items-stretch gap-5 md:gap-0 overflow-x-auto md:overflow-visible no-scrollbar w-full md:w-72 shrink-0 md:h-screen md:sticky md:top-0 px-4 md:px-5 py-3.5 md:py-8 border-b md:border-b-0 md:border-r border-line bg-bg">
      {/* Soft red glow behind the logo + a dot cluster near the bottom —
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
    </div>
  )
}
