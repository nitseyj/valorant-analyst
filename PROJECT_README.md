# Valorant Analyst

An open-source VALORANT esports analytics platform — real pro-scene data,
transparent statistical analysis (no black-box ML, no fabricated
predictions), built around one philosophy: **Data → Analysis →
Explanation → Recommendation.**

Built incrementally, one working module at a time, against the real
2025 VCT season (478 matches, 337 players, 57 teams, loaded from the
[Ryan Luong VCT dataset](https://www.kaggle.com/datasets/ryanluong1/valorant-champion-tour-2021-2023-data)
on Kaggle, MIT licensed).

## What it does

- **Match Analyzer** — "why did this team win?" Six independent
  statistical analyzers (opening duels, side performance, player
  impact, economy, agent composition, clutch factor) rank themselves
  by measured impact and combine into one evidence-backed verdict.
- **Team Analyzer** — full-season team profiles: record, map pool,
  top players, agent usage, recent matches.
- **Legacy Roster Builder** — build two hypothetical 5-player lineups
  and get a transparent model projection of the matchup. Always
  labeled a projection, never a factual claim — and explicit about
  what it can't measure (lineup synergy, since a hypothetical lineup
  has never actually played together).
- **Analytics** — season-wide agent meta: pick rates and role
  distribution.
- **Home dashboard** — league-wide stats, season journey, leaderboards.

## Stack

- **Backend**: Python, FastAPI, SQLite, pandas (ETL)
- **Frontend**: currently a single dependency-free HTML/CSS/JS
  prototype (`frontend/prototype/index.html`) — no build step, open it
  directly in a browser. A real React + Vite frontend is the longer-term
  plan (see `Valorant_Analyst_Full_Project_Handoff.md` for the original
  spec).

## Project structure

```
valorant-analyst/
├── backend/
│   ├── app/
│   │   ├── analyzers/       12 analyzer modules — the analytical core
│   │   ├── database/        schema.sql
│   │   └── main.py          FastAPI app, 12 endpoints
│   └── data/
│       ├── raw/              (gitignored — see backend/data/README.md)
│       ├── dataset_report.md
│       ├── DATA_QUALITY_FINDINGS.md
│       └── valorant_test_2025.db
├── frontend/
│   └── prototype/
│       └── index.html
└── scripts/
    ├── inspect_dataset.py
    └── load_match_analyzer.py
```

## Setup

```bash
# 1. Backend
cd backend
pip install fastapi "uvicorn[standard]" pandas
python -m uvicorn app.main:app --reload

# 2. Frontend
# just open frontend/prototype/index.html in a browser —
# it connects to the API automatically if it's running,
# and falls back to embedded demo data if not
```

Interactive API docs: `http://127.0.0.1:8000/docs`

## Rebuilding the database

The dataset itself isn't in this repo (see `.gitignore` — it's ~1.3GB,
re-downloadable). To rebuild `valorant_test_2025.db` from scratch:

1. Download the [VCT 2021-2026 dataset](https://www.kaggle.com/datasets/ryanluong1/valorant-champion-tour-2021-2023-data)
2. Extract it to `backend/data/raw/`
3. `python scripts/load_match_analyzer.py backend/data/raw vct_2025 --out backend/data/valorant_test_2025.db --schema backend/app/database/schema.sql`

See `backend/data/DATA_QUALITY_FINDINGS.md` for the real data-quality
issues found and handled while building this ETL — genuinely worth
reading before extending it.

## Design principles this project follows

- Never fabricate a statistic or hallucinate a tactical explanation —
  every number traces back to real loaded data, or the feature says so
  explicitly and shows nothing rather than guess.
- No black-box ML for "why did X happen" — transparent, inspectable,
  component-based scoring throughout.
- Sample size matters — small-sample results are flagged, not treated
  equally with well-supported ones.
- Hypothetical/projected content (the Roster Builder) is always
  labeled as such, never presented as a factual prediction.

## License

MIT (matching the source dataset's license). Team logos, agent
artwork, and other VALORANT IP are Riot Games' property and are not
included in this repository — see `frontend/prototype/` for how the
UI handles that (original illustration instead of reproduced game
assets).
