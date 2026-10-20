# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project does
not yet use version numbers.

## [Unreleased]

### Added

- **Motion:** `useRevealOnScroll` (`lib/hooks.js`) reveals a long list the
  moment it actually scrolls into view, instead of animating on mount where
  a list past the fold (Teams, Matches, Players, Analytics) finished its
  entrance before anyone had scrolled far enough to see it. Every existing
  `rise-in` element keeps its own per-item delay unchanged; the hook just
  gates when the group is allowed to start, via a paused/running
  `animation-play-state` toggle (see `.reveal-group` in `index.css`).
  `useAnimatedValues` tweens RadarChart's polygon between shapes when the
  compared team or player changes, instead of snapping. `useFlipReorder`
  animates sorted rows gliding to their new position (a FLIP: First, Last,
  Invert, Play) instead of jumping there, on the Teams and Analytics tables
  and the Players leaderboard.
- **Shortcuts overlay:** pressing `?` anywhere (outside a text field) opens
  an in-app reference of every keyboard shortcut, kept in sync with the
  root README's table by hand. Also reachable from a new link at the bottom
  of the sidebar on desktop.
- **`robots.txt`:** allows all crawlers. No `sitemap.xml`: this is a
  single-page app with exactly one crawlable URL, so a sitemap would add a
  file for no benefit.
- **Navigation:** switching views now crossfades with the browser's native
  View Transitions API, timed to the app's existing easing. Feature-detected
  and skipped under reduced motion, so unsupported browsers just keep the
  instant swap they already had.
- **Social sharing:** a real Open Graph/Twitter card image
  (`public/og-image.png`), built to match the site's own look rather than a
  generic placeholder.
- **Mobile nav:** a fade hint on the right edge of the horizontally-scrolling
  top nav, shown only while there's actually more to scroll to.
- **CI:** `.github/workflows/ci.yml` runs lint, build, Vitest, and Playwright
  for the frontend, and pytest for the backend, on every push and PR to
  `main`. A status badge was added to the root README.
- **Backend:** `backend/requirements.txt` (the real one; the old
  `requirements_additions.txt`, a comment file nothing ever installed from
  directly, is removed). Startup and error-path logging (`VALORANT_LOG_LEVEL`
  env var), including the database path/reachability at startup and any
  analyzers an endpoint had to skip. 45 new backend tests covering the 10
  analyzer modules that previously had none: a shared-contract test for the
  six `analyze_match` analyzers, plus dedicated tests for `meta_stats`,
  `overview_stats`, `radar_stats`, and `roster_builder`.
- **Frontend:** `index.html` now has a meta description and Open Graph /
  Twitter Card tags, so sharing the live site shows more than a bare title.
- **Home:** the spotlight match is now a match replay: an auto-playing,
  round-by-round race chart built entirely from the match's own round data
  (no video), cycling through the top 3 highlight matches by impact. Reduced
  motion shows each match's finished chart immediately and just rotates
  between matches more slowly. A Pause control stops it, consistent with the
  ticker's.
- **Testing:** a Playwright smoke suite (`frontend/web/tests/`) covering
  every top-level page, layout at two viewports, and that navigating away
  from a match verdict mid-load does not throw. A Vitest unit test for
  `ErrorBoundary` and for the tweening hook's core logic. A pytest suite
  (`backend/tests/`) covering the k-notation parser, `build_verdict`'s
  invariants, and core API routes, using the real database and skipping
  (not failing) when it is not present locally.
- **Frontend:** an `ErrorBoundary` component wraps each page, so a render
  error in one page shows a scoped fallback instead of blanking the app.
  It resets when the user navigates to a different page.
- **Home:** a command palette (Ctrl+K) that searches teams, matches, and pages;
  a looping ticker of the latest series that pauses on hover or focus; a map
  atlas of all twelve maps with pointer tilt and a detail panel that compares
  each map's share with an even split; and a meta snapshot of the top agents
  by pick rate.
- **Teams:** cards, a sortable table, and a scatter of matches played against
  win rate, all sharing one list. Teams can be compared side by side, and the
  comparison keeps its teams when the search changes.
