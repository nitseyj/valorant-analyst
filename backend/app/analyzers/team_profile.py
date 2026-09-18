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

from app.analyzers import agent_analysis


# Tier-1 = VALORANT's international/franchised top flight: Champions,
# international Masters events, and the franchised regional league splits
# that feed them. Everything else loaded (regional Challengers, Ascension,
# Last Chance Qualifiers, Game Changers, domestic leagues, etc.) is Tier 2.
# The dataset has no tier column, so — same approach as SEASON_PHASES_2025
# in overview_stats.py — this is derived from real tournament names, not
# an invented/official Riot designation. Verified against every distinct
# tournament name in the loaded 2021-2026 data (53 of 249 tournaments,
# ~187 of 4,019 teams match).
TIER1_TOURNAMENT_PATTERNS = [
    "Valorant Champions 20%",                                     # world championship
    "%Masters Tokyo%", "%Masters Madrid%", "%Masters Shanghai%",
    "%Masters Reykjav%", "%Masters Copenhagen%", "%Masters Berlin%",
    "%Masters Bangkok%", "%Masters Santiago%", "%Masters Toronto%",  # international Masters
    "VCT 202_:%",                                                 # 2025/2026 franchised league splits
    "Champions Tour 2024:%",                                      # 2024 franchised league splits
    "%Americas League%", "%EMEA League%", "%Pacific League%",     # 2023 franchised league
    "%Lock-In%",
    "%Conquerors Championship%",
]


def _tier1_team_ids(conn: sqlite3.Connection) -> set:
    """team_ids that have played at least one Tier-1 match. Computed from
    the small tournaments table (249 rows) plus an indexed lookup against
    matches.tournament_id — cheap relative to joining the full teams
    table, which is the actual cost list_teams() needs to avoid."""
    clause = " OR ".join(["name LIKE ?"] * len(TIER1_TOURNAMENT_PATTERNS))
    tournament_ids = [
        r[0] for r in conn.execute(
            f"SELECT tournament_id FROM tournaments WHERE {clause}", TIER1_TOURNAMENT_PATTERNS
        ).fetchall()
    ]
    if not tournament_ids:
        return set()
    qmarks = ",".join("?" * len(tournament_ids))
    rows = conn.execute(
        f"""SELECT team_a_id FROM matches WHERE tournament_id IN ({qmarks})
            UNION
            SELECT team_b_id FROM matches WHERE tournament_id IN ({qmarks})""",
        tournament_ids + tournament_ids,
    ).fetchall()
    return {r[0] for r in rows}


