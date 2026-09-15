"""
backend/app/analyzers/team_profile.py

Core question: "How has this team performed overall, across the whole
loaded season — not just one match?"

This is a new module beyond the Match Analyzer slice (opening_duels,
side_performance, etc.) — it looks at a team across every match they've
played in whatever data is loaded, not one match_id at a time.

Caveat that matters: the schema has no date/timestamp column on matches
(see match_analyzer_schema.sql) — "recent form" here is ordered by
match_id descending as a rough proxy for chronological order. This is NOT
guaranteed to be perfectly chronological across different tournaments
scraped at different times. Flagged in the output, not hidden.
"""

import sqlite3


def list_teams(conn: sqlite3.Connection) -> list:
    """Every team that has at least one loaded match — for a team picker.
    Excludes teams with zero matches so the picker isn't full of dead
    entries from the global teams reference table."""
    cur = conn.execute(
        """SELECT DISTINCT t.team_id, t.name
           FROM teams t
           WHERE t.team_id IN (SELECT team_a_id FROM matches UNION SELECT team_b_id FROM matches)
           ORDER BY t.name"""
    )
    return [{"team_id": r[0], "name": r[1]} for r in cur.fetchall()]


def _record(conn, team_id):
    cur = conn.execute(
        """SELECT
             SUM(CASE WHEN winner_team_id = ? THEN 1 ELSE 0 END) AS wins,
             SUM(CASE WHEN winner_team_id IS NOT NULL AND winner_team_id != ? THEN 1 ELSE 0 END) AS losses,
             COUNT(*) AS total
           FROM matches WHERE team_a_id = ? OR team_b_id = ?""",
        (team_id, team_id, team_id, team_id),
    )
    wins, losses, total = cur.fetchone()
    return {"wins": wins or 0, "losses": losses or 0, "matches": total or 0}


def _map_stats(conn, team_id):
    cur = conn.execute(
        """SELECT g.map_name,
             SUM(CASE WHEN m.team_a_id = ? THEN g.team_a_score ELSE g.team_b_score END) AS rounds_won,
             SUM(CASE WHEN m.team_a_id = ? THEN g.team_b_score ELSE g.team_a_score END) AS rounds_lost,
             SUM(CASE
                   WHEN m.team_a_id = ? AND g.team_a_score > g.team_b_score THEN 1
                   WHEN m.team_b_id = ? AND g.team_b_score > g.team_a_score THEN 1
                   ELSE 0
                 END) AS maps_won,
             COUNT(*) AS maps_played
           FROM games g JOIN matches m ON g.match_id = m.match_id
           WHERE m.team_a_id = ? OR m.team_b_id = ?
           GROUP BY g.map_name
           ORDER BY maps_played DESC""",
        (team_id, team_id, team_id, team_id, team_id, team_id),
    )
    out = []
    for map_name, rounds_won, rounds_lost, maps_won, maps_played in cur.fetchall():
        out.append({
            "map": map_name,
            "maps_played": maps_played,
            "maps_won": maps_won,
            "map_win_rate": round(maps_won / maps_played, 3) if maps_played else None,
            "round_win_rate": round(rounds_won / (rounds_won + rounds_lost), 3) if (rounds_won + rounds_lost) else None,
        })
    return out