- **Players:** a podium for the top three, a board and a scatter of the
  selected metric against rating, and an "add any player" search that can
  compare players outside the top 20.
- **Matches:** a series profile (sweeps, close series, and average maps),
  an outcome filter (sweeps or close series), a by-event view with sticky
  group headers, and keyboard movement between cards.
- **Team profile:** an era track that steps through roster years with the
  mouse or arrow keys, map callouts for the strongest and weakest maps (at
  least five maps played), and a record against each opponent in the recent
  matches.
- **Match verdict:** an impact chart drawn toward the winning side, a map
  board whose tiles open each map's lineups, a rating duel between the two
  teams, and map lineups showing which agent each player used on each map.
- **Analytics:** a featured-agent spotlight, an agent gallery, a map showcase
  that scopes the whole page, a comparison with all-seasons pick rates,
  biggest movers, and a ladder view alongside the cards.
- **Legacy Roster Builder:** undo (button and Ctrl+Z), role coverage for each
  lineup, and whole-image agent cards for each player.
- **Shared components:** `CommandPalette`, `MapAtlas`, `GameLineups`,
  `TeamWatermark`, and `ShortcutsOverlay`. Analytics and the Legacy Builder
  each use a local helper (`FramedArt` and `FramedAgent`) to show agent art
  uncropped.
- **Shared hooks:** `useCountUp`, `useSlashToFocus`, `useDebouncedValue`,
  `useTilt`, `useRevealOnScroll`, `useAnimatedValues`, and `useFlipReorder`
  in `lib/hooks.js`.
- **Backend:** `GET /games/{game_id}/lineups` returns each team's players on
  one map with the agent each played.
- **Assets:** agent illustrations and profile icons rebuilt from the supplied
  set, including Miks and Veto. Map art rebuilt from the supplied set for all
  twelve maps. Profile icons are cropped to each agent's head and shoulders.

### Changed

- **Home:** the match replay's chart now draws smooth curves (bezier
  through each round's data point) instead of a straight-segment polyline,
  with a soft gradient fill under each line, dashed reference gridlines,
  round-number ticks, and a live value label at the end of each curve. The
  straight-line version read as a jagged, cluttered zigzag once the two
  teams' lines crossed a few times.
- **Players, TeamProfile:** radar comparison state no longer resets to a
  loading skeleton on every comparison change; the previous shape stays on
  screen while the new one loads (stale while revalidating), which is also
  what let the polygon tween between shapes instead of unmounting and
  losing its animation state.
- **Interaction:** the pointer-tilt effect from the Home map atlas is now a
  shared `useTilt` hook (`lib/hooks.js`), also applied to team cards' hover
  watermark on the Teams page.
- **Images:** agent art, map art, and the UI background texture are now
  WebP instead of JPG (roughly 50% smaller). Team logos get an additive
  WebP sibling alongside their original PNG (which the legacy prototype
  still depends on directly): 1087 logos, 25MB of PNG mirrored at 11MB of
  WebP. `TeamBadge` and `TeamWatermark` now try `.webp` before `.png`.
- **Frontend:** every page's data-fetching effect now cancels its in-flight
  request with `AbortController` when the component unmounts or its
  dependencies change, instead of only ignoring the response once it
  arrives. `lib/api.js`'s functions all accept an optional `signal`.
- **Frontend:** every page except Home, and the command palette, now loads
  as its own chunk (`React.lazy` + `Suspense`), instead of one bundle for
  the whole app. The initial script drops from 474KB to 253KB (127KB to
  78KB gzipped).
- **Frontend:** the five hand-rolled search debounces (Teams, Matches,
  Players, Legacy Builder, the command palette) now share one
  `useDebouncedValue` hook in `lib/hooks.js`, instead of each keeping its
  own `setTimeout`/`clearTimeout` (or, for Legacy Builder, a ref-keyed map
  of them).
- **Backend:** CORS no longer allows every origin. It defaults to the
  frontend's own dev server, with more origins addable via the
  comma-separated `VALORANT_CORS_ORIGINS` env var (for example, a LAN IP
  when hosting the frontend for other devices on the network to reach).
