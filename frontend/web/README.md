# Valorant Analyst: frontend

React 19, Vite 8, and Tailwind CSS v4. The app talks to the FastAPI backend in
`../../backend`. When that API is not reachable, it falls back to a small set
of real, bundled demo payloads in `src/lib/demo/*.json`, so the interface
stays browsable offline.

## Setup

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`. It connects to the backend at
`http://127.0.0.1:8000` by default. Start the backend first (see
`../../README.md`) to see live data rather than the demo fallback.

To point the app at a different API origin:

```bash
VITE_API_BASE=http://127.0.0.1:9000 npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npx oxlint src/` | Lint the source |

## Structure

```
src/
  App.jsx             View routing, back-navigation history, the command
                      palette, and the Ctrl+K shortcut
  lib/
    api.js            One function per backend endpoint. Each tries the live
                      API first and falls back to bundled demo data where a
                      real fallback exists. Pages never call fetch() directly.
    hooks.js          useCountUp (eased number animation that honours reduced
                      motion) and useSlashToFocus ("/" focuses a search box)
    format.js         Formatting helpers: percentages, scores, impact colours
    roles.js          Agent to role mapping. It mirrors
                      backend/app/analyzers/agent_analysis.py.
    demo/*.json       Real demo payloads captured from a loaded season
  components/
    ui.jsx            Shared primitives: Panel, Label, SectionHeader, StatCard,
                      Button, Tag, ImpactBar, ExpandableRow, RoleChip, Pips,
                      MapScoreLine, Select, Skeleton, EmptyState, LoadingState
    Sidebar.jsx       Navigation, with a Back button
    CommandPalette.jsx  Ctrl+K search across teams, matches, and pages
    MapAtlas.jsx      Home: all twelve maps with pointer tilt and a detail panel
    GameLineups.jsx   Match verdict: each team's players and agents on one map
    TeamWatermark.jsx Large, faded, cropped team logo behind a panel
    TeamBadge.jsx     Team logo, falling back to a generated initials badge
    PlayerPortrait.jsx  A player's best-performing agent as a circular icon
    AgentImage.jsx    Agent art. Supports fit="cover" (crop) or "contain" (whole image)
    MapImage.jsx      Map art with a glyph fallback
    RadarChart.jsx    N-axis comparison chart with real values beside it
    RoundTimeline.jsx Round race chart, method tiles that filter the rounds, team summaries
    EconomyChart.jsx  Loadout value per round, or remaining credits where loadouts are absent
    EvidenceRow.jsx, PlayerStatRow.jsx,
    WinRateRing.jsx, icons.jsx
  pages/
    Home.jsx          Open hero with a 12-map radar, metric strip, ticker, spotlight,
                      season columns, map atlas, meta tiles, tabbed leaderboards
    Teams.jsx         Cards (with hover logo), sortable table, and scatter views, with comparison
    TeamProfile.jsx   Full-season profile, roster timeline, opponents
    Matches.jsx       Search, season and outcome filters, list or by-event view
    MatchVerdict.jsx  Ranked factors, impact chart, lineups, rating duel, map lineups,
                      round timeline, economy tracker
    Players.jsx       Podium, board, scatter, and any-player comparison
    Analytics.jsx     Agent spotlight, pick map (treemap), role lanes, map showcase,
                      movers, sortable table
    LegacyBuilder.jsx Roster builder with undo, role coverage, and projection

public/assets/
  valorant/teams/   Team logos, copied from frontend/prototype/assets by the sync script (see below).
  agents/           <agent>.jpg, full illustration
  agents/profiles/  <agent>.jpg, square head-and-shoulders crop
  maps/             <map>.jpg, 1600 by 900
  ui/               Background texture
```

## Interface conventions

These apply across every page, so new pages should follow them.

- **Panels and headers.** Content sits in `Panel` with a `SectionHeader`
  and a `Label` line beneath it. Most pages open with the same header
  block: a brand-coloured eyebrow `Label`, an `h1`, and a short description.
  Home opens with its own hero.
- **Motion.** Entrances use `rise-in` with a staggered `animationDelay`.
  Bars use `grow-x`. Numbers use `useCountUp`. The global reduced-motion
  rule disables the animations, and the JavaScript animations check the same
  setting.
- **Imagery.** Showcase art uses `AgentImage fit="contain"` or the framed
  pattern, so images are never cropped. Small icons may crop.
- **Touch targets.** Interactive controls are at least 36 px tall. The
  primary filter and navigation controls use 40 px.
- **Accessibility.** Toggle groups use `aria-pressed`. Sortable headers use
  `aria-sort`. Live status uses `aria-live="polite"`. Decorative images use
  `aria-hidden`. Keyboard shortcuts are listed in the root README.
- **Colour.** Colours come from the theme tokens in `src/index.css`. The
  brand colour marks Team A and the team-b colour marks Team B. Role colours
  come from `roles.js`.
- **Copy.** Visible text uses plain hyphens and colons, not en or em dashes.

## Assets

Images are loaded by name from `public/assets/`:

- `agents/<agent>.jpg` and `agents/profiles/<agent>.jpg` for each agent.
  Names are lowercase, for example `sova.jpg`.
- `maps/<map>.jpg` for each map, matching the database names in lowercase.

**Team logos** are tracked under `frontend/prototype/assets/valorant/teams/`.
`scripts/sync-team-logos.mjs` copies them into `public/assets/valorant/teams/`
before `npm run dev` and `npm run build`, and it only copies when that folder
is empty. The copy is gitignored. The app derives each logo's file name from
the team name: lowercase, apostrophes removed, and every run of other
characters replaced with a hyphen. For example, "Paper Rex" becomes
`paper-rex.png`. Teams without a file show initials instead.

## Design constraints

- **No real player photos, and no Riot-owned artwork.** `PlayerPortrait`
  shows a player's historically best-performing agent as original stylized
  art, falling back to a geometric silhouette when no agent is known or the
  image fails to load.
- **Team logos are the one place real images are used.** They load from
  `public/assets/valorant/teams/` when present, and otherwise fall back to
  an initials badge.
- **No fabricated statistics.** Every number on screen traces back to an API
  field or a bundled real demo payload. Panels that the dataset cannot
  support, such as regional breakdowns or video clips, are not included.
