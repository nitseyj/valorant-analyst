"""
backend/app/analyzers/side_performance.py

Core question: "Was this team's win (or loss) driven by their attack,
their defense, or both?"

Data note worth keeping: the source (`maps_scores.csv` -> `games` table)
gives round WINS by side (team_a_attack_score, team_a_defend_score, etc.)
but not the total round count per side directly. That total is still
exactly derivable without any extra query: the rounds where Team A
attacks are the identical rounds where Team B defends (they're playing
each other), and every round has exactly one winner, so:

    team_a_attack_rounds = team_a_attack_score + team_b_defend_score
    team_b_attack_rounds = team_b_attack_score + team_a_defend_score

This was verified against a real loaded game (Paper Rex vs Xi Lai Gaming,
Bind): 6+6=12 attack rounds for Paper Rex, 3+7=10 for Xi Lai Gaming,
12+10=22 total, matching the map's actual round count (13+9). No new
columns or tables needed — same principle as opening_duels.py: derive
from what the source already gives, never fabricate.
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


def _game_row(conn, game_id):
    cur = conn.execute(
        """SELECT g.map_name, m.team_a_id, ta.name, m.team_b_id, tb.name,
                  g.team_a_score, g.team_a_attack_score, g.team_a_defend_score,
                  g.team_b_score, g.team_b_attack_score, g.team_b_defend_score
           FROM games g
           JOIN matches m ON g.match_id = m.match_id
           JOIN teams ta ON m.team_a_id = ta.team_id
           JOIN teams tb ON m.team_b_id = tb.team_id
           WHERE g.game_id = ?""",
        (game_id,),
    )
    return cur.fetchone()


def _side_rates(a_atk_won, a_def_won, b_atk_won, b_def_won):
    """Given round-wins-by-side for both teams, return (a_atk_rate, a_def_rate,
    b_atk_rate, b_def_rate) plus the derived total rounds per side. Returns
    None for a rate if that side's round count is 0 (e.g. no overtime played)."""
    a_atk_total = a_atk_won + b_def_won   # rounds where A attacked = rounds where B defended
    b_atk_total = b_atk_won + a_def_won   # rounds where B attacked = rounds where A defended

    a_atk_rate = a_atk_won / a_atk_total if a_atk_total else None
    b_def_rate = b_def_won / a_atk_total if a_atk_total else None
    b_atk_rate = b_atk_won / b_atk_total if b_atk_total else None
    a_def_rate = a_def_won / b_atk_total if b_atk_total else None

    return a_atk_rate, a_def_rate, b_atk_rate, b_def_rate, a_atk_total, b_atk_total


def analyze_game(conn: sqlite3.Connection, game_id: int) -> dict:
    row = _game_row(conn, game_id)
    if row is None:
        raise ValueError(f"game_id {game_id} not found")
    (map_name, team_a_id, team_a_name, team_b_id, team_b_name,
     a_score, a_atk_won, a_def_won, b_score, b_atk_won, b_def_won) = row

    if a_atk_won is None or a_def_won is None or b_atk_won is None or b_def_won is None:
        raise ValueError(f"game_id {game_id} is missing attack/defense score breakdown; cannot compute side performance")

    a_atk_rate, a_def_rate, b_atk_rate, b_def_rate, a_atk_total, b_atk_total = _side_rates(
        a_atk_won, a_def_won, b_atk_won, b_def_won
    )

    # "attack advantage" = how much better team A's attack was than team B's attack
    # (comparing like-for-like: both teams' performance in the attacker role)
    if a_atk_rate is None or b_atk_rate is None:
        atk_diff = 0.0
    else:
        atk_diff = a_atk_rate - b_atk_rate
    if a_def_rate is None or b_def_rate is None:
        def_diff = 0.0
    else:
        def_diff = a_def_rate - b_def_rate

    impact = round(min((abs(atk_diff) + abs(def_diff)) / 2 * 1.5, 1.0), 2)

    parts = []
    if a_atk_rate is not None and b_atk_rate is not None:
        if abs(atk_diff) >= 0.05:
            leader = team_a_name if atk_diff > 0 else team_b_name
            parts.append(f"{leader} had the stronger attack ({(a_atk_rate if atk_diff>0 else b_atk_rate):.0%} round win rate)")
        else:
            parts.append("attack sides were evenly matched")
    if a_def_rate is not None and b_def_rate is not None:
        if abs(def_diff) >= 0.05:
            leader = team_a_name if def_diff > 0 else team_b_name
            parts.append(f"{leader} had the stronger defense ({(a_def_rate if def_diff>0 else b_def_rate):.0%} round win rate)")
        else:
            parts.append("defense sides were evenly matched")
    summary = f"On {map_name}: " + "; ".join(parts) + "."

    # overall side-performance "winner" = whichever team's combined side edge is larger
    combined = atk_diff + def_diff
    if abs(combined) < 0.05:
        winner = None
    else:
        winner = team_a_name if combined > 0 else team_b_name

    evidence = [
        Evidence("Attack Round Win Rate", round(a_atk_rate, 3) if a_atk_rate is not None else None,
                  round(b_atk_rate, 3) if b_atk_rate is not None else None),
        Evidence("Defend Round Win Rate", round(a_def_rate, 3) if a_def_rate is not None else None,
                  round(b_def_rate, 3) if b_def_rate is not None else None),
        Evidence("Attack Rounds Played", a_atk_total, b_atk_total),
        Evidence("Map Score", a_score, b_score),
    ]

    return AnalyzerResult(
        category="Side Performance",
        impact=impact,
        winner=winner,
        summary=summary,
        evidence=evidence,
    ).to_dict()


