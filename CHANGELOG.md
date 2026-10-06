# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project does
not yet use version numbers.

## [Unreleased]

### Added

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
- **Shared components:** `CommandPalette`, `MapAtlas`, `GameLineups`, and
  `TeamWatermark`. Analytics and the Legacy Builder each use a local helper
  (`FramedArt` and `FramedAgent`) to show agent art uncropped.
- **Shared hooks:** `useCountUp` and `useSlashToFocus` in `lib/hooks.js`.
- **Backend:** `GET /games/{game_id}/lineups` returns each team's players on
  one map with the agent each played.
- **Assets:** agent illustrations and profile icons rebuilt from the supplied
  set, including Miks and Veto. Map art rebuilt from the supplied set for all
  twelve maps. Profile icons are cropped to each agent's head and shoulders.

### Changed (second revision)

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

### Fixed (second revision)

- Economy tracker: VCT 2026 series have no loadout values in the source data.
  The tracker now plots remaining credits for them, labelled as such, instead
  of an empty chart. The timeline endpoint returns both values.
- Legacy Builder title is a page heading, consistent with the other pages.
- Shared "/" shortcut to search on Teams, Matches, and Analytics.
- Home ticker moves automatically. Previously, a system reduce-motion setting
  held it still.
- Teams cards: the hover logo is centred, and the card's hover background
  is semi-transparent so the logo shows through.

### Changed

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

- The command palette now closes from the backdrop, from Escape while any
  element has focus, and from Ctrl+K.
- Teams: a comparison no longer empties when a search filters out a compared
  team.
- Legacy Builder: Enter picks a player only when the typed text matches a
  name exactly, so a partial search cannot pick a different player.
- Legacy Builder: the "low sample" tag no longer overlaps a player's name.
- Match verdict economy tracker: matches from VCT 2026, whose source data has
  no loadout values, now show remaining credits, labelled as such, instead of
  an empty chart. The timeline endpoint returns both values.
- Verdict map tiles take their names from the match endpoint, so they show
  names for matches whose verdict lacks them.
- Phone layouts: no horizontal page scroll, and every button is at least
  36 px tall on the pages checked.

### Known limitations

- 611 games in the database do not have exactly ten player records, and 45
  games have no agent records. The lineup views show a note or a placeholder
  in these cases.
- Team logos are tracked under `frontend/prototype/assets/valorant/teams/`.
  Confirm your rights to them before publishing a fork.
- Twelve `react(set-state-in-effect)` lint warnings remain. They follow one
  pattern used across several pages.
- The screenshots in `docs/screenshots/` predate the interface revamp.
