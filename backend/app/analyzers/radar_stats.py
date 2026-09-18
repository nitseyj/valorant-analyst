"""
backend/app/analyzers/radar_stats.py

Core question: "How does this team/player compare against another, across
several dimensions at once?" — powers the 5-axis radar ("pentagon") chart
used for team-vs-team and player-vs-player comparisons.

Every axis is a real aggregate already computable from loaded data — no
invented "power rating" or opaque composite score. Axis values are shown
to the user as their real units (win rate as a %, ACS as ACS, ...); the
0-1 "normalized" value alongside each is only a plotting coordinate, not
a hidden score, and is always computed from real min/max bounds observed
in the loaded data (not arbitrary fixed thresholds) so the chart reflects
what's actually loaded, not a guess at "good" vs "bad".

Deliberately excludes attack/defend-side round win rate: games stores
rounds WON per side (team_a_attack_score etc.) but not rounds PLAYED per
side, and round format isn't fixed across every loaded season (overtime,
rule changes) — computing a rate would mean guessing the denominator.
Left out rather than guessed, same rule as everywhere else in this
project.
"""

import sqlite3

from app.analyzers import agent_analysis

# (sql_expression, label, decimals, is_percentage)
TEAM_RADAR_METRICS = [
    ("win_rate", "Win Rate", 1, True),
    ("round_win_rate", "Round Win Rate", 1, True),
    ("avg_rating", "Avg Rating", 2, False),
    ("avg_acs", "Avg ACS", 0, False),
    ("clutches_per_map", "Clutches / Map", 2, False),
]

PLAYER_RADAR_METRICS = [
    ("rating", "Rating", 2, False),
    ("acs", "ACS", 0, False),
    ("adr", "ADR", 0, False),
    ("kast_pct", "KAST%", 1, True),
    ("hs_pct", "HS%", 1, True),
]


def _team_raw_stats(conn: sqlite3.Connection, team_id: int) -> dict:
    row = conn.execute(
        """SELECT
             COUNT(*) AS matches,
             SUM(CASE WHEN winner_team_id = ? THEN 1 ELSE 0 END) AS wins
           FROM matches WHERE team_a_id = ? OR team_b_id = ?""",
        (team_id, team_id, team_id),
    ).fetchone()
    matches, wins = row
    win_rate = (wins / matches) if matches else None

    row = conn.execute(
        """SELECT
             SUM(CASE WHEN m.team_a_id = ? THEN g.team_a_score ELSE g.team_b_score END) AS rounds_won,
             SUM(CASE WHEN m.team_a_id = ? THEN g.team_b_score ELSE g.team_a_score END) AS rounds_lost,
             COUNT(*) AS maps_played
           FROM games g JOIN matches m ON g.match_id = m.match_id
           WHERE m.team_a_id = ? OR m.team_b_id = ?""",
        (team_id, team_id, team_id, team_id),
    ).fetchone()
    rounds_won, rounds_lost, maps_played = row
    total_rounds = (rounds_won or 0) + (rounds_lost or 0)
    round_win_rate = (rounds_won / total_rounds) if total_rounds else None

    row = conn.execute(
        """SELECT AVG(rating), AVG(acs) FROM player_game_stats
           WHERE team_id = ? AND side = 'both' AND rating IS NOT NULL""",
        (team_id,),
    ).fetchone()
    avg_rating, avg_acs = row

    row = conn.execute(
        """SELECT SUM(clutch_1v1 + clutch_1v2 + clutch_1v3 + clutch_1v4 + clutch_1v5)
           FROM player_game_impact WHERE team_id = ?""",
        (team_id,),
    ).fetchone()
    total_clutches = row[0] or 0
    clutches_per_map = (total_clutches / maps_played) if maps_played else None

    return {
        "matches": matches or 0,
        "win_rate": win_rate,
        "round_win_rate": round_win_rate,
        "avg_rating": avg_rating,
        "avg_acs": avg_acs,
        "clutches_per_map": clutches_per_map,
    }