def analyze_match(conn: sqlite3.Connection, match_id: int) -> dict:
    """Sums round-side totals across every map in the series before computing
    rates (not an average of per-map rates) — this weights maps with more
    rounds correctly instead of treating a 13-11 map the same as a 13-2 one."""
    cur = conn.execute(
        """SELECT ta.name, tb.name FROM matches m
           JOIN teams ta ON m.team_a_id = ta.team_id
           JOIN teams tb ON m.team_b_id = tb.team_id
           WHERE m.match_id = ?""",
        (match_id,),
    )
    row = cur.fetchone()
    if row is None:
        raise ValueError(f"match_id {match_id} not found")
    team_a_name, team_b_name = row

    cur = conn.execute(
        """SELECT team_a_attack_score, team_a_defend_score, team_b_attack_score, team_b_defend_score,
                  team_a_score, team_b_score
           FROM games WHERE match_id = ?""",
        (match_id,),
    )
    games = cur.fetchall()
    if not games:
        raise ValueError(f"match_id {match_id} has no games loaded")

    a_atk_won = a_def_won = b_atk_won = b_def_won = 0
    a_score_total = b_score_total = 0
    usable_games = 0
    for g in games:
        if any(v is None for v in g[:4]):
            continue  # game missing side breakdown — skip, don't fabricate
        a_atk_won += g[0]
        a_def_won += g[1]
        b_atk_won += g[2]
        b_def_won += g[3]
        a_score_total += g[4]
        b_score_total += g[5]
        usable_games += 1

    if usable_games == 0:
        raise ValueError(f"match_id {match_id}: no games had usable side-score data")

    a_atk_rate, a_def_rate, b_atk_rate, b_def_rate, a_atk_total, b_atk_total = _side_rates(
        a_atk_won, a_def_won, b_atk_won, b_def_won
    )

    atk_diff = (a_atk_rate - b_atk_rate) if (a_atk_rate is not None and b_atk_rate is not None) else 0.0
    def_diff = (a_def_rate - b_def_rate) if (a_def_rate is not None and b_def_rate is not None) else 0.0
    impact = round(min((abs(atk_diff) + abs(def_diff)) / 2 * 1.5, 1.0), 2)

    parts = []
    if a_atk_rate is not None and b_atk_rate is not None:
        if abs(atk_diff) >= 0.05:
            leader = team_a_name if atk_diff > 0 else team_b_name
            parts.append(f"{leader} had the stronger attack across the series ({(a_atk_rate if atk_diff>0 else b_atk_rate):.0%})")
        else:
            parts.append("Attack sides were evenly matched across the series")
    if a_def_rate is not None and b_def_rate is not None:
        if abs(def_diff) >= 0.05:
            leader = team_a_name if def_diff > 0 else team_b_name
            parts.append(f"{leader} had the stronger defense across the series ({(a_def_rate if def_diff>0 else b_def_rate):.0%})")
        else:
            parts.append("Defense sides were evenly matched across the series")
    summary = (". ".join(parts) + ".") if parts else "Insufficient data to compare sides."

    combined = atk_diff + def_diff
    winner = None if abs(combined) < 0.05 else (team_a_name if combined > 0 else team_b_name)

    return AnalyzerResult(
        category="Side Performance",
        impact=impact,
        winner=winner,
        summary=summary,
        evidence=[
            Evidence("Attack Round Win Rate", round(a_atk_rate, 3) if a_atk_rate is not None else None,
                      round(b_atk_rate, 3) if b_atk_rate is not None else None),
            Evidence("Defend Round Win Rate", round(a_def_rate, 3) if a_def_rate is not None else None,
                      round(b_def_rate, 3) if b_def_rate is not None else None),
            Evidence("Total Map Score", a_score_total, b_score_total),
        ],
    ).to_dict()


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
