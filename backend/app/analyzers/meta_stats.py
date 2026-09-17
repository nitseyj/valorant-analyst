"""
backend/app/analyzers/meta_stats.py

Core question: "What's the agent meta across the whole loaded season?"
— powers the Analytics page. This is the "META" section from the
original project plan (section 9 / section 12), scoped to agent pick
rates and role distribution — skin/weapon meta is explicitly out of
scope per the plan's own note (section 12: "do not assume normal
match-stat datasets contain the skin a player used").

Optionally filterable by year and/or map — both filter the SAME
team-game-slot denominator the pick-rate math depends on, so a filtered
view's rates are still real percentages of the filtered pool, not the
whole dataset's total re-used against a smaller numerator.
"""

import sqlite3

try:
    from .agent_analysis import AGENT_ROLES
except ImportError:
    from agent_analysis import AGENT_ROLES


def _year_map_filter(year, map_name):
    """(join_sql, where_sql, params) for filtering team_game_agent_picks by
    year/map — joins through games/matches/tournaments. Always joins
    (cheap) rather than conditionally, so the count query and the
    breakdown query below can never drift out of sync with each other."""
    join_sql = """
        JOIN games g ON pk.game_id = g.game_id
        JOIN matches m ON g.match_id = m.match_id
        JOIN tournaments t ON m.tournament_id = t.tournament_id
    """
    clauses = []
    params = []
    if year is not None:
        clauses.append("t.year = ?")
        params.append(year)
    if map_name is not None:
        clauses.append("g.map_name = ?")
        params.append(map_name)
    where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    return join_sql, where_sql, params


def agent_meta(conn: sqlite3.Connection, year: int = None, map_name: str = None) -> list:
    # Denominator must be team-game slots (2 per map), not just games —
    # each map has two teams independently picking a composition, so the
    # maximum possible "picks" for a universally-picked agent is 2x the
    # game count, not 1x. Caught this exact bug when pick_rate initially
    # came out at 126% for the most common agent, which is impossible.
    join_sql, where_sql, params = _year_map_filter(year, map_name)
    total_slots = conn.execute(
        f"""SELECT COUNT(DISTINCT pk.game_id || '-' || pk.team_id)
            FROM team_game_agent_picks pk {join_sql} {where_sql}""",
        params,
    ).fetchone()[0]
    if total_slots == 0:
        return []
    rows = conn.execute(
        f"""SELECT a.name, COUNT(DISTINCT pk.game_id || '-' || pk.team_id) AS picks
            FROM team_game_agent_picks pk
            JOIN agents a ON pk.agent_id = a.agent_id
            {join_sql}
            {where_sql}
            GROUP BY a.agent_id ORDER BY picks DESC""",
        params,
    ).fetchall()
    out = []
    for name, picks in rows:
        out.append({
            "agent": name,
            "role": AGENT_ROLES.get(name, "Unknown"),
            "picks": picks,
            "pick_rate": round(picks / total_slots, 3),
        })
    return out


def role_distribution(conn: sqlite3.Connection, year: int = None, map_name: str = None) -> list:
    """Aggregated from agent_meta — total picks per role, not per agent."""
    agents = agent_meta(conn, year=year, map_name=map_name)
    totals = {}
    for a in agents:
        totals[a["role"]] = totals.get(a["role"], 0) + a["picks"]
    total_all = sum(totals.values()) or 1
    return sorted(
        [{"role": role, "picks": count, "share": round(count / total_all, 3)} for role, count in totals.items()],
        key=lambda r: r["picks"], reverse=True,
    )


def available_years(conn: sqlite3.Connection) -> list:
    rows = conn.execute("SELECT DISTINCT year FROM tournaments ORDER BY year").fetchall()
    return [r[0] for r in rows]


def available_maps(conn: sqlite3.Connection) -> list:
    rows = conn.execute("SELECT DISTINCT map_name FROM games ORDER BY map_name").fetchall()
    return [r[0] for r in rows]


def build_meta(conn: sqlite3.Connection, year: int = None, map_name: str = None) -> dict:
    return {
        "agent_meta": agent_meta(conn, year=year, map_name=map_name),
        "role_distribution": role_distribution(conn, year=year, map_name=map_name),
        "available_years": available_years(conn),
        "available_maps": available_maps(conn),
    }


if __name__ == "__main__":
    import sys
    import json

    db_path = sys.argv[1] if len(sys.argv) > 1 else "valorant.db"
    conn = sqlite3.connect(db_path)
    print(json.dumps(build_meta(conn), indent=2))