def _team_metric_bounds(conn: sqlite3.Connection, min_matches: int = 10) -> dict:
    """Real min/max per metric across every team with at least
    `min_matches` matches — the normalization range for the radar chart's
    0-1 axes. Small-sample teams are excluded from the bounds themselves
    (same reasoning as list_teams' ranking tier) so one 2-match fluke
    doesn't stretch the whole chart, but a team being *plotted* doesn't
    require this threshold — only the bounds computation does.

    Computed as a handful of batched GROUP BY queries (one pass each over
    matches/games/player_game_stats/player_game_impact), not one query
    per qualifying team — with 570+ teams clearing the match-count bar,
    a per-team loop like _team_raw_stats() would mean 2,000+ queries just
    to draw one chart."""
    qualifying = conn.execute(
        """SELECT team_id, COUNT(*) AS matches FROM (
               SELECT team_a_id AS team_id FROM matches
               UNION ALL
               SELECT team_b_id AS team_id FROM matches
           )
           GROUP BY team_id
           HAVING matches >= ?""",
        (min_matches,),
    ).fetchall()
    qualifying_ids = {r[0] for r in qualifying}
    if not qualifying_ids:
        return {key: [None, None] for key, _, _, _ in TEAM_RADAR_METRICS}
    qmarks = ",".join("?" * len(qualifying_ids))
    params = list(qualifying_ids)

    bounds = {key: [None, None] for key, _, _, _ in TEAM_RADAR_METRICS}

    def _track(key, value):
        if value is None:
            return
        lo, hi = bounds[key]
        bounds[key] = [value if lo is None else min(lo, value), value if hi is None else max(hi, value)]

    win_rows = conn.execute(
        f"""SELECT team_id, COUNT(*) AS matches, SUM(CASE WHEN winner_team_id = team_id THEN 1 ELSE 0 END) AS wins
            FROM (
                SELECT match_id, team_a_id AS team_id, winner_team_id FROM matches WHERE team_a_id IN ({qmarks})
                UNION ALL
                SELECT match_id, team_b_id AS team_id, winner_team_id FROM matches WHERE team_b_id IN ({qmarks})
            )
            GROUP BY team_id""",
        params + params,
    ).fetchall()
    for team_id, matches, wins in win_rows:
        if team_id in qualifying_ids and matches:
            _track("win_rate", wins / matches)

    maps_played_by_team = {}
    round_rows = conn.execute(
        f"""SELECT team_id,
                   SUM(rounds_won) AS rounds_won, SUM(rounds_lost) AS rounds_lost, COUNT(*) AS maps_played
            FROM (
                SELECT g.game_id, m.team_a_id AS team_id, g.team_a_score AS rounds_won, g.team_b_score AS rounds_lost
                FROM games g JOIN matches m ON g.match_id = m.match_id WHERE m.team_a_id IN ({qmarks})
                UNION ALL
                SELECT g.game_id, m.team_b_id AS team_id, g.team_b_score AS rounds_won, g.team_a_score AS rounds_lost
                FROM games g JOIN matches m ON g.match_id = m.match_id WHERE m.team_b_id IN ({qmarks})
            )
            GROUP BY team_id""",
        params + params,
    ).fetchall()
    for team_id, rounds_won, rounds_lost, maps_played in round_rows:
        maps_played_by_team[team_id] = maps_played
        total = (rounds_won or 0) + (rounds_lost or 0)
        if team_id in qualifying_ids and total:
            _track("round_win_rate", rounds_won / total)

    rating_rows = conn.execute(
        f"""SELECT team_id, AVG(rating), AVG(acs) FROM player_game_stats
            WHERE team_id IN ({qmarks}) AND side = 'both' AND rating IS NOT NULL
            GROUP BY team_id""",
        params,
    ).fetchall()
    for team_id, avg_rating, avg_acs in rating_rows:
        if team_id in qualifying_ids:
            _track("avg_rating", avg_rating)
            _track("avg_acs", avg_acs)

    clutch_rows = conn.execute(
        f"""SELECT team_id, SUM(clutch_1v1 + clutch_1v2 + clutch_1v3 + clutch_1v4 + clutch_1v5)
            FROM player_game_impact WHERE team_id IN ({qmarks})
            GROUP BY team_id""",
        params,
    ).fetchall()
    for team_id, total_clutches in clutch_rows:
        maps_played = maps_played_by_team.get(team_id)
        if team_id in qualifying_ids and maps_played:
            _track("clutches_per_map", (total_clutches or 0) / maps_played)

    return bounds


def _normalize(value, lo, hi):
    if value is None or lo is None or hi is None:
        return None
    if hi == lo:
        return 0.5
    return round(max(0.0, min(1.0, (value - lo) / (hi - lo))), 3)


def team_radar(conn: sqlite3.Connection, team_id: int, min_matches: int = 10, bounds: dict = None) -> dict:
    """5-axis stat profile for one team, each axis normalized against the
    real range observed across every team with >= min_matches loaded
    matches (see _team_metric_bounds). Pass a precomputed `bounds` (e.g.
    from a head-to-head comparison building two of these) to skip
    recomputing it — the bounds scan is the expensive part, and two teams
    compared against each other must share one set of bounds anyway for
    the chart to mean anything."""
    team = conn.execute("SELECT name FROM teams WHERE team_id = ?", (team_id,)).fetchone()
    if team is None:
        raise ValueError(f"team_id {team_id} not found")
    stats = _team_raw_stats(conn, team_id)
    if bounds is None:
        bounds = _team_metric_bounds(conn, min_matches)
    axes = []
    for key, label, decimals, is_pct in TEAM_RADAR_METRICS:
        value = stats.get(key)
        lo, hi = bounds.get(key, (None, None))
        display = None
        if value is not None:
            display = round(value * 100, decimals) if is_pct else round(value, decimals)
        axes.append({
            "metric": key,
            "label": label,
            "value": display,
            "is_percentage": is_pct,
            "normalized": _normalize(value, lo, hi),
        })
    return {"team_id": team_id, "name": team[0], "matches": stats["matches"], "axes": axes}


