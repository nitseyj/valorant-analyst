# Complete current state — replace everything with this

You're missing pieces from a few different updates, so rather than
tracking down which file came from which version, just replace
everything with what's in this zip.

## What's in here

```
index.html                                    → your frontend/prototype/index.html
backend/app/main.py                           → backend/app/main.py
backend/app/analyzers/*.py (11 files)         → backend/app/analyzers/ (replace all)
backend/__init__.py, app/__init__.py,
  app/analyzers/__init__.py                   → same locations (empty files, required)
backend/scripts_load_match_analyzer.py        → scripts/load_match_analyzer.py
```

## Steps

1. **Delete** the contents of your `backend/app/analyzers/` folder and
   copy in all 11 `.py` files from here, plus `__init__.py`.
2. **Replace** `backend/app/main.py`.
3. **Replace** `backend/__init__.py` and `backend/app/__init__.py` (just
   in case — these must exist, even empty, for imports to work).
4. **Replace** `frontend/prototype/index.html`.
5. **Replace** `scripts/load_match_analyzer.py` with
   `backend/scripts_load_match_analyzer.py` from here (renamed — it's
   named that way here only so it doesn't collide with anything during
   copying).
6. **Re-run the ETL** if you haven't since the `player_game_agents` fix:
   ```
   python scripts/load_match_analyzer.py backend/data/raw vct_2025 --out backend/data/valorant_test_2025.db --schema backend/app/database/schema.sql
   ```
   (adjust paths to match your actual folders)
7. Restart the server: `python -m uvicorn app.main:app --reload`
8. Open `http://127.0.0.1:8000/docs` — you should see 12 routes listed,
   including `/roster-builder/simulate`, `/players/search`, and
   `/stats/meta`. If you see all 12, you're fully current.

## What this gets you that you were missing

- The Legacy Roster Builder actually working (was 404ing before —
  your `main.py` didn't have the route yet)
- The rich player dropdown (team logo → portrait → name) when building
  lineups
- The Analytics page (Agent Meta — pick rates, role distribution)
- The Clutch Factor analyzer on match verdicts
- Several real bug fixes from along the way — waylay's role, the
  pick-rate math, the `player_game_agents` ETL gap, the `loadout_value`
  string-parsing bug, and others documented in earlier READMEs
