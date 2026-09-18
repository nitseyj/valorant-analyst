// One inline SVG per icon — no icon font, no external sprite sheet. Every
// path here is either hand-drawn for this project or an original abstract
// glyph (map/role markers deliberately evoke the idea of a map/role without
// reproducing Riot's actual level art or agent artwork — see MapIcon).

function Svg({ size = 16, viewBox = '0 0 24 24', className, style, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} className={className} style={style} {...rest}>
      {children}
    </svg>
  )
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function HomeIcon(props) {
  return (
    <Svg {...stroke} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M9.5 20v-6h5v6" />
    </Svg>
  )
}
export function PlayersIcon(props) {
  return (
    <Svg {...stroke} {...props}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 20c.7-3.6 2.6-5.5 5.5-5.5s4.8 1.9 5.5 5.5" />
      <path d="M14 15c3.4-.3 5.7 1.3 6.5 5" />
    </Svg>
  )
}
export function TeamsIcon(props) {
  return (
    <Svg {...stroke} {...props}>
      <path d="M12 3 20 6v5c0 5-3.2 8.1-8 10-4.8-1.9-8-5-8-10V6z" />
      <path d="m8 12 2.5 2.5L16 9" />
    </Svg>
  )
}
export function MatchesIcon(props) {
  return (
    <Svg {...stroke} {...props}>
      <path d="M7 3v4M17 3v4M4 9h16" />
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 13h3M13 13h3M8 17h3" />
    </Svg>
  )
}
export function AnalyticsIcon(props) {
  return (
    <Svg {...stroke} {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3-4 3 2 5-7" />
      <path d="M18 6h-3M18 6v3" />
    </Svg>
  )
}
export function LegacyIcon(props) {
  return (
    <Svg {...stroke} {...props}>
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="7" />
      <rect x="9" y="9" width="6" height="6" />
    </Svg>
  )
}
export function SearchIcon(props) {
  return (
    <Svg {...stroke} {...props}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m16 16 5 5" />
    </Svg>
  )
}
export function CompareIcon(props) {
  return (
    <Svg {...stroke} {...props}>
      <circle cx="9" cy="12" r="6.5" />
      <circle cx="15" cy="12" r="6.5" />
    </Svg>
  )
}
export function BackIcon(props) {
  return (
    <Svg fill="none" {...props}>
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
export function ChevronRightIcon(props) {
  return (
    <Svg fill="none" {...props}>
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
export function ChartIcon(props) {
  return (
    <Svg {...stroke} {...props}>
      <path d="M4 19V5M4 19h16" />
      <rect x="7" y="12" width="2.5" height="5" />
      <rect x="11" y="9" width="2.5" height="8" />
      <rect x="15" y="6" width="2.5" height="11" />
    </Svg>
  )
}
export function VersusIcon(props) {
  return (
    <Svg {...stroke} role="img" aria-label="vs" {...props}>
      <path d="M5 5h5l4 14h5" />
      <path d="M19 5h-5l-4 14H5" />
    </Svg>
  )
}
export function TrophyIcon({ color = 'currentColor', ...props }) {
  return (
    <Svg fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M8 4h8v4c0 4-2 6-4 6s-4-2-4-6z" />
      <path d="M8 6H4v2c0 2 1.5 4 4 4M16 6h4v2c0 2-1.5 4-4 4M12 14v4M8 21h8" />
    </Svg>
  )
}
export function FlameIcon(props) {
  return (
    <Svg fill="currentColor" {...props}>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
    </Svg>
  )
}
export function HexLogo({ size = 26, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...props}>
      <polygon points="16,2 29,9 29,23 16,30 3,23 3,9" fill="none" stroke="var(--color-brand)" strokeWidth="1.4" />
      <polygon points="16,9 23,13 23,19 16,23 9,19 9,13" fill="var(--color-brand)" opacity="0.85" />
    </svg>
  )
}

// ---- Ranked-factor category icons (match verdict) ----
const CATEGORY_PATHS = {
  'Player Impact': <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />,
  'Side Performance': <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" fill="currentColor" />,
  'Opening Duels': (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <line x1="12" y1="1" x2="12" y2="6" stroke="currentColor" strokeWidth="1.6" />
      <line x1="12" y1="18" x2="12" y2="23" stroke="currentColor" strokeWidth="1.6" />
      <line x1="1" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.6" />
      <line x1="18" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  Economy: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 15c0 1.1 1.3 2 3 2s3-.7 3-1.7c0-2.4-6-1-6-3.3 0-1 1.3-1.7 3-1.7s3 .6 3 1.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  'Agent Composition': <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="1.6" fill="none" />,
  'Clutch Factor': (
    <>
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <path d="M12 7l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="currentColor" stroke="none" />
    </>
  ),
}
export function CategoryIcon({ category, size = 13, ...props }) {
  const shape = CATEGORY_PATHS[category]
  if (!shape) return null
  return (
    <Svg size={size} fill="none" {...props}>
      {shape}
    </Svg>
  )
}

// ---- Role glyphs (small badge shapes, one per class) ----
const ROLE_PATHS = {
  Duelist: <polygon points="5,0 10,10 0,10" fill="currentColor" />,
  Controller: <circle cx="5" cy="5" r="4.5" fill="currentColor" />,
  Initiator: (
    <>
      <polygon points="0,1 6,5 0,9" fill="currentColor" />
      <rect x="6" y="4" width="4" height="2" fill="currentColor" />
    </>
  ),
  Sentinel: <polygon points="5,0 10,2.5 10,6 5,10 0,6 0,2.5" fill="currentColor" />,
  Unknown: <rect x="1" y="1" width="8" height="8" fill="currentColor" opacity="0.5" />,
}
export function RoleGlyph({ role, size = 9, ...props }) {
  const shape = ROLE_PATHS[role] || ROLE_PATHS.Unknown
  return (
    <Svg size={size} viewBox="0 0 10 10" {...props}>
      {shape}
    </Svg>
  )
}

// ---- Map glyphs — original abstract marks, one per map, evoking a
// tactical-blueprint feel without depicting the real (Riot-owned) callouts.
const MAP_PATHS = {
  Bind: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  Haven: (
    <>
      <circle cx="7" cy="17" r="3" />
      <circle cx="12" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
    </>
  ),
  Split: (
    <>
      <line x1="12" y1="2" x2="12" y2="22" strokeWidth="2" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
    </>
  ),
  Ascent: (
    <>
      <rect x="4" y="10" width="16" height="4" />
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="12" cy="19" r="2.5" />
    </>
  ),
  Icebox: <polygon points="12,2 20,8 17,20 7,20 4,8" />,
  Breeze: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
  Fracture: (
    <>
      <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2" />
      <line x1="21" y1="3" x2="3" y2="21" strokeWidth="2" />
    </>
  ),
  Pearl: (
    <>
      <circle cx="12" cy="9" r="5" fill="none" strokeWidth="1.6" />
      <rect x="8" y="16" width="8" height="4" />
    </>
  ),
  Lotus: <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />,
  Sunset: (
    <>
      <rect x="2" y="15" width="20" height="3" />
      <circle cx="12" cy="10" r="5" fill="none" strokeWidth="1.6" />
    </>
  ),
  Abyss: (
    <>
      <polygon points="12,2 22,12 12,22 2,12" />
      <polygon points="12,7 17,12 12,17 7,12" fill="var(--color-bg)" />
    </>
  ),
  Corrode: (
    <>
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </>
  ),
}
export function MapGlyph({ map, size = 13, ...props }) {
  const shape = MAP_PATHS[map]
  if (!shape) return null
  return (
    <Svg size={size} fill="currentColor" stroke="currentColor" {...props}>
      {shape}
    </Svg>
  )
}

// ---- Buy-tier silhouettes — generic weapon silhouettes, not any specific
// in-game weapon/skin model.
export function TierIcon({ tier, size = 13, ...props }) {
  if (tier === 'full') {
    return (
      <Svg size={size} {...stroke} {...props}>
        <path d="M2 13l3-2h5l1-3h9v3h-2v2h-3l-1 3H8l-1 2H3z" />
        <path d="M11 8v3" />
      </Svg>
    )
  }
  return (
    <Svg size={size} {...stroke} {...props}>
      <path d="M4 14l4-2h4l2-3h6v3h-2l-1 2h-2l-1 3H6z" />
    </Svg>
  )
}

// ---- Round win-method glyphs ----
const WIN_METHOD_PATHS = {
  Elimination: (
    <>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  ),
  Detonated: <polygon points="12,3 21,20 3,20" />,
  Defused: <polygon points="3,4 21,4 12,21" />,
  'Time Expiry (No Plant)': <circle cx="12" cy="12" r="8" />,
  'Time Expiry (Failed to Plant)': <circle cx="12" cy="12" r="8" />,
}
export function WinMethodGlyph({ method, size = 10, ...props }) {
  const shape = WIN_METHOD_PATHS[method] || WIN_METHOD_PATHS.Elimination
  return (
    <Svg size={size} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      {shape}
    </Svg>
  )
}

// ---- Decorative-only glyphs — ambient flourishes, never bound to data ----
export function CrosshairDeco(props) {
  return (
    <Svg viewBox="0 0 40 40" size={26} fill="none" stroke="currentColor" {...props}>
      <circle cx="20" cy="20" r="12" />
      <path d="M20 0v10M20 30v10M0 20h10M30 20h10" />
    </Svg>
  )
}
export function DotsDeco(props) {
  return (
    <Svg viewBox="0 0 30 20" size={22} fill="currentColor" {...props}>
      <circle cx="3" cy="3" r="2" />
      <circle cx="13" cy="3" r="2" />
      <circle cx="23" cy="3" r="2" />
      <circle cx="3" cy="13" r="2" />
      <circle cx="13" cy="13" r="2" />
      <circle cx="23" cy="13" r="2" />
    </Svg>
  )
}
export function DividerDeco(props) {
  return (
    <svg viewBox="0 0 120 12" preserveAspectRatio="none" className="block w-full h-3" fill="none" {...props}>
      <path d="M0 6h120" stroke="var(--color-line)" strokeWidth="1" />
      <path d="M50 6h20" stroke="var(--color-brand)" strokeWidth="3" />
    </svg>
  )
}
