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
    <div className="flex md:flex-col items-center md:items-stretch gap-5 md:gap-0 overflow-x-auto md:overflow-visible no-scrollbar w-full md:w-56 shrink-0 md:h-screen md:sticky md:top-0 px-4 md:px-3 py-3.5 md:py-6 border-b md:border-b-0 md:border-r border-line bg-bg">
      <div className="flex items-center gap-2.5 shrink-0 md:mb-6 md:px-1.5">
        <HexLogo size={26} />
        <div className="font-display text-[13px] font-semibold tracking-wide leading-tight text-ink-dim hidden sm:block">
          VALORANT
          <br />
          <span className="text-ink">ANALYST</span>
        </div>
      </div>

      <nav className="flex md:flex-col gap-1 md:gap-0.5 shrink-0">
        {NAV.map(({ id, label, Icon }) => {
          const active = view === id || (id === 'teams' && view === 'team') || (id === 'matches' && view === 'verdict')
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13px] font-medium whitespace-nowrap transition-colors ${
                active ? 'text-brand bg-brand-dim' : 'text-ink-dim hover:text-ink hover:bg-panel'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="hidden md:block flex-1" />

      {showBack && (
        <button
          onClick={onBack}
          className="hidden md:flex items-center gap-1.5 px-1.5 py-2.5 text-[13px] text-ink-dim hover:text-ink font-mono"
        >
          <BackIcon size={14} />
          back
        </button>
      )}
    </div>
  )
}
