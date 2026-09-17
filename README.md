# Valorant Analyst

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Backend](https://img.shields.io/badge/backend-FastAPI-009485)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)
![Status](https://img.shields.io/badge/status-active%20development-orange)

An open-source VALORANT esports analytics platform built on **real pro-scene
data**, with **transparent, inspectable statistics** — no black-box ML, no
fabricated predictions. Every number on screen traces back to a real loaded
match, or the feature says so explicitly and shows nothing rather than guess.

Built around one philosophy: **Data → Analysis → Explanation → Recommendation.**

Loaded against the real 2025 VALORANT Champions Tour season — 478 matches,
337 players, 57 teams — from the [Ryan Luong VCT dataset](https://www.kaggle.com/datasets/ryanluong1/valorant-champion-tour-2021-2023-data)
on Kaggle (MIT licensed).

## Screenshots

<table>
<tr>
<td><img src="docs/screenshots/home.png" width="410" alt="Home dashboard" /></td>
<td><img src="docs/screenshots/match-verdict.png" width="410" alt="Match verdict view" /></td>
</tr>
<tr>
<td align="center"><sub>Home dashboard</sub></td>
<td align="center"><sub>Match verdict — ranked, evidence-backed factors</sub></td>
</tr>
<tr>
<td colspan="2"><img src="docs/screenshots/team-profile.png" width="830" alt="Team profile view" /></td>
</tr>
<tr>
<td colspan="2" align="center"><sub>Team profile — season record, map pool, roster, agent usage</sub></td>
</tr>
</table>

## What it does

- **Match Analyzer** — "why did this team win?" Six independent statistical
  analyzers (opening duels, side performance, player impact, economy, agent
  composition, clutch factor) each rank themselves by measured impact and
  combine into one ranked, evidence-backed verdict.
- **Team Analyzer** — full-season team profiles: record, map pool, top
  players, agent usage, recent matches.
- **Legacy Roster Builder** — build two hypothetical 5-player lineups and get
  a transparent model projection of the matchup. Always labeled a
  projection, never a factual claim, and explicit about what it can't
  measure (lineup synergy — a hypothetical lineup has never actually played
  together).
- **Analytics** — season-wide agent meta: pick rates and role distribution.
- **Home dashboard** — league-wide stats, season journey, leaderboards.

## Stack

| | |
|---|---|
| **Backend** | Python, FastAPI, SQLite, pandas (ETL) |
| **Frontend** | React, Vite, Tailwind CSS ([`frontend/web/`](frontend/web)) |
| **Legacy frontend** | Dependency-free single-file HTML/CSS/JS, kept for reference/no-build-step use ([`frontend/prototype/`](frontend/prototype)) |

## Project structure

```
valorant-analyst/
├── backend/
│   ├── app/
│   │   ├── analyzers/        12 analyzer modules — the analytical core
│   │   ├── database/         schema.sql
│   │   └── main.py           FastAPI app, 12 endpoints
│   └── data/
│       ├── raw/               (gitignored — see backend/data/README.md)
│       ├── dataset_report.md
│       ├── DATA_QUALITY_FINDINGS.md
│       └── valorant_test_2025.db
├── frontend/
│   ├── web/                   React + Vite + Tailwind app (active UI)
│   └── prototype/
│       └── index.html         original no-build-step prototype (legacy)
├── docs/
│   └── screenshots/
└── scripts/
    ├── inspect_dataset.py
    └── load_match_analyzer.py
```

## Quickstart

```bash
# 1. Backend — FastAPI + SQLite
cd backend
pip install fastapi "uvicorn[standard]" pandas
python -m uvicorn app.main:app --reload
# -> http://127.0.0.1:8000  (interactive API docs at /docs)

# 2. Frontend — React + Vite
cd frontend/web
npm install
npm run dev
# -> http://localhost:5173, auto-connects to the API above
```

No backend running? The frontend falls back to a small set of real (not
fabricated) bundled demo data automatically, so it's still browsable offline.
See [`frontend/web/README.md`](frontend/web/README.md) for build/env-var
details, or open [`frontend/prototype/index.html`](frontend/prototype/index.html)
directly in a browser for the zero-install legacy version.

## Rebuilding the database

The dataset itself isn't in this repo (see `.gitignore` — it's ~1.3GB,
re-downloadable). To rebuild `valorant_test_2025.db` from scratch:

1. Download the [VCT 2021–2026 dataset](https://www.kaggle.com/datasets/ryanluong1/valorant-champion-tour-2021-2023-data)
2. Extract it to `backend/data/raw/`
3. Run the loader:
   ```bash
   python scripts/load_match_analyzer.py backend/data/raw vct_2025 \
     --out backend/data/valorant_test_2025.db \
     --schema backend/app/database/match_analyzer_schema.sql
   ```

See [`backend/data/DATA_QUALITY_FINDINGS.md`](backend/data/DATA_QUALITY_FINDINGS.md)
for the real data-quality issues found and handled while building this ETL —
genuinely worth reading before extending it.

## Design principles

- **Never fabricate a statistic or hallucinate a tactical explanation** —
  every number traces back to real loaded data, or the feature says so
  explicitly and shows nothing rather than guess.
- **No black-box ML for "why did X happen"** — transparent, inspectable,
  component-based scoring throughout.
- **Sample size matters** — small-sample results are flagged, not treated
  equally with well-supported ones.
- **Hypothetical/projected content** (the Roster Builder) is always labeled
  as such, never presented as a factual prediction.

## License

MIT — see [`LICENSE`](LICENSE) (matches the source dataset's license) for
the code in this repository. This project deliberately avoids reproducing
Riot's own game assets: player portraits, and map/role icons are original,
hand-drawn abstractions rather than real screenshots or artwork — see
[`frontend/web/README.md`](frontend/web/README.md) for details. Team logo
images are included under `assets/valorant/teams/`; if you fork this
project, verify your own rights to redistribute those before publishing.

VALORANT is a trademark of Riot Games, Inc. This project is not affiliated
with or endorsed by Riot Games.
