"""
backend/app/main.py

FastAPI entrypoint for Valorant Analyst — Pro Scene / Match Analyzer slice.

Run locally:
    pip install fastapi "uvicorn[standard]"
    cd backend
    uvicorn app.main:app --reload

Then open http://127.0.0.1:8000/docs for interactive API docs (auto-generated
by FastAPI — nothing extra to write for that).

NOTE: this file was written and its import wiring was verified against the
real package layout, but the FastAPI/uvicorn endpoints themselves could not
be executed in the sandbox this was built in (no internet access to install
fastapi/uvicorn there). Test it for real the first time you run it locally —
see the curl examples at the bottom of this docstring.

    curl http://127.0.0.1:8000/health
    curl http://127.0.0.1:8000/matches?team=Paper+Rex
    curl http://127.0.0.1:8000/matches/542195
    curl http://127.0.0.1:8000/matches/542195/verdict
    curl http://127.0.0.1:8000/games/233397/verdict
"""

import os
import sqlite3
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.analyzers import match_verdict
from app.analyzers import team_profile
from app.analyzers import overview_stats

# --------------------------------------------------------------------
# Database
# --------------------------------------------------------------------
# Defaults to backend/data/valorant_test_2025.db (relative to this file),
# matching where load_match_analyzer.py writes it. Override with the
# VALORANT_DB_PATH env var to point at a different database (e.g. once
# more years are loaded into a combined valorant.db).
DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "data" / "valorant_test_2025.db"
DB_PATH = Path(os.environ.get("VALORANT_DB_PATH", DEFAULT_DB_PATH))


def get_connection() -> sqlite3.Connection:
    if not DB_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=(
                f"Database not found at {DB_PATH}. Run scripts/load_match_analyzer.py first, "
                f"or set the VALORANT_DB_PATH environment variable to point at an existing database."
            ),
        )
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# --------------------------------------------------------------------
# App
# --------------------------------------------------------------------
app = FastAPI(
    title="Valorant Analyst API",
    description=(
        "Pro-scene match analysis: opening duels, side performance, player impact, "
        "economy, composition, and a combined ranked verdict on why a match went the way it did."
    ),
    version="0.1.0",
)

# Wide-open CORS for local frontend dev on a different port. Tighten this to
# specific origins before any real deployment — never ship allow_origins=["*"]
# to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Liveness + DB reachability check."""
    try:
        conn = get_connection()
        conn.execute("SELECT 1").fetchone()
        conn.close()
        db_ok = True
    except HTTPException:
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "database": str(DB_PATH), "database_reachable": db_ok}


