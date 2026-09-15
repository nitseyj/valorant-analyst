# Data quality findings — vct_2025 test load

Found by actually running the ETL against real data, not by inspection alone.
Each of these is now handled explicitly in `load_match_analyzer.py` — logged
and skipped, never guessed. Keep this file updated as later years get loaded;
some of these may not reproduce identically (e.g. tournament naming aliases).

## 1. Tournament names differ across files within the same year
`eco_rounds.csv` uses "Champions Tour 2025: EMEA Stage 1"; every other file
(including the ids/ lookup tables) uses "VCT 2025: EMEA Stage 1" for the
identical tournament. Handled with `normalize_tournament()` in the ETL —
extend that function if later years show different alias patterns.
`eco_rounds.csv` is also missing entire stages/regions for 2025 (no China
data at all, no Pacific/EMEA Stage 2) — that's a genuine upstream gap, not
fixable by renaming.

## 2. Team names are not globally unique
36 team names in `all_ids/all_teams_ids.csv` collide with an unrelated team
elsewhere in the dataset (documented by the dataset author for "Exotic";
also true for e.g. "G2 Esports" — Team ID 257 vs 11058). The per-year
`ids/teams_ids.csv` file has zero duplicate names within a single year and
is what the ETL actually resolves against. Do not resolve team identity from
the global `all_ids` file by name alone.

## 3. Player names are not unique — RESOLVED
224–266 player handles (varies slightly by year) resolve to more than one
real Player ID in the GLOBAL `all_ids/all_players_ids.csv`. Same root cause
and same fix as issue #2: the per-year `ids/players_ids.csv` file has ZERO
duplicate names within a single year (verified: all 349 players appearing
in vct_2025 resolve against it with no gaps at all). The ETL now resolves
player identity against the year-scoped file, not the global one. This
recovered all 1,716 previously-skipped rows in the vct_2025 test load — 0
ambiguous players remain for that year.
Note: this only works because match stat rows already carry a Year/season
context (the folder you're loading). A genuinely cross-year query — e.g.
comparing a player's 2021 stats to their 2025 stats — still needs to load
each year separately and join the results by Player ID, not by name.

## 4. Tournament-wide aggregate rows are mixed into per-match CSVs
Several source files include a rollup row alongside the real per-map rows,
using sentinel values instead of a real map/stage:
  - `overview.csv`, `kills_stats.csv`: `Map = "All Maps"` (series aggregate)
  - `agents/teams_picked_agents.csv`: `Stage = "All Stages"`,
    `Match Type = "All Match Types"` (tournament aggregate)
These correctly do NOT join to a single game_id and are filtered out
explicitly rather than treated as failed joins.

## 5. `team_game_agent_picks` needs a real match join, not a text key
(Tournament, Stage, Match Type, Map) alone is not unique — round-robin
"Group Stage" weeks reuse the same Match Type label (e.g. "Week 4") across
several different matchups in the same week. Resolved by joining through
the already-loaded `matches`/`games` tables via team membership instead.
~450 rows (2.4%) remain genuinely ambiguous even after that fix — likely
rescheduled/makeup matches sharing a week label — and are skipped, not
guessed.

## 6. Placeholder teams
"TBD" and "Mega Minors" are qualifier-slot placeholders, not real orgs (per
the dataset's own documentation). They have no Team ID in the per-year
lookup, so any match involving one is correctly skipped end-to-end
(25 matches in the vct_2025 test load, cascading to ~700-1000 skipped rows
in rounds/economy/player-stats for those matches).

## 7. `player_game_impact` was never loaded (schema existed, loader didn't)
The schema table was designed against `kills_stats.csv` from the start,
but the original ETL only loaded `overview.csv` into `player_game_stats`
and never added the corresponding load step for `kills_stats.csv`. This
wasn't caught by row-count checks (0 rows loaded silently, no error) — it
surfaced only when `player_impact.py` reported 0 clutches for every player
in a match that clearly had clutches. Fixed by adding the missing load
step. Lesson: a table with 0 rows and no error is a silent failure mode —
worth a basic non-zero-rowcount assertion per table once the ETL is
considered "done," not just "runs without errors."

## vct_2025 test load result summary
|---|---|---|
| teams | 4,024 | global reference set, all years |
| players | 15,240 | global reference set, all years |
| matches | 478 | 25 skipped (Mega Minors placeholder) |
| games | 1,277 | 0 skipped |
| rounds | 26,244 | 731 skipped (placeholder-team matches) |
| round_team_economy | 24,724 | 458 skipped (placeholder-team matches) |
| player_game_stats | 37,290 | 14,946 "All Maps" aggregate rows correctly excluded; 0 ambiguous (fixed — see #3) |
| player_game_impact | 9,660 | fixed — see #7; 3,922 "All Maps" aggregate rows correctly excluded |
| team_game_agent_picks | 11,810 | 5,806 tournament-aggregate rows correctly excluded; 450 genuinely ambiguous |