def list_teams(
    conn: sqlite3.Connection,
    q: str = None,
    min_matches_for_ranking: int = 10,
    tier: str = None,
) -> list:
    """Every team that has at least one loaded match — for the Teams
    browse page. Excludes teams with zero matches so the list isn't full
    of dead entries from the global teams reference table.

    Includes each team's all-time record and win rate, sorted strongest
    first. A plain win-rate-desc sort puts a team that went 7-0 in a
    handful of regional matches above Sentinels — technically "highest
    win rate," not what "strongest teams first" actually means. So teams
    with at least `min_matches_for_ranking` matches are ranked by win rate
    among themselves and shown first; everyone else (small sample, not
    reliably comparable — same reasoning as this project's map-stats rule)
    is still listed, just below that group, also sorted by win rate within
    its own tier so nothing is hidden. `q` optionally filters by a
    case-insensitive name substring.

    `tier`: None (every loaded team — 4,000+), "tier1" (international/
    franchised orgs only, see TIER1_TOURNAMENT_PATTERNS — ~190 teams), or
    "tier2" (everyone else). This exists because listing every team and
    joining the full matches table for each one is measurably slow with
    4,000+ teams loaded (~2s, confirmed via curl) — tier1 cuts the team
    universe down before that join runs at all, rather than just relabeling
    the same full scan. Team win/loss record itself still reflects that
    team's full history (a Tier-1 org's regional-qualifier results count
    too) — tier only decides which teams are shown, not which of their
    matches are counted."""
    team_filter_sql = ""
    team_filter_params: list = []
    if tier in ("tier1", "tier2"):
        tier1_ids = _tier1_team_ids(conn)
        if tier == "tier1" and not tier1_ids:
            return []
        if tier1_ids:
            qmarks = ",".join("?" * len(tier1_ids))
            op = "IN" if tier == "tier1" else "NOT IN"
            team_filter_sql = f"AND t.team_id {op} ({qmarks})"
            team_filter_params = list(tier1_ids)

    cur = conn.execute(
        f"""SELECT t.team_id, t.name, COUNT(*) AS matches,
             SUM(CASE WHEN mm.winner_team_id = t.team_id THEN 1 ELSE 0 END) AS wins
           FROM teams t
           JOIN (
               SELECT team_a_id AS team_id, winner_team_id FROM matches
               UNION ALL
               SELECT team_b_id AS team_id, winner_team_id FROM matches
           ) mm ON mm.team_id = t.team_id
           WHERE (? IS NULL OR t.name LIKE ? COLLATE NOCASE)
           {team_filter_sql}
           GROUP BY t.team_id
           ORDER BY (matches >= ?) DESC, (wins * 1.0 / matches) DESC, wins DESC, t.name ASC""",
        [q, f"%{q}%" if q else None, *team_filter_params, min_matches_for_ranking],
    )
    return [
        {
            "team_id": r[0], "name": r[1], "matches": r[2], "wins": r[3],
            "win_rate": round(r[3] / r[2], 3) if r[2] else None,
            "ranked": r[2] >= min_matches_for_ranking,
        }
        for r in cur.fetchall()
    ]


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


def map_leaders(conn: sqlite3.Connection, team_id: int, map_name: str, min_maps_on_map: int = 2) -> dict:
    """For one team on one map: who had the most kills, most assists, and
    the highest average rating ("most effective"), among players with at
    least `min_maps_on_map` appearances on that map for this team — a
    single 1-map cameo topping the kills column isn't "the team's Bind
    killer," same small-sample reasoning as everywhere else in this
    project. Powers the click-through on a team profile's map pool row.
    Returns None fields (not a guess) if nobody clears the threshold."""
    cur = conn.execute(
        """SELECT p.name, COUNT(*) AS maps, SUM(s.kills) AS total_kills, SUM(s.assists) AS total_assists,
                  AVG(s.rating) AS avg_rating
           FROM player_game_stats s
           JOIN players p ON s.player_id = p.player_id
           JOIN games g ON s.game_id = g.game_id
           WHERE s.team_id = ? AND g.map_name = ? AND s.side = 'both' AND s.rating IS NOT NULL
           GROUP BY p.player_id""",
        (team_id, map_name),
    )
    rows = [
        {"name": r[0], "maps_played": r[1], "kills": r[2], "assists": r[3], "avg_rating": round(r[4], 2) if r[4] is not None else None}
        for r in cur.fetchall()
    ]
    qualified = [r for r in rows if r["maps_played"] >= min_maps_on_map] or rows

    def _leader(key):
        candidates = [r for r in qualified if r[key] is not None]
        if not candidates:
            return None
        best = max(candidates, key=lambda r: r[key])
        return {"name": best["name"], "value": best[key], "maps_played": best["maps_played"]}

    return {
        "map": map_name,
        "most_kills": _leader("kills"),
        "most_assists": _leader("assists"),
        "most_effective": _leader("avg_rating"),
        # True only via the fallback branch above, where nobody cleared
        # min_maps_on_map and every row shown is necessarily below it.
        "small_sample": qualified is rows and bool(rows),
    }


