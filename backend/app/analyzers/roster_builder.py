"""
backend/app/analyzers/roster_builder.py

The Legacy Roster Builder from the original project plan (section 5):
construct a hypothetical 5-player lineup from any players in the loaded
data and simulate a hypothetical matchup against another lineup.

Hard rules from the plan, followed literally here:
  - "Do NOT present this as a factual prediction" — every output is
    labeled a "model projection," never a plain win/loss claim.
  - "Use a transparent statistical model" — the score is a sum of
    named, inspectable components (roster rating, role coverage), not
    an opaque ML model. Every component is in the evidence list.
  - The plan lists player synergy as a factor to consider, but a
    hypothetical lineup has — by definition — never played together.
    There is no synergy data for a combination that doesn't exist in
    the loaded matches. Rather than fabricate a synergy number, this
    is stated explicitly as an unmeasured factor in the response, not
    silently omitted or guessed at.

Currently scoped to whatever single season is loaded (2025) — the
plan's "different eras" framing needs multiple years loaded to mean
anything real; with one season loaded this is closer to the plan's
"Lineup Comparison" (section 4) than the full cross-era version.
"""

import sqlite3

try:
    from .agent_analysis import AGENT_ROLES, CORE_ROLES
except ImportError:
    from agent_analysis import AGENT_ROLES, CORE_ROLES


def search_players(conn: sqlite3.Connection, query: str, limit: int = 8) -> list:
    """Player name + primary team matches for a substring, for the
    lineup-builder dropdown — only players who actually have loaded
    stats (no point suggesting a name the builder can't resolve)."""
    if not query or len(query) < 2:
        return []
    rows = conn.execute(
        """SELECT DISTINCT p.player_id, p.name FROM players p
           JOIN player_game_stats s ON s.player_id = p.player_id
           WHERE p.name LIKE ? COLLATE NOCASE
           ORDER BY p.name
           LIMIT ?""",
        (f"%{query}%", limit),
    ).fetchall()
    results = []
    for player_id, name in rows:
        team_row = conn.execute(
            """SELECT t.name FROM player_game_stats s JOIN teams t ON s.team_id = t.team_id
               WHERE s.player_id = ? GROUP BY s.team_id ORDER BY COUNT(*) DESC LIMIT 1""",
            (player_id,),
        ).fetchone()
        results.append({"name": name, "team": team_row[0] if team_row else None})
    return results


def _resolve_player(conn, name):
    """Exact-name match against players who have loaded stats. If a name
    is ambiguous (shared by multiple real people — a known, documented
    issue in this dataset), picks the one with the most maps played in
    the loaded season and flags the ambiguity in the result rather than
    silently guessing."""
    rows = conn.execute(
        """SELECT p.player_id, COUNT(*) as maps, AVG(s.rating) as avg_rating, AVG(s.acs) as avg_acs
           FROM player_game_stats s JOIN players p ON s.player_id = p.player_id
           WHERE p.name = ? AND s.side = 'both' AND s.rating IS NOT NULL
           GROUP BY p.player_id
           ORDER BY maps DESC""",
        (name,),
    ).fetchall()
    if not rows:
        return None
    player_id, maps, avg_rating, avg_acs = rows[0]
    ambiguous = len(rows) > 1

    agent_rows = conn.execute(
        """SELECT a.name, COUNT(*) FROM player_game_agents pg
           JOIN agents a ON pg.agent_id = a.agent_id
           WHERE pg.player_id = ? GROUP BY pg.agent_id ORDER BY COUNT(*) DESC LIMIT 1""",
        (player_id,),
    ).fetchone()
    primary_agent = agent_rows[0] if agent_rows else None
    primary_role = AGENT_ROLES.get(primary_agent, "Unknown") if primary_agent else "Unknown"

    team_row = conn.execute(
        """SELECT t.name FROM player_game_stats s JOIN teams t ON s.team_id = t.team_id
           WHERE s.player_id = ? GROUP BY s.team_id ORDER BY COUNT(*) DESC LIMIT 1""",
        (player_id,),
    ).fetchone()
    team_name = team_row[0] if team_row else None

    return {
        "name": name,
        "player_id": player_id,
        "team": team_name,
        "maps_played": maps,
        "rating": round(avg_rating, 2) if avg_rating is not None else None,
        "acs": round(avg_acs, 1) if avg_acs is not None else None,
        "primary_agent": primary_agent,
        "primary_role": primary_role,
        "ambiguous_name": ambiguous,
        "low_sample": maps < 10,
    }


