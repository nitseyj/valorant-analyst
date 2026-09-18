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
  components/      shared UI: icons, Panel/SectionHeader/ImpactBar/Select
                   primitives, TeamBadge (logo with initials fallback),
                   PlayerPortrait (a player's historically best-performing
                   agent as a circular photo — no real player photos, see
                   below), MapImage/AgentImage (original illustrated art
                   with an abstract-glyph fallback), RoundTimeline,
                   EconomyChart, EvidenceRow, PlayerStatRow
  pages/           one file per view (Home, Teams, TeamProfile, Matches,
                   MatchVerdict, Players, Analytics, LegacyBuilder)

public/assets/
  valorant/teams/  team logos (gitignored here — synced from
                   frontend/prototype/assets at predev/prebuild time, see
                   scripts/sync-team-logos.mjs; not every team has one)
  agents/          one illustration per agent, <agent-name>.jpg
  agents/profiles/ one circular profile-icon crop per agent, used for
                   PlayerPortrait (a player's historically best-performing
                   agent, not their own likeness)
  maps/            one illustration per map, <map-name>.jpg
  ui/              decorative chrome (currently: bg-texture.jpg, the
                   faint diagonal-line page background set in index.css's
                   .bg-grid — dimmed with a dark overlay and rendered at
                   `cover`/`fixed` rather than tiled, since it isn't an
                   edge-matched seamless tile)
```

## Design constraints carried over from the original prototype

- **No real player photos or Riot-owned artwork.** `PlayerPortrait` shows
  a player's historically best-performing agent (highest average rating
  on a well-sampled agent — see `backend/app/analyzers/agent_analysis.py`'s
  `best_agents_for_players`) as a circular photo, original stylized agent
  art rather than a photo of the player themselves; it falls back to an
  original geometric silhouette when no agent is known yet or the image
  fails to load. The small inline `MapGlyph`/`RoleGlyph` icons are
  original abstract marks. `MapImage`/`AgentImage` show real illustration
  — original AI-generated art in an independent style, not actual in-game
  callouts or character art — falling back to the abstract glyph if a
  file is ever missing. Team logos are the one exception where this
  project uses real (not original) images — they load from
  `public/assets/valorant/teams/<slug>.<ext>` if present (not included in
  the git repo — see the root `README.md`) and fall back to a generated
  initials badge.
- **Never fabricate a stat.** Every number on screen traces back to a real
  API field or bundled real demo payload. A couple of panels from an early
  visual reference (a "players by region" breakdown, video highlight clips)
  were deliberately left out of this build because the dataset has no
  region or video data to back them.
