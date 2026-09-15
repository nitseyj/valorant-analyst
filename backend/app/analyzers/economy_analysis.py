"""
backend/app/analyzers/economy_analysis.py

Core question: "Did economic decisions swing the match — did a team steal
rounds on a weak buy, or throw away rounds despite a full-buy advantage?"

Uses round_team_economy, which classifies every round into one of four
buy-type buckets (confirmed against real loaded data, not assumed):
  - "Eco: 0-5k"
  - "Semi-eco: 5-10k"
  - "Semi-buy: 10-20k"
  - "Full buy: 20k+"

Two numbers matter most in real VALORANT analysis and are what this
module leads with:
  - Full-buy win rate: are you converting rounds you SHOULD win?
  - Eco win rate: are you stealing rounds you're NOT expected to win?
A team can lose the loadout-value battle overall and still win the map by
stealing eco rounds — that's exactly the kind of thing this is meant to
surface, not hide inside an aggregate.
"""

import sqlite3
from dataclasses import dataclass, field, asdict

BUY_TYPES = ["Eco: 0-5k", "Semi-eco: 5-10k", "Semi-buy: 10-20k", "Full buy: 20k+"]


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


def _buy_type_breakdown(conn, game_ids, team_id):
    """Returns {buy_type: (rounds_played, rounds_won)} for a team across
    one or more games."""
    if not game_ids:
        return {}
    placeholders = ",".join("?" * len(game_ids))
    cur = conn.execute(
        f"""SELECT buy_type, COUNT(*), SUM(CASE WHEN outcome = 'Win' THEN 1 ELSE 0 END)
            FROM round_team_economy
            WHERE game_id IN ({placeholders}) AND team_id = ? AND buy_type IS NOT NULL
            GROUP BY buy_type""",
        (*game_ids, team_id),
    )
    return {bt: (played, won) for bt, played, won in cur.fetchall()}


def _rate(breakdown, buy_type):
    played, won = breakdown.get(buy_type, (0, 0))
    return (won / played if played else None), played, won


def _build_result(map_label, team_a_id, team_a_name, team_b_id, team_b_name, a_breakdown, b_breakdown):
    if not a_breakdown and not b_breakdown:
        raise ValueError(f"{map_label}: no economy data loaded for this game")

    a_full_rate, a_full_played, a_full_won = _rate(a_breakdown, "Full buy: 20k+")
    b_full_rate, b_full_played, b_full_won = _rate(b_breakdown, "Full buy: 20k+")
    a_eco_rate, a_eco_played, a_eco_won = _rate(a_breakdown, "Eco: 0-5k")
    b_eco_rate, b_eco_played, b_eco_won = _rate(b_breakdown, "Eco: 0-5k")

    full_diff = (a_full_rate - b_full_rate) if (a_full_rate is not None and b_full_rate is not None) else 0.0
    eco_diff = (a_eco_rate - b_eco_rate) if (a_eco_rate is not None and b_eco_rate is not None) else 0.0
    # full-buy conversion matters more (bigger sample, more decisive), eco steals are the upset signal
    combined = full_diff * 0.7 + eco_diff * 0.3
    impact = round(min(abs(combined) * 1.5, 1.0), 2)

    winner = None if abs(combined) < 0.05 else (team_a_name if combined > 0 else team_b_name)

    parts = []
    if a_full_rate is not None and b_full_rate is not None:
        if abs(full_diff) >= 0.1:
            leader = team_a_name if full_diff > 0 else team_b_name
            rate = a_full_rate if full_diff > 0 else b_full_rate
            parts.append(f"{leader} converted full-buy rounds better ({rate:.0%})")
        else:
            parts.append("full-buy conversion was similar for both teams")
    if a_eco_rate is not None and b_eco_rate is not None and (a_eco_played + b_eco_played) > 0:
        if abs(eco_diff) >= 0.1:
            leader = team_a_name if eco_diff > 0 else team_b_name
            rate = a_eco_rate if eco_diff > 0 else b_eco_rate
            parts.append(f"{leader} stole more eco rounds ({rate:.0%} win rate on weak buys)")
    summary = f"On {map_label}: " + "; ".join(parts) + "." if parts else f"On {map_label}: economy data was too sparse to draw a conclusion."

    evidence = [
        Evidence("Full Buy Win Rate", round(a_full_rate, 3) if a_full_rate is not None else None,
                  round(b_full_rate, 3) if b_full_rate is not None else None),
        Evidence("Eco Round Win Rate", round(a_eco_rate, 3) if a_eco_rate is not None else None,
                  round(b_eco_rate, 3) if b_eco_rate is not None else None),
        Evidence("Full Buy Rounds Played", a_full_played, b_full_played),
        Evidence("Eco Rounds Played", a_eco_played, b_eco_played),
    ]

    return AnalyzerResult(
        category="Economy",
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
    a_breakdown = _buy_type_breakdown(conn, [game_id], team_a_id)
    b_breakdown = _buy_type_breakdown(conn, [game_id], team_b_id)
    return _build_result(map_name, team_a_id, team_a_name, team_b_id, team_b_name, a_breakdown, b_breakdown)


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

    a_breakdown = _buy_type_breakdown(conn, game_ids, team_a_id)
    b_breakdown = _buy_type_breakdown(conn, game_ids, team_b_id)
    return _build_result("the series", team_a_id, team_a_name, team_b_id, team_b_name, a_breakdown, b_breakdown)


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