- **Home:** rebuilt as an open hero with a radar of all twelve maps, a
  four-figure metric strip, a full-width spotlight match, season phases as
  columns, an agent tile grid, and a tabbed leaderboard panel with podiums.
  The series ticker keeps its automatic motion, with a Pause control.
- **Analytics:** rebuilt around a pick map (a treemap sized by pick rate),
  role lanes that filter the page, and one sortable agent table. The
  featured agent shows its share of its role's picks.
- **Match verdict:** the round timeline is now a race chart of rounds won, with
  method tiles that filter the rounds and a summary for each team. Pistol
  rounds (1 and 13) are marked.
- **Teams:** each card reveals its team's logo behind it on hover.
- **Analytics and Home:** agent art is shown whole, never cropped, in the
  showcase areas.
- The whole interface was rebuilt around a shared visual system: consistent
  page headers, staggered entrance motion, and touch targets of at least
  36 px.
- The count-up animation moved from the Home page into a shared hook.
- The Players page compares stored player objects, so a selection survives a
  change of metric.
- Analytics shows agent art uncropped (`fit="contain"`), and the showcase art
  was reduced in size after review.
- The Legacy Builder title is now a page heading.
- Documentation (root README, frontend README) rewritten to describe the
  current pages, endpoints, shortcuts, and asset rules.

### Fixed

- Economy tracker: VCT 2026 series have no loadout values in the source data.
  The tracker now plots remaining credits for them, labelled as such, instead
  of an empty chart. The timeline endpoint returns both values.
- Legacy Builder title is a page heading, consistent with the other pages.
- Shared "/" shortcut to search on Teams, Matches, and Analytics.
- Home ticker moves automatically. Previously, a system reduce-motion setting
  held it still.
- Teams cards: the hover logo is centred, and the card's hover background
  is semi-transparent so the logo shows through.
- The command palette now closes from the backdrop, from Escape while any
  element has focus, and from Ctrl+K.
- Teams: a comparison no longer empties when a search filters out a compared
  team.
- Legacy Builder: Enter picks a player only when the typed text matches a
  name exactly, so a partial search cannot pick a different player.
- Legacy Builder: the "low sample" tag no longer overlaps a player's name.
- Verdict map tiles take their names from the match endpoint, so they show
  names for matches whose verdict lacks them.
- Phone layouts: no horizontal page scroll, and every button is at least
  36 px tall on the pages checked.

### Removed

- **Backend:** `GET /games/{game_id}/verdict`, a per-map verdict endpoint
  that was never called from the frontend (the match verdict page uses the
  series-level verdict and the per-map lineups endpoint instead). Removed
  rather than wired in, to avoid adding a UI surface nobody asked for.

### Documentation

- **License:** the MIT grant now explicitly excludes the real team logos
  under `frontend/prototype/assets/valorant/teams/`, which are third-party
  trademarks used under nominative fair use, not this project's to license.
  Added to `LICENSE`, the root README, the frontend README, and
  `CONTRIBUTING.md`.
- **README:** states plainly that the project is non-commercial, free, and
  carries no advertising, alongside the existing "not affiliated with Riot"
  disclaimer.

### Known limitations

- 611 games in the database do not have exactly ten player records, and 45
  games have no agent records. The lineup views show a note or a placeholder
  in these cases.
- Team logos are tracked under `frontend/prototype/assets/valorant/teams/`.
  They are third-party trademarks, not covered by this project's MIT license;
  see the License section of the root README.
- 14 `react(set-state-in-effect)` lint warnings remain. They follow one
  pattern used across several pages.
- The screenshots in `docs/screenshots/` predate the interface revamp.
- Lighthouse against the production build (with the real backend, not the
  demo fallback) measures Home at performance 72, accessibility 97, best
  practices 96, LCP ~4.8s, CLS 0. The gap is the three match-verdict
  requests Home fires on load, ~850ms each even running concurrently
  (CPU-bound analyzer computation, already documented in
  `backend/app/main.py`'s caching comment), landing after the match list
  they depend on resolves, then followed by real rendering work once all
  of it arrives. Not a regression from this session's animation work (CLS
  stayed at a perfect 0 throughout); a genuine architectural cost that
  would need Home's match-replay section to render independently of the
  rest of the page to improve.