@app.get("/matches")
def list_matches(
    team: Optional[str] = Query(None, description="Filter by team name (partial match)"),
    tournament: Optional[str] = Query(None, description="Filter by tournament name (partial match)"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """List matches. Supports optional team/tournament filters and pagination."""
    conn = get_connection()
    try:
        clauses = []
        params: list = []
        if team:
            clauses.append("(ta.name LIKE ? OR tb.name LIKE ?)")
            params.extend([f"%{team}%", f"%{team}%"])
        if tournament:
            clauses.append("t.name LIKE ?")
            params.append(f"%{tournament}%")
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""

        query = f"""
            SELECT m.match_id, m.match_name, t.name AS tournament, s.name AS stage, m.match_type,
                   ta.name AS team_a, tb.name AS team_b, m.team_a_score, m.team_b_score, tw.name AS winner
            FROM matches m
            JOIN tournaments t ON m.tournament_id = t.tournament_id
            JOIN stages s ON m.stage_id = s.stage_id
            JOIN teams ta ON m.team_a_id = ta.team_id
            JOIN teams tb ON m.team_b_id = tb.team_id
            LEFT JOIN teams tw ON m.winner_team_id = tw.team_id
            {where}
            ORDER BY m.match_id DESC
            LIMIT ? OFFSET ?
        """
        params.extend([limit, offset])
        rows = conn.execute(query, params).fetchall()
        return {"count": len(rows), "matches": [dict(r) for r in rows]}
    finally:
        conn.close()


@app.get("/matches/{match_id}")
def get_match(match_id: int):
    """Basic match info: teams, score, maps played. Use this before /verdict
    if the frontend just needs to render a match card, not the full analysis."""
    conn = get_connection()
    try:
        row = conn.execute(
            """SELECT m.match_id, m.match_name, t.name AS tournament, s.name AS stage, m.match_type,
                      ta.name AS team_a, tb.name AS team_b, m.team_a_score, m.team_b_score, tw.name AS winner
               FROM matches m
               JOIN tournaments t ON m.tournament_id = t.tournament_id
               JOIN stages s ON m.stage_id = s.stage_id
               JOIN teams ta ON m.team_a_id = ta.team_id
               JOIN teams tb ON m.team_b_id = tb.team_id
               LEFT JOIN teams tw ON m.winner_team_id = tw.team_id
               WHERE m.match_id = ?""",
            (match_id,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail=f"match_id {match_id} not found")
        games = conn.execute(
            "SELECT game_id, map_name, team_a_score, team_b_score FROM games WHERE match_id = ?",
            (match_id,),
        ).fetchall()
        result = dict(row)
        result["games"] = [dict(g) for g in games]
        return result
    finally:
        conn.close()


@app.get("/matches/{match_id}/verdict")
def get_match_verdict(match_id: int):
    """The core endpoint: runs every analyzer against this match (series-level,
    aggregated across all maps) and returns a ranked, evidence-backed verdict."""
    conn = get_connection()
    try:
        try:
            return match_verdict.build_verdict(conn, match_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    finally:
        conn.close()


@app.get("/games/{game_id}/verdict")
def get_game_verdict(game_id: int):
    """Same idea as /matches/{id}/verdict but scoped to a single map, for
    when the frontend is showing one specific map rather than the series."""
    conn = get_connection()
    try:
        results = []
        skipped = []
        for module in match_verdict.ANALYZERS:
            try:
                results.append(module.analyze_game(conn, game_id))
            except ValueError as e:
                skipped.append({"analyzer": module.__name__, "reason": str(e)})
        if not results:
            raise HTTPException(status_code=404, detail=f"game_id {game_id}: no analyzer produced a usable result")

        results.sort(key=lambda r: r["impact"], reverse=True)
        ranked = [
            {
                "rank": i,
                "category": r["category"],
                "impact": r["impact"],
                "impact_label": match_verdict._impact_label(r["impact"]),
                "winner": r["winner"],
                "summary": r["summary"],
                "evidence": r["evidence"],
            }
            for i, r in enumerate(results, start=1)
        ]
        response = {"game_id": game_id, "primary_factor": ranked[0], "ranked_factors": ranked}
        if skipped:
            response["skipped_analyzers"] = skipped
        return response
    finally:
        conn.close()


@app.get("/teams")
def get_teams():
    """List every team that has at least one loaded match — for a team picker."""
    conn = get_connection()
    try:
        return {"teams": team_profile.list_teams(conn)}
    finally:
        conn.close()


@app.get("/teams/{team_id}/profile")
def get_team_profile(team_id: int):
    """Full-season profile for one team: record, map pool, top players,
    agent usage, and recent matches — aggregated across every loaded
    match, not scoped to one match_id like /matches/{id}/verdict is."""
    conn = get_connection()
    try:
        try:
            return team_profile.build_team_profile(conn, team_id)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
    finally:
        conn.close()


@app.get("/stats/overview")
def get_overview_stats():
    """League-wide aggregates for the home dashboard: counts, season
    journey, top players, team performance leaderboard, map play counts."""
    conn = get_connection()
    try:
        return overview_stats.build_overview(conn)
    finally:
        conn.close()