def _roster_years(conn, team_id) -> list:
    """Years this team has loaded player_game_stats for, most recent
    first — powers the roster year picker. A team with only one loaded
    year returns a single-item list rather than an empty/omitted filter,
    so the picker still shows what's actually available instead of
    implying every team spans 2021-2026."""
    cur = conn.execute(
        """SELECT DISTINCT t.year
           FROM player_game_stats s
           JOIN games g ON s.game_id = g.game_id
           JOIN matches m ON g.match_id = m.match_id
           JOIN tournaments t ON m.tournament_id = t.tournament_id
           WHERE s.team_id = ? AND s.side = 'both'
           ORDER BY t.year DESC""",
        (team_id,),
    )
    return [r[0] for r in cur.fetchall()]


def _top_players(conn, team_id, limit=5, year=None):
    year_join = ""
    year_where = ""
    params = [team_id]
    if year is not None:
        year_join = """JOIN games g ON s.game_id = g.game_id
                        JOIN matches m ON g.match_id = m.match_id
                        JOIN tournaments t ON m.tournament_id = t.tournament_id"""
        year_where = "AND t.year = ?"
        params.append(year)
    params.append(limit)
    cur = conn.execute(
        f"""SELECT p.player_id, p.name, COUNT(*) AS maps_played, AVG(s.rating) AS avg_rating,
                  AVG(s.acs) AS avg_acs, AVG(s.adr) AS avg_adr, AVG(s.kast_pct) AS avg_kast,
                  SUM(s.kills) AS total_kills, SUM(s.deaths) AS total_deaths, SUM(s.assists) AS total_assists,
                  SUM(s.first_kills) AS total_fk, SUM(s.first_deaths) AS total_fd
           FROM player_game_stats s
           JOIN players p ON s.player_id = p.player_id
           {year_join}
           WHERE s.team_id = ? AND s.side = 'both' AND s.rating IS NOT NULL {year_where}
           GROUP BY p.player_id
           ORDER BY maps_played DESC, avg_rating DESC
           LIMIT ?""",
        params,
    )
    rows = cur.fetchall()
    best_agents = agent_analysis.best_agents_for_players(conn, [row[0] for row in rows])
    out = []
    for row in rows:
        player_id, name, maps, rating, acs, adr, kast, kills, deaths, assists, fk, fd = row
        out.append({
            "name": name,
            "maps_played": maps,
            "rating": round(rating, 2) if rating is not None else None,
            "acs": round(acs, 1) if acs is not None else None,
            "adr": round(adr, 1) if adr is not None else None,
            "kast_pct": round(kast, 3) if kast is not None else None,
            "kills": kills, "deaths": deaths, "assists": assists,
            "first_kills": fk, "first_deaths": fd,
            "best_agent": best_agents.get(player_id, {}).get("agent"),
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


def build_team_profile(conn: sqlite3.Connection, team_id: int, year: int = None) -> dict:
    team = conn.execute("SELECT name FROM teams WHERE team_id = ?", (team_id,)).fetchone()
    if team is None:
        raise ValueError(f"team_id {team_id} not found")

    record = _record(conn, team_id)
    if record["matches"] == 0:
        raise ValueError(f"team_id {team_id} ({team[0]}) has no loaded matches")

    roster_years = _roster_years(conn, team_id)
    if year is not None and year not in roster_years:
        year = None  # no loaded roster for that year — fall back to all-time rather than return an empty roster

    return {
        "team_id": team_id,
        "name": team[0],
        "record": record,
        "win_rate": round(record["wins"] / record["matches"], 3) if record["matches"] else None,
        "map_stats": _map_stats(conn, team_id),
        "top_players": _top_players(conn, team_id, year=year),
        "roster_year": year,
        "roster_years": roster_years,
        "agent_usage": _agent_usage(conn, team_id),
        "recent_matches": _recent_matches(conn, team_id),
        "note": "recent_matches is ordered by match_id (a rough proxy for chronological order — "
                "the schema has no date field, so this is not guaranteed to be perfectly time-ordered "
                "across different tournaments). top_players is all-time unless roster_year is set.",
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
