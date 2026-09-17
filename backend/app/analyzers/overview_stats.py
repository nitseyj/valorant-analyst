"""
backend/app/analyzers/overview_stats.py

Core question: "Give me the top-line numbers for the whole loaded season"
— powers the home dashboard's stat cards, VCT journey timeline, top
players leaderboard, team performance leaderboard, and map play counts.

Everything here is a real aggregate query against loaded data. No
fabricated numbers, no placeholder content — if a number can't be
computed honestly from what's loaded, it's left out rather than guessed.
"""

import sqlite3

# The real 2025 VCT season phase order. This is domain knowledge (the
# actual known tournament calendar structure), not derived from the
# database — the schema has no explicit "phase order" field, only
# tournament names, so this list maps phase labels to the (partial)
# tournament name that identifies them. Extend/adjust for other years.
SEASON_PHASES_2025 = [
    ("Kickoff", "Kickoff"),
    ("Stage 1", "Stage 1"),
    ("Masters Bangkok", "Masters Bangkok"),
    ("Stage 2", "Stage 2"),
    ("Masters Toronto", "Masters Toronto"),
    ("Champions", "Champions"),
]


def overview_counts(conn: sqlite3.Connection) -> dict:
    players = conn.execute("SELECT COUNT(DISTINCT player_id) FROM player_game_stats").fetchone()[0]
    teams = conn.execute(
        "SELECT COUNT(DISTINCT t) FROM (SELECT team_a_id AS t FROM matches UNION SELECT team_b_id FROM matches)"
    ).fetchone()[0]
    matches = conn.execute("SELECT COUNT(*) FROM matches").fetchone()[0]
    games = conn.execute("SELECT COUNT(*) FROM games").fetchone()[0]
    events = conn.execute("SELECT COUNT(*) FROM tournaments").fetchone()[0]
    return {"players": players, "teams": teams, "matches": matches, "maps_played": games, "events": events}


def season_journey(conn: sqlite3.Connection, year: int = 2025) -> list:
    """Which of the known season phases actually have loaded data, in
    real calendar order. Phases with zero matches are omitted rather
    than shown as empty — don't imply data that isn't there.

    `year` filters against tournaments.year — without it, phase labels
    like "Stage 1" or "Champions" match same-named tournaments across
    every loaded year (VCT reuses these phase names year to year), which
    silently blends multiple seasons' match counts under one year's label
    once more than one season is loaded."""
    out = []
    for label, name_fragment in SEASON_PHASES_2025:
        count = conn.execute(
            "SELECT COUNT(*) FROM matches m JOIN tournaments t ON m.tournament_id = t.tournament_id "
            "WHERE t.name LIKE ? AND t.year = ?",
            (f"%{name_fragment}%", year),
        ).fetchone()[0]
        if count > 0:
            out.append({"phase": label, "matches": count})
    return out


def top_players(conn: sqlite3.Connection, min_maps: int = 10, limit: int = 5) -> list:
    """All-time leaderboard across every loaded year, not scoped to one
    season — no year filter here, unlike season_journey(). A deliberate
    choice (an all-time ACS leaderboard is a normal, well-understood
    thing), not an oversight; see roster_builder.py for where blending
    years together across a career actually needs its own caveat instead
    (an individual-lineup projection, not a leaderboard)."""
    rows = conn.execute(
        """SELECT p.name, t.name AS team, AVG(s.acs) AS avg_acs, AVG(s.rating) AS avg_rating, COUNT(*) AS maps
           FROM player_game_stats s
           JOIN players p ON s.player_id = p.player_id
           JOIN teams t ON s.team_id = t.team_id
           WHERE s.side = 'both' AND s.acs IS NOT NULL
           GROUP BY s.player_id
           HAVING maps >= ?
           ORDER BY avg_acs DESC
           LIMIT ?""",
        (min_maps, limit),
    ).fetchall()
    return [
        {"name": r[0], "team": r[1], "acs": round(r[2], 1), "rating": round(r[3], 2), "maps": r[4]}
        for r in rows
    ]