def team_radar_comparison(conn: sqlite3.Connection, team_id: int, compare_team_id: int = None, min_matches: int = 10) -> dict:
    """team_radar() for one team, plus a second team on the *same* bounds
    if `compare_team_id` is given — this is what actually makes the chart
    a valid comparison (each team's axes computed against a different
    range would draw two shapes that aren't really on the same scale)."""
    bounds = _team_metric_bounds(conn, min_matches)
    a = team_radar(conn, team_id, min_matches, bounds=bounds)
    b = team_radar(conn, compare_team_id, min_matches, bounds=bounds) if compare_team_id is not None else None
    return {"a": a, "b": b}


def _player_raw_stats(conn: sqlite3.Connection, player_id: int) -> dict:
    row = conn.execute(
        """SELECT AVG(rating), AVG(acs), AVG(adr), AVG(kast_pct), AVG(hs_pct), COUNT(*)
           FROM player_game_stats
           WHERE player_id = ? AND side = 'both' AND rating IS NOT NULL""",
        (player_id,),
    ).fetchone()
    rating, acs, adr, kast_pct, hs_pct, maps = row
    return {"rating": rating, "acs": acs, "adr": adr, "kast_pct": kast_pct, "hs_pct": hs_pct, "maps_played": maps or 0}


def _player_metric_bounds(conn: sqlite3.Connection, min_maps: int = 10) -> dict:
    """Real min/max per metric across every player with >= min_maps
    loaded maps — same reasoning as _team_metric_bounds. This scans the
    813k-row player_game_stats table once (indexed via idx_player_game_
    stats_player is not applicable here since it's a full aggregate, not
    an IN-list lookup, but the GROUP BY is a single pass, not N queries)."""
    rows = conn.execute(
        """SELECT AVG(rating), AVG(acs), AVG(adr), AVG(kast_pct), AVG(hs_pct)
           FROM player_game_stats
           WHERE side = 'both' AND rating IS NOT NULL
           GROUP BY player_id
           HAVING COUNT(*) >= ?""",
        (min_maps,),
    ).fetchall()
    bounds = {key: [None, None] for key, _, _, _ in PLAYER_RADAR_METRICS}
    keys = [key for key, _, _, _ in PLAYER_RADAR_METRICS]
    for row in rows:
        for i, key in enumerate(keys):
            val = row[i]
            if val is None:
                continue
            lo, hi = bounds[key]
            bounds[key] = [val if lo is None else min(lo, val), val if hi is None else max(hi, val)]
    return bounds


def _resolve_player_id(conn, name):
    """Exact-name match, most-maps-played pick on ambiguity — mirrors
    roster_builder._resolve_player's resolution rule so the two features
    never disagree about which real person a name refers to."""
    row = conn.execute(
        """SELECT p.player_id FROM player_game_stats s
           JOIN players p ON s.player_id = p.player_id
           WHERE p.name = ? AND s.side = 'both'
           GROUP BY p.player_id
           ORDER BY COUNT(*) DESC
           LIMIT 1""",
        (name,),
    ).fetchone()
    return row[0] if row else None


def player_radar(conn: sqlite3.Connection, name: str, min_maps: int = 10, bounds: dict = None) -> dict:
    """5-axis stat profile (Rating/ACS/ADR/KAST%/HS%) for one player,
    normalized against the real range observed across every player with
    >= min_maps loaded maps. Same career-wide-average caveat as
    roster_builder/players_leaderboard: not scoped to one season. Pass a
    precomputed `bounds` to skip re-scanning player_game_stats — required
    when comparing two players so they share one normalization range."""
    player_id = _resolve_player_id(conn, name)
    if player_id is None:
        raise ValueError(f"no player named {name!r} with loaded stats")
    stats = _player_raw_stats(conn, player_id)
    if bounds is None:
        bounds = _player_metric_bounds(conn, min_maps)
    axes = []
    for key, label, decimals, is_pct in PLAYER_RADAR_METRICS:
        value = stats.get(key)
        lo, hi = bounds.get(key, (None, None))
        display = None
        if value is not None:
            display = round(value * 100, decimals) if is_pct else round(value, decimals)
        axes.append({
            "metric": key,
            "label": label,
            "value": display,
            "is_percentage": is_pct,
            "normalized": _normalize(value, lo, hi),
        })
    best_agent = agent_analysis.best_agents_for_players(conn, [player_id]).get(player_id, {}).get("agent")
    return {"name": name, "maps_played": stats["maps_played"], "best_agent": best_agent, "axes": axes}


def player_radar_comparison(conn: sqlite3.Connection, name: str, compare_name: str = None, min_maps: int = 10) -> dict:
    """player_radar() for one player, plus a second on the *same* bounds
    if `compare_name` is given — see team_radar_comparison for why shared
    bounds matter for a comparison to be valid."""
    bounds = _player_metric_bounds(conn, min_maps)
    a = player_radar(conn, name, min_maps, bounds=bounds)
    b = player_radar(conn, compare_name, min_maps, bounds=bounds) if compare_name else None
    return {"a": a, "b": b}
