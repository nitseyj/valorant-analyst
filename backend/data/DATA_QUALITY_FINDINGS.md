# Data quality findings

Found by actually running the ETL against real data, not by inspection alone.
Each of these is now handled explicitly in `load_match_analyzer.py` — logged
and skipped, never guessed. Findings #1-7 came from the original vct_2025-only
test load; #8-11 came from loading the full 2021-2026 combined database.

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

## 8. `player_game_agents` was never loaded (same class of bug as #7)
The schema table exists and `roster_builder.py` queries it for a player's
`primary_agent`/`primary_role` from day one — but the loader never inserted
into it, even though `overview.csv`'s `Agents` column (e.g. `"yoru"`, or
`"sova, yoru"` on an agent swap mid-map) was sitting right there unused in
the same loop that already reads that row for `player_game_stats`. Same
silent-failure shape as #7: 0 rows, no error, nothing caught it until
someone actually looked at what the Roster Builder was returning (every
player's agent chip showing "?"). Fixed by parsing `Agents` (comma-split,
gated on `side='both'` so it's not attempted 3x per player-map) in the same
loop. Loading all 6 years recovered 271,105 previously-never-loaded rows.

## 9. One row in vct_2021's id-lookup file has a null Game ID
`ids/tournaments_stages_matches_games_ids.csv` for vct_2021 has exactly 1
row (of 14,489) with a missing `Game ID` — crashes `int(nan)` if not
guarded. Isolated to that single row in that single year across all 6
seasons (checked). Skipped and logged (`id_map_incomplete_row`), not
guessed — same treatment as every other malformed row here.

## 10. Transient CSV read failures on the larger files
vct_2022's `agents/teams_picked_agents.csv` (~13MB, 131,546 rows) threw
`pandas.errors.ParserError: Calling read(nbytes) on source failed` once
during a full 6-year run — and read back cleanly on an immediate manual
retry with the exact same code path, which rules out a malformed file. This
reads as an OS-level I/O hiccup (Windows antivirus/indexer file contention
is the usual suspect on a file that size), not a data-quality issue, but a
crash 5 years into a 6-year load is expensive to lose to a flake. The loader
now retries every `read_csv` up to 3x with a short backoff
(`read_csv_retry()`) before giving up — a load that's actually failing for a
real reason (corrupt file) still fails the same way after retrying; a
transient one doesn't take the whole run down with it.

## 11. Mangled (double-UTF-8-encoded) characters in a small number of names
At least one team name in vct_2021 (`ids/teams_ids.csv`: "SEMORGANIZAÇÃO")
is stored double-UTF-8-encoded in the raw source file itself — confirmed by
inspecting the raw bytes, not a pandas/sqlite read issue on this project's
side. Scope-checked: exactly 1 occurrence of the tell-tale mangled-byte
pattern across every year's `teams_ids.csv`/`players_ids.csv`, so this is a
narrow, cosmetic upstream issue (the name displays wrong, nothing crashes or
joins incorrectly) rather than a systemic one. Not fixed — guessing the
"correct" original bytes would be exactly the kind of fabrication this
project's own rules say not to do. Flagging here in case a name looks
visibly garbled somewhere in the UI; it's the source data, not a bug.

## Full 2021-2026 combined load result summary
|---|---|---|
| tournaments | 249 | |
| stages | 582 | |
| teams (global reference set) | 4,019 | 4,017 appear in >=1 loaded match |
| players (global reference set) | 15,224 | 15,215 have loaded stats |
| agents | 29 | |
| matches | 12,621 | 2021: 7,220 · 2022: 3,841 · 2023: 331 · 2024: 434 · 2025: 478 · 2026: 296 (partial season) |
| games | 27,417 | |
| rounds | 554,703 | |
| round_team_economy | 841,657 | |
| player_game_stats | 813,130 | |
| player_game_impact | 209,385 | |
| player_game_agents | 271,105 | 0 before fix #8 |
| team_game_agent_picks | 37,685 | |

Database file: ~180MB (gitignored — see the root README for the rebuild
command; GitHub hard-blocks pushes over 100MB, so this can't be committed
the way the old single-season `valorant_test_2025.db` was).
