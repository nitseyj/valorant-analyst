"""
backend/app/analyzers/meta_stats.py

Core question: "What's the agent meta across the whole loaded season?"
— powers the Analytics page. This is the "META" section from the
original project plan (section 9 / section 12), scoped to agent pick
rates and role distribution — skin/weapon meta is explicitly out of
scope per the plan's own note (section 12: "do not assume normal
match-stat datasets contain the skin a player used").
"""

import sqlite3

try:
    from .agent_analysis import AGENT_ROLES
except ImportError:
    from agent_analysis import AGENT_ROLES


def agent_meta(conn: sqlite3.Connection) -> list:
    # Denominator must be team-game slots (2 per map), not just games —
    # each map has two teams independently picking a composition, so the
    # maximum possible "picks" for a universally-picked agent is 2x the
    # game count, not 1x. Caught this exact bug when pick_rate initially
    # came out at 126% for the most common agent, which is impossible.
    total_slots = conn.execute(
        "SELECT COUNT(DISTINCT game_id || '-' || team_id) FROM team_game_agent_picks"
    ).fetchone()[0]
    if total_slots == 0:
        return []
    rows = conn.execute(
        """SELECT a.name, COUNT(DISTINCT pk.game_id || '-' || pk.team_id) AS picks
           FROM team_game_agent_picks pk JOIN agents a ON pk.agent_id = a.agent_id
           GROUP BY a.agent_id ORDER BY picks DESC"""
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


def role_distribution(conn: sqlite3.Connection) -> list:
    """Aggregated from agent_meta — total picks per role, not per agent."""
    agents = agent_meta(conn)
    totals = {}
    for a in agents:
        totals[a["role"]] = totals.get(a["role"], 0) + a["picks"]
    total_all = sum(totals.values()) or 1
    return sorted(
        [{"role": role, "picks": count, "share": round(count / total_all, 3)} for role, count in totals.items()],
        key=lambda r: r["picks"], reverse=True,
    )


def build_meta(conn: sqlite3.Connection) -> dict:
    return {
        "agent_meta": agent_meta(conn),
        "role_distribution": role_distribution(conn),
    }


if __name__ == "__main__":
    import sys
    import json

    db_path = sys.argv[1] if len(sys.argv) > 1 else "valorant.db"
    conn = sqlite3.connect(db_path)
    print(json.dumps(build_meta(conn), indent=2))
