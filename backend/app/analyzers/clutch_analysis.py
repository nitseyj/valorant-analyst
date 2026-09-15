"""
backend/app/analyzers/clutch_analysis.py

Core question: "Who won the clutch moments — the 1vX situations — and
how much did it matter?" This was one of the analyzer modules from the
original project plan's file list (section 17) that hadn't been broken
out into its own ranked factor yet — clutches were previously only
visible as supporting evidence inside player_impact.py, not as their
own weighted category.

Data: player_game_impact.clutch_1v1 .. clutch_1v5 (already loaded by
the ETL, confirmed against real data before building this — e.g.
Sentinels vs 100 Thieves has 5 real clutches across the series).

Weighting: a 1v5 clutch is not the same achievement as a 1v1, so each
clutch is weighted by its difficulty (1v1=1 point ... 1v5=5 points)
before comparing teams — a straight clutch COUNT would treat a team's
five 1v1s as equal to one player's 1v5, which isn't a fair comparison.
"""

import sqlite3
from dataclasses import dataclass, field, asdict

CLUTCH_WEIGHTS = {"1v1": 1, "1v2": 2, "1v3": 3, "1v4": 4, "1v5": 5}


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


def _clutch_breakdown(conn, game_ids, team_id):
    """Returns (counts_by_size: dict, weighted_total: int, top_player: (name, weighted) | None)."""
    if not game_ids:
        return {}, 0, None
    placeholders = ",".join("?" * len(game_ids))
    rows = conn.execute(
        f"""SELECT p.name, SUM(i.clutch_1v1), SUM(i.clutch_1v2), SUM(i.clutch_1v3), SUM(i.clutch_1v4), SUM(i.clutch_1v5)
            FROM player_game_impact i JOIN players p ON i.player_id = p.player_id
            WHERE i.game_id IN ({placeholders}) AND i.team_id = ?
            GROUP BY i.player_id""",
        (*game_ids, team_id),
    ).fetchall()

    counts = {"1v1": 0, "1v2": 0, "1v3": 0, "1v4": 0, "1v5": 0}
    top_player = None
    top_weighted = 0
    for name, c1, c2, c3, c4, c5 in rows:
        counts["1v1"] += c1 or 0
        counts["1v2"] += c2 or 0
        counts["1v3"] += c3 or 0
        counts["1v4"] += c4 or 0
        counts["1v5"] += c5 or 0
        player_weighted = sum((c or 0) * CLUTCH_WEIGHTS[size] for c, size in
                               zip([c1, c2, c3, c4, c5], ["1v1", "1v2", "1v3", "1v4", "1v5"]))
        if player_weighted > top_weighted:
            top_weighted = player_weighted
            top_player = name

    weighted_total = sum(counts[size] * CLUTCH_WEIGHTS[size] for size in counts)
    return counts, weighted_total, (top_player, top_weighted) if top_player else None


def _build_result(map_label, team_a_id, team_a_name, team_b_id, team_b_name, game_ids, conn):
    a_counts, a_weighted, a_top = _clutch_breakdown(conn, game_ids, team_a_id)
    b_counts, b_weighted, b_top = _clutch_breakdown(conn, game_ids, team_b_id)

    a_total = sum(a_counts.values())
    b_total = sum(b_counts.values())

    if a_total == 0 and b_total == 0:
        raise ValueError(f"{map_label}: no clutch data recorded for either team")

    diff = a_weighted - b_weighted
    # scale: a weighted differential of 6+ (e.g. one team gets a 1v5 the other doesn't match at all) maxes impact
    impact = round(min(abs(diff) / 6, 1.0), 2)

    winner = None
    if abs(diff) >= 1:
        winner = team_a_name if diff > 0 else team_b_name

    parts = [f"{team_a_name} won {a_total} clutch{'es' if a_total!=1 else ''} to {team_b_name}'s {b_total}"
             f" on {map_label}" if a_total != b_total else
             f"Both teams won {a_total} clutches on {map_label}"]
    top = a_top if (a_top and (not b_top or a_top[1] >= b_top[1])) else b_top
    if top and top[0]:
        top_team = team_a_name if top == a_top else team_b_name
        size_label = None
        # figure out their biggest single clutch for a natural sentence
        biggest = None
        for size in ["1v5", "1v4", "1v3", "1v2", "1v1"]:
            src_counts = a_counts if top_team == team_a_name else b_counts
            if src_counts[size] > 0:
                biggest = size
                break
        if biggest:
            parts.append(f"{top[0]} ({top_team}) had the standout clutch, including a {biggest}")
    summary = ". ".join(parts) + "."

    evidence = [
        Evidence("Total Clutches", a_total, b_total),
        Evidence("Weighted Clutch Score", a_weighted, b_weighted),
        Evidence("1v3+ Clutches", a_counts["1v3"] + a_counts["1v4"] + a_counts["1v5"],
                  b_counts["1v3"] + b_counts["1v4"] + b_counts["1v5"]),
    ]

    return AnalyzerResult(
        category="Clutch Factor",
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
    return _build_result(map_name, team_a_id, team_a_name, team_b_id, team_b_name, [game_id], conn)


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

    return _build_result("the series", team_a_id, team_a_name, team_b_id, team_b_name, game_ids, conn)


if __name__ == "__main__":
    import sys
    import json

    db_path = sys.argv[1] if len(sys.argv) > 1 else "valorant.db"
    match_id = int(sys.argv[2]) if len(sys.argv) > 2 else 459522
    conn = sqlite3.connect(db_path)
    print(json.dumps(analyze_match(conn, match_id), indent=2))
