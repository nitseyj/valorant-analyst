"""
backend/app/analyzers/player_impact.py

Core question: "Which individual performances actually decided this map —
who was the standout, and who was the liability?"

Pulls from two tables:
  - player_game_stats (side='both')  -> Rating, ACS, ADR, KAST, HS%
  - player_game_impact                -> multi-kills, clutches (1v1-1v5), Econ

Rating is VLR.gg's own composite metric (not something this analyzer
invents), so it's used as the primary ranking signal — ACS/ADR/KAST/clutches
are kept as supporting evidence, not re-blended into a new score. Per the
project's "don't hallucinate tactics" rule, this only ranks and reports
what the source data already computed.
"""

import sqlite3
from dataclasses import dataclass, field, asdict


@dataclass
class Evidence:
    metric: str
    team_a: float
    team_b: float


@dataclass
class AnalyzerResult:
    category: str
    impact: float
    winner: str | None
    summary: str
    evidence: list = field(default_factory=list)

    def to_dict(self):
        d = asdict(self)
        d["evidence"] = [asdict(e) if not isinstance(e, dict) else e for e in self.evidence]
        return d


def _team_names(conn, game_id):
    cur = conn.execute(
        """SELECT m.team_a_id, ta.name, m.team_b_id, tb.name, g.map_name
           FROM games g JOIN matches m ON g.match_id = m.match_id
           JOIN teams ta ON m.team_a_id = ta.team_id
           JOIN teams tb ON m.team_b_id = tb.team_id
           WHERE g.game_id = ?""",
        (game_id,),
    )
    return cur.fetchone()


def _player_rows(conn, game_id):
    """One row per player for this game (side='both'), joined with their
    clutch/multi-kill stats where available (LEFT JOIN — not every player
    necessarily has a player_game_impact row loaded)."""
    cur = conn.execute(
        """SELECT p.name, s.team_id, s.rating, s.acs, s.adr, s.kast_pct, s.hs_pct,
                  s.kills, s.deaths, s.first_kills, s.first_deaths,
                  COALESCE(i.clutch_1v1,0)+COALESCE(i.clutch_1v2,0)+COALESCE(i.clutch_1v3,0)
                    +COALESCE(i.clutch_1v4,0)+COALESCE(i.clutch_1v5,0) AS clutches,
                  COALESCE(i.three_k,0)+COALESCE(i.four_k,0)+COALESCE(i.five_k,0) AS big_multikills
           FROM player_game_stats s
           JOIN players p ON s.player_id = p.player_id
           LEFT JOIN player_game_impact i ON i.game_id = s.game_id AND i.player_id = s.player_id
           WHERE s.game_id = ? AND s.side = 'both'""",
        (game_id,),
    )
    return cur.fetchall()


def _aggregate_across_maps(players):
    """Collapse per-map rows into one row per player across the series —
    rate-like stats (rating, acs) are averaged across the maps they
    actually played, count-like stats (kills, deaths, clutches, multi-
    kills) are summed. Without this, picking the MVP/dud straight out of
    the pooled per-map rows just returns whoever's single BEST (or worst)
    map happened to be, mislabeled as "the series" — the opposite of the
    consistency-over-one-map-hot-streak this module is meant to reward."""
    by_player = {}
    for p in players:
        name, team_id = p[0], p[1]
        agg = by_player.setdefault((name, team_id), {
            "rating_sum": 0.0, "rating_n": 0, "acs_sum": 0.0, "acs_n": 0,
            "kills": 0, "deaths": 0, "clutches": 0, "big_multikills": 0,
        })
        if p[2] is not None:
            agg["rating_sum"] += p[2]
            agg["rating_n"] += 1
        if p[3] is not None:
            agg["acs_sum"] += p[3]
            agg["acs_n"] += 1
        agg["kills"] += p[7] or 0
        agg["deaths"] += p[8] or 0
        agg["clutches"] += p[11] or 0
        agg["big_multikills"] += p[12] or 0

    out = []
    for (name, team_id), agg in by_player.items():
        rating = agg["rating_sum"] / agg["rating_n"] if agg["rating_n"] else None
        acs = agg["acs_sum"] / agg["acs_n"] if agg["acs_n"] else None
        out.append((
            name, team_id, rating, acs, None, None, None,
            agg["kills"], agg["deaths"], None, None,
            agg["clutches"], agg["big_multikills"],
        ))
    return out


