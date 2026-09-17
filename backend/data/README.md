# backend/data

## Contents

```
data/
├── raw/vct_2021 … vct_2026/   full dataset as downloaded from Kaggle, unmodified (gitignored)
├── sample/                    first 25 rows of 5 key tables, for quick reference
├── processed/                 (empty — reserved for normalized/derived data)
├── dataset_report.md          full field inventory (every table, column, dtype, null %, sample values)
├── DATA_QUALITY_FINDINGS.md   real data-quality issues found and handled while building the ETL
└── valorant.db                 the loaded SQLite database, all 6 seasons combined (gitignored — ~180MB, see root README)
```

## Source

- **Dataset:** "Valorant Champion Tour 2021–2026 Data" by Ryan Luong
- **URL:** https://www.kaggle.com/datasets/ryanluong1/valorant-champion-tour-2021-2023-data
- **License:** MIT

## Structure as extracted

One folder per year (`vct_2021` … `vct_2026`), plus `all_ids/` — a
flattened index across all years. Each year folder contains:

- `agents/` — pick rates, team agent usage, map stats
- `matches/` — match overview, scores, kills, economy/eco rounds, draft
  phase (picks/bans), win/loss methods, team abbreviation mapping
- `players_stats/` — per-player aggregate stats
- `ids/` — player, team, tournament/stage/match-type ID lookups for that year

131 CSV files total, ~1.3GB uncompressed. `raw/` is gitignored (see the root
`.gitignore`) — it's large and easily re-downloaded from the Kaggle link
above; see the root `README.md` for the exact rebuild command.

## Known data-quality notes

(from the dataset's own documentation — see `DATA_QUALITY_FINDINGS.md` for
the fuller list found while building the ETL)

- Two different teams have both been named "Exotic" with different Team IDs
  across years — join on Team ID, not name.
- `Match Type ID` can be null when no corresponding ID was found during
  scraping.
- `Loadout Value` in `eco_rounds.csv` is unavailable from VCT Masters Toronto
  2025 onward (VLR.gg stopped publishing it).
- Performance/economy stats for matches hosted in China are largely missing
  — not available on VLR.gg at scrape time, not a bug in this dataset.
- A player is literally named `"nan"` — don't let pandas silently treat that
  as a missing value when reading player-name columns.

## Next steps for extending this

Read `dataset_report.md` before adding a new table or column — it documents
the real schema, not assumptions. `DATA_QUALITY_FINDINGS.md` is worth
reading in full before touching `scripts/load_match_analyzer.py`.