# Whitelisted metric -> (real column, display label, is-a-percentage,
# decimal places). Whitelisted rather than interpolating a raw query-string
# value into SQL — `metric` only ever selects one of these fixed, known-safe
# column names, never arbitrary user text.
LEADERBOARD_METRICS = {
    "rating": ("rating", "Rating", False, 2),
    "acs": ("acs", "ACS", False, 1),
    "adr": ("adr", "ADR", False, 1),
    "kast": ("kast_pct", "KAST%", True, 1),
    "hs": ("hs_pct", "HS%", True, 1),
}


def players_leaderboard(conn: sqlite3.Connection, metric: str = "acs", min_maps: int = 10, limit: int = 20) -> list:
    """Full ranked leaderboard for the Players page — unlike top_players()
    (a fixed ACS-only top-5 for the home dashboard mini-widget), this ranks
    by any of LEADERBOARD_METRICS and returns up to `limit` players."""
    if metric not in LEADERBOARD_METRICS:
        raise ValueError(f"unknown metric {metric!r}; choose one of {sorted(LEADERBOARD_METRICS)}")
    column, label, is_pct, decimals = LEADERBOARD_METRICS[metric]
    rows = conn.execute(
        f"""SELECT p.name, t.name AS team, AVG(s.{column}) AS val, AVG(s.rating) AS avg_rating, COUNT(*) AS maps
            FROM player_game_stats s
            JOIN players p ON s.player_id = p.player_id
            JOIN teams t ON s.team_id = t.team_id
            WHERE s.side = 'both' AND s.{column} IS NOT NULL
            GROUP BY s.player_id
            HAVING maps >= ?
            ORDER BY val DESC
            LIMIT ?""",
        (min_maps, limit),
    ).fetchall()
    value_mult = 100 if is_pct else 1
    return [
        {
            "name": r[0], "team": r[1],
            "value": round(r[2] * value_mult, decimals),
            "rating": round(r[3], 2) if r[3] is not None else None,
            "maps": r[4],
        }
        for r in rows
    ]


def team_performance(conn: sqlite3.Connection, min_matches: int = 15, limit: int = 5) -> list:
    rows = conn.execute(
        """SELECT t.team_id, t.name, COUNT(*) AS matches,
             SUM(CASE WHEN m.winner_team_id = t.team_id THEN 1 ELSE 0 END) AS wins
           FROM teams t
           JOIN matches m ON (m.team_a_id = t.team_id OR m.team_b_id = t.team_id)
           GROUP BY t.team_id
           HAVING matches >= ?
           ORDER BY (wins * 1.0 / matches) DESC
           LIMIT ?""",
        (min_matches, limit),
    ).fetchall()
    return [
        {"team_id": r[0], "name": r[1], "matches": r[2], "wins": r[3],
         "win_rate": round(r[3] / r[2], 3)}
        for r in rows
    ]


def map_stats(conn: sqlite3.Connection, min_played: int = 20) -> list:
    """Times played per map, globally — NOT a "win rate" (that's only
    meaningful per-team, since team_a/team_b are arbitrary labels, not
    attacker/defender)."""
    rows = conn.execute(
        "SELECT map_name, COUNT(*) AS played FROM games GROUP BY map_name HAVING played >= ? ORDER BY played DESC",
        (min_played,),
    ).fetchall()
    return [{"map": r[0], "played": r[1]} for r in rows]


def build_overview(conn: sqlite3.Connection) -> dict:
    return {
        "counts": overview_counts(conn),
        "season_journey": season_journey(conn),
        "top_players": top_players(conn),
        "team_performance": team_performance(conn),
        "map_stats": map_stats(conn),
    }


if __name__ == "__main__":
    import sys
    import json

    db_path = sys.argv[1] if len(sys.argv) > 1 else "valorant.db"
    conn = sqlite3.connect(db_path)
    print(json.dumps(build_overview(conn), indent=2))
