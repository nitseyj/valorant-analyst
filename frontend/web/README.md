# Valorant Analyst — frontend

React + Vite + Tailwind v4. Talks to the FastAPI backend in `../../backend`;
falls back to a small set of real (not fabricated) bundled demo payloads —
see `src/lib/demo/*.json` — whenever that API isn't reachable, so the UI is
still browsable offline.

## Setup

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. By default it talks to the backend at
`http://127.0.0.1:8000` — start that first (see `backend/README.md`) to see
live data instead of the demo fallback. Override the API origin with an env
var if needed:

```bash
VITE_API_BASE=http://127.0.0.1:9000 npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Structure

```
src/
  lib/
    api.js        one function per backend endpoint, live-fetch-first with
                   demo-data fallback baked in — pages never touch fetch()
    demo/*.json    real demo payloads extracted from an actual loaded season
    roles.js       agent -> role map (mirrors backend/app/analyzers/agent_analysis.py)
    format.js      small formatting helpers (percentages, evidence values, ...)
  components/      shared UI: icons, Panel/SectionHeader/ImpactBar primitives,
                   TeamBadge (logo with initials fallback), PlayerPortrait
                   (geometric silhouette — no real photos, see below),
                   RoundTimeline, EconomyChart, EvidenceRow, PlayerStatRow
  pages/           one file per view (Home, Teams, TeamProfile, Matches,
                   MatchVerdict, Players, Analytics, LegacyBuilder)
```

## Design constraints carried over from the original prototype

- **No real player photos or Riot-owned artwork.** `PlayerPortrait` is an
  original geometric silhouette; map/role glyphs are original abstract
  marks, not the real map callouts or agent art. Team logos are the one
  exception — they load from `public/assets/valorant/teams/<slug>.<ext>` if
  present (not included in the git repo — see the root `README.md`)
  and fall back to a generated initials badge.
- **Never fabricate a stat.** Every number on screen traces back to a real
  API field or bundled real demo payload. A couple of panels from an early
  visual reference (a "players by region" breakdown, video highlight clips)
  were deliberately left out of this build because the dataset has no
  region or video data to back them.