def _top_players(conn, team_id, limit=5):
    cur = conn.execute(
        """SELECT p.name, COUNT(*) AS maps_played, AVG(s.rating) AS avg_rating,
                  AVG(s.acs) AS avg_acs, AVG(s.adr) AS avg_adr, AVG(s.kast_pct) AS avg_kast,
                  SUM(s.kills) AS total_kills, SUM(s.deaths) AS total_deaths, SUM(s.assists) AS total_assists,
                  SUM(s.first_kills) AS total_fk, SUM(s.first_deaths) AS total_fd
           FROM player_game_stats s
           JOIN players p ON s.player_id = p.player_id
           WHERE s.team_id = ? AND s.side = 'both' AND s.rating IS NOT NULL
           GROUP BY p.player_id
           ORDER BY maps_played DESC, avg_rating DESC
           LIMIT ?""",
        (team_id, limit),
    )
    out = []
    for row in cur.fetchall():
        name, maps, rating, acs, adr, kast, kills, deaths, assists, fk, fd = row
        out.append({
            "name": name,
            "maps_played": maps,
            "rating": round(rating, 2) if rating is not None else None,
            "acs": round(acs, 1) if acs is not None else None,
            "adr": round(adr, 1) if adr is not None else None,
            "kast_pct": round(kast, 3) if kast is not None else None,
            "kills": kills, "deaths": deaths, "assists": assists,
            "first_kills": fk, "first_deaths": fd,
        })
    return out


def _agent_usage(conn, team_id, limit=8):
    cur = conn.execute(
        """SELECT a.name, COUNT(DISTINCT pk.game_id) AS games_used
           FROM team_game_agent_picks pk
           JOIN agents a ON pk.agent_id = a.agent_id
           WHERE pk.team_id = ?
           GROUP BY a.agent_id
           ORDER BY games_used DESC
           LIMIT ?""",
        (team_id, limit),
    )
    return [{"agent": r[0], "games_used": r[1]} for r in cur.fetchall()]


def _recent_matches(conn, team_id, limit=8):
    cur = conn.execute(
        """SELECT m.match_id, m.match_name, t.name AS tournament, m.match_type,
                  ta.name AS team_a, tb.name AS team_b, m.team_a_score, m.team_b_score, tw.name AS winner
           FROM matches m
           JOIN tournaments t ON m.tournament_id = t.tournament_id
           JOIN teams ta ON m.team_a_id = ta.team_id
           JOIN teams tb ON m.team_b_id = tb.team_id
           LEFT JOIN teams tw ON m.winner_team_id = tw.team_id
           WHERE m.team_a_id = ? OR m.team_b_id = ?
           ORDER BY m.match_id DESC
           LIMIT ?""",
        (team_id, team_id, limit),
    )
    return [
        {
            "match_id": r[0], "match_name": r[1], "tournament": r[2], "match_type": r[3],
            "team_a": r[4], "team_b": r[5], "score": f"{r[6]}-{r[7]}", "winner": r[8],
        }
        for r in cur.fetchall()
    ]


def build_team_profile(conn: sqlite3.Connection, team_id: int) -> dict:
    team = conn.execute("SELECT name FROM teams WHERE team_id = ?", (team_id,)).fetchone()
    if team is None:
        raise ValueError(f"team_id {team_id} not found")

    record = _record(conn, team_id)
    if record["matches"] == 0:
        raise ValueError(f"team_id {team_id} ({team[0]}) has no loaded matches")

    return {
        "team_id": team_id,
        "name": team[0],
        "record": record,
        "win_rate": round(record["wins"] / record["matches"], 3) if record["matches"] else None,
        "map_stats": _map_stats(conn, team_id),
        "top_players": _top_players(conn, team_id),
        "agent_usage": _agent_usage(conn, team_id),
        "recent_matches": _recent_matches(conn, team_id),
        "note": "recent_matches is ordered by match_id (a rough proxy for chronological order — "
                "the schema has no date field, so this is not guaranteed to be perfectly time-ordered "
                "across different tournaments).",
    }


if __name__ == "__main__":
    import sys
    import json

    db_path = sys.argv[1] if len(sys.argv) > 1 else "valorant.db"
    conn = sqlite3.connect(db_path)

    if len(sys.argv) > 2:
        team_id = int(sys.argv[2])
    else:
        row = conn.execute("SELECT team_id FROM teams WHERE name = 'Paper Rex'").fetchone()
        team_id = row[0]

    print(json.dumps(build_team_profile(conn, team_id), indent=2))