def _build_result(map_label, team_a_id, team_a_name, team_b_id, team_b_name, players):
    if not players:
        raise ValueError(f"no player_game_stats rows found for {map_label}")

    team_a_players = [p for p in players if p[1] == team_a_id]
    team_b_players = [p for p in players if p[1] == team_b_id]
    if not team_a_players or not team_b_players:
        raise ValueError(f"{map_label}: missing player rows for one team, cannot compare")

    def avg_rating(rows):
        vals = [r[2] for r in rows if r[2] is not None]
        return sum(vals) / len(vals) if vals else None

    a_avg = avg_rating(team_a_players)
    b_avg = avg_rating(team_b_players)

    all_sorted = sorted([p for p in players if p[2] is not None], key=lambda r: r[2], reverse=True)
    mvp = all_sorted[0] if all_sorted else None
    dud = all_sorted[-1] if all_sorted else None

    a_clutches = sum(p[11] for p in team_a_players)
    b_clutches = sum(p[11] for p in team_b_players)
    a_multikills = sum(p[12] for p in team_a_players)
    b_multikills = sum(p[12] for p in team_b_players)

    if a_avg is None or b_avg is None:
        diff = 0.0
    else:
        diff = a_avg - b_avg
    impact = round(min(abs(diff) / 0.5, 1.0), 2)

    winner = None
    if a_avg is not None and b_avg is not None and abs(diff) >= 0.03:
        winner = team_a_name if diff > 0 else team_b_name

    mvp_team_name = team_a_name if (mvp and mvp[1] == team_a_id) else team_b_name
    summary_parts = []
    if mvp:
        summary_parts.append(
            f"{mvp[0]} ({mvp_team_name}) was the top performer on {map_label} with a {mvp[2]:.2f} rating "
            f"({mvp[3]:.0f} ACS, {mvp[7]}/{mvp[8]} K/D)."
        )
    if winner:
        summary_parts.append(f"{winner} had the stronger roster average ({(a_avg if winner==team_a_name else b_avg):.2f} vs "
                              f"{(b_avg if winner==team_a_name else a_avg):.2f}).")
    else:
        summary_parts.append("Team-average ratings were close overall.")
    summary = " ".join(summary_parts)

    evidence = [
        Evidence("Avg Player Rating", round(a_avg, 3) if a_avg is not None else None,
                  round(b_avg, 3) if b_avg is not None else None),
        Evidence("Clutches Won", a_clutches, b_clutches),
        Evidence("3K+ Multi-kill Rounds", a_multikills, b_multikills),
    ]
    if dud and dud[2] is not None and (mvp is None or dud[0] != mvp[0]):
        dud_team_name = team_a_name if dud[1] == team_a_id else team_b_name
        evidence.append(Evidence(f"Lowest Rating ({dud[0]}, {dud_team_name})", dud[2], None))

    return AnalyzerResult(
        category="Player Impact",
        impact=impact,
        winner=winner,
        summary=summary,
        evidence=evidence,
    ).to_dict()


def analyze_game(conn: sqlite3.Connection, game_id: int) -> dict:
    row = _team_names(conn, game_id)
    if row is None:
        raise ValueError(f"game_id {game_id} not found")
    team_a_id, team_a_name, team_b_id, team_b_name, map_name = row
    players = _player_rows(conn, game_id)
    return _build_result(map_name, team_a_id, team_a_name, team_b_id, team_b_name, players)


def analyze_match(conn: sqlite3.Connection, match_id: int) -> dict:
    cur = conn.execute(
        """SELECT m.team_a_id, ta.name, m.team_b_id, tb.name FROM matches m
           JOIN teams ta ON m.team_a_id = ta.team_id
           JOIN teams tb ON m.team_b_id = tb.team_id
           WHERE m.match_id = ?""",
        (match_id,),
    )
    row = cur.fetchone()
    if row is None:
        raise ValueError(f"match_id {match_id} not found")
    team_a_id, team_a_name, team_b_id, team_b_name = row

    cur = conn.execute("SELECT game_id FROM games WHERE match_id = ?", (match_id,))
    game_ids = [r[0] for r in cur.fetchall()]
    if not game_ids:
        raise ValueError(f"match_id {match_id} has no games loaded")

    # pool every player-game row across the whole series, then collapse to
    # one row per player (see _aggregate_across_maps) before reusing the
    # same ranking/averaging logic as a single "virtual map" — this is what
    # actually rewards consistency across maps, not just a one-map hot streak
    all_players = []
    for gid in game_ids:
        all_players.extend(_player_rows(conn, gid))
    series_players = _aggregate_across_maps(all_players)

    return _build_result(f"the series", team_a_id, team_a_name, team_b_id, team_b_name, series_players)


if __name__ == "__main__":
    import sys
    import json

    db_path = sys.argv[1] if len(sys.argv) > 1 else "valorant.db"
    match_id = int(sys.argv[2]) if len(sys.argv) > 2 else None

    conn = sqlite3.connect(db_path)
    if match_id is None:
        cur = conn.execute(
            "SELECT match_id FROM matches WHERE match_name = 'Paper Rex vs Xi Lai Gaming' LIMIT 1"
        )
        row = cur.fetchone()
        if row is None:
            print("No default test match found — pass a match_id explicitly.")
            sys.exit(1)
        match_id = row[0]

    print(f"--- analyze_match({match_id}) ---")
    print(json.dumps(analyze_match(conn, match_id), indent=2))

    cur = conn.execute("SELECT game_id, map_name FROM games WHERE match_id = ?", (match_id,))
    for gid, map_name in cur.fetchall():
        print(f"\n--- analyze_game({gid}) [{map_name}] ---")
        try:
            print(json.dumps(analyze_game(conn, gid), indent=2))
        except ValueError as e:
            print(f"  skipped: {e}")