def _role_coverage_score(players):
    roles = [p["primary_role"] for p in players]
    missing = sorted(CORE_ROLES - set(roles))
    # small, transparent bonus/penalty — not weighted to dominate the
    # rating-based score, since role coverage is a secondary signal
    penalty = 0.05 * len(missing)
    return missing, penalty


def build_lineup(conn: sqlite3.Connection, names: list) -> dict:
    if len(names) != 5:
        raise ValueError(f"a lineup needs exactly 5 players, got {len(names)}")

    players = []
    not_found = []
    for name in names:
        p = _resolve_player(conn, name)
        if p is None:
            not_found.append(name)
        else:
            players.append(p)

    if not_found:
        raise ValueError(f"player(s) not found in loaded data: {', '.join(not_found)}")

    ratings = [p["rating"] for p in players if p["rating"] is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else None
    missing_roles, role_penalty = _role_coverage_score(players)

    return {
        "players": players,
        "avg_rating": round(avg_rating, 3) if avg_rating is not None else None,
        "missing_roles": missing_roles,
        "role_penalty": role_penalty,
    }


def simulate(conn: sqlite3.Connection, names_a: list, names_b: list) -> dict:
    lineup_a = build_lineup(conn, names_a)
    lineup_b = build_lineup(conn, names_b)

    if lineup_a["avg_rating"] is None or lineup_b["avg_rating"] is None:
        raise ValueError("could not compute a rating for one or both lineups")

    score_a = lineup_a["avg_rating"] - lineup_a["role_penalty"]
    score_b = lineup_b["avg_rating"] - lineup_b["role_penalty"]

    # Transparent logistic transform of the score difference — same
    # family of approach as chess/competitive ELO systems, not a
    # trained model. k=0.4 sets how sharply rating gaps translate to
    # probability; chosen so a ~0.15 rating gap (a real, noticeable
    # difference in this dataset) lands around 60/40, not a landslide.
    diff = score_a - score_b
    k = 0.4
    prob_a = 1 / (1 + 10 ** (-diff / k))

    caveats = [
        "This lineup has never actually played together — there is no "
        "synergy, comms, or in-game-leadership data for a combination "
        "that doesn't exist in the loaded matches. Not modeled; not "
        "guessed at.",
        "Based on individual season-average rating only, from whatever "
        "single season is currently loaded — not adjusted for opponent "
        "strength, map pool, or recent form trend.",
        "Role coverage is a small secondary factor, not a dominant one.",
    ]
    low_sample_players = [p["name"] for p in lineup_a["players"] + lineup_b["players"] if p["low_sample"]]
    if low_sample_players:
        caveats.append(
            f"Low sample size warning: {', '.join(low_sample_players)} have fewer than 10 maps "
            f"in the loaded data — their rating may not be representative (small-sample effect, "
            f"same caution as the project's own map-stats rule)."
        )

    return {
        "lineup_a": lineup_a,
        "lineup_b": lineup_b,
        "win_probability_a": round(prob_a, 3),
        "win_probability_b": round(1 - prob_a, 3),
        "label": "MODEL PROJECTION — hypothetical matchup",
        "caveats": caveats,
    }


if __name__ == "__main__":
    import sys
    import json

    db_path = sys.argv[1] if len(sys.argv) > 1 else "valorant.db"
    conn = sqlite3.connect(db_path)

    team_a = sys.argv[2].split(",") if len(sys.argv) > 2 else ["aspas", "Jinggg", "f0rsakeN", "Chronicle", "Boaster"]
    team_b = sys.argv[3].split(",") if len(sys.argv) > 3 else ["zekken", "aspas", "Derke", "TenZ", "yay"]

    result = simulate(conn, team_a, team_b)
    print(json.dumps(result, indent=2))
