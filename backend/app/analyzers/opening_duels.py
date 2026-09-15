"""
backend/app/analyzers/opening_duels.py

Core question this answers: "Who won the opening-duel battle, and by how
much did it matter?"

Follows the structured-output convention from the project plan (section 17):
raw data -> statistical calculation -> evidence -> a plain-language summary
that match_verdict.py can later rank against other factors. No LLM, no
hallucinated tactics — every number here traces directly to
player_game_stats.first_kills / first_deaths, which the dataset already
computes (not derived from round-by-round event logs, since overview.csv
already gives this per player, per map, per side).

Works at two levels:
  - analyze_game(conn, game_id)   -> single map
  - analyze_match(conn, match_id) -> whole series, aggregated across maps

Both return the same shape, so match_verdict.py (later) doesn't need to
care which level it's looking at.
"""

import sqlite3
from dataclasses import dataclass, field, asdict


def _possessive(name: str) -> str:
    """English possessive: add 's, unless the name already ends in s -> just '."""
    return f"{name}'" if name.endswith("s") else f"{name}'s"


@dataclass
class Evidence:
    metric: str
    team_a: float
    team_b: float


@dataclass
class AnalyzerResult:
    category: str
    impact: float          # 0.0-1.0, how much this factor mattered
    winner: str | None      # team name, or None if essentially even
    summary: str
    evidence: list = field(default_factory=list)

    def to_dict(self):
        d = asdict(self)
        d["evidence"] = [asdict(e) if not isinstance(e, dict) else e for e in self.evidence]
        return d


def _team_side_totals(conn, game_id, team_id, side):
    """Sum first_kills/first_deaths across all players on `team_id` for one
    game, for a given side ('both', 'attack', 'defend'). Uses side='both'
    for the whole-map view — see schema note 3 on why side is a dimension,
    not something to sum across."""
    cur = conn.execute(
        """SELECT COALESCE(SUM(first_kills),0), COALESCE(SUM(first_deaths),0)
           FROM player_game_stats
           WHERE game_id = ? AND team_id = ? AND side = ?""",
        (game_id, team_id, side),
    )
    return cur.fetchone()


def _round_count(conn, game_id):
    cur = conn.execute("SELECT COUNT(DISTINCT round_number) FROM rounds WHERE game_id = ?", (game_id,))
    return cur.fetchone()[0]


def _game_teams(conn, game_id):
    cur = conn.execute(
        """SELECT m.team_a_id, ta.name, m.team_b_id, tb.name, g.map_name
           FROM games g JOIN matches m ON g.match_id = m.match_id
           JOIN teams ta ON m.team_a_id = ta.team_id
           JOIN teams tb ON m.team_b_id = tb.team_id
           WHERE g.game_id = ?""",
        (game_id,),
    )
    return cur.fetchone()


def analyze_game(conn: sqlite3.Connection, game_id: int) -> dict:
    row = _game_teams(conn, game_id)
    if row is None:
        raise ValueError(f"game_id {game_id} not found")
    team_a_id, team_a_name, team_b_id, team_b_name, map_name = row

    total_rounds = _round_count(conn, game_id)
    if total_rounds == 0:
        # rounds table wasn't populated for this game (e.g. skipped during
        # load — see DATA_QUALITY_FINDINGS.md) — don't fabricate a result
        raise ValueError(f"game_id {game_id} has no round data loaded; cannot compute opening-duel rates")

    a_fk, a_fd = _team_side_totals(conn, game_id, team_a_id, "both")
    b_fk, b_fd = _team_side_totals(conn, game_id, team_b_id, "both")

    a_fk_rate = a_fk / total_rounds
    b_fk_rate = b_fk / total_rounds
    a_fd_rate = a_fd / total_rounds
    b_fd_rate = b_fd / total_rounds

    # side-split breakdown — does the advantage come from attack, defense, or both?
    a_atk_fk, a_atk_fd = _team_side_totals(conn, game_id, team_a_id, "attack")
    b_atk_fk, b_atk_fd = _team_side_totals(conn, game_id, team_b_id, "attack")
    a_def_fk, a_def_fd = _team_side_totals(conn, game_id, team_a_id, "defend")
    b_def_fk, b_def_fd = _team_side_totals(conn, game_id, team_b_id, "defend")

    diff = a_fk_rate - b_fk_rate  # positive => team A won the opening-duel battle
    impact = min(abs(diff) * 2, 1.0)  # scale: a 50-point-rate gap maxes out impact at 1.0

    if abs(diff) < 0.03:
        winner = None
        summary = (
            f"Opening duels were roughly even on {map_name}: {team_a_name} secured the first kill "
            f"in {a_fk_rate:.0%} of rounds, {team_b_name} in {b_fk_rate:.0%}."
        )
    else:
        winner = team_a_name if diff > 0 else team_b_name
        loser = team_b_name if diff > 0 else team_a_name
        winner_rate = a_fk_rate if diff > 0 else b_fk_rate
        loser_rate = b_fk_rate if diff > 0 else a_fk_rate
        summary = (
            f"{winner} won the opening-duel battle on {map_name}, taking the first kill in "
            f"{winner_rate:.0%} of rounds compared to {_possessive(loser)} {loser_rate:.0%}."
        )

    evidence = [
        Evidence("First Kill Rate", round(a_fk_rate, 3), round(b_fk_rate, 3)),
        Evidence("First Death Rate", round(a_fd_rate, 3), round(b_fd_rate, 3)),
        Evidence("Attack-side First Kills", a_atk_fk, b_atk_fk),
        Evidence("Defend-side First Kills", a_def_fk, b_def_fk),
    ]

    return AnalyzerResult(
        category="Opening Duels",
        impact=round(impact, 2),
        winner=winner,
        summary=summary,
        evidence=evidence,
    ).to_dict()


def analyze_match(conn: sqlite3.Connection, match_id: int) -> dict:
    """Aggregates opening-duel stats across every map in the series, then
    reuses the same scoring logic as analyze_game."""
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

    cur = conn.execute("SELECT game_id FROM games WHERE match_id = ?", (match_id,))
    game_ids = [r[0] for r in cur.fetchall()]
    if not game_ids:
        raise ValueError(f"match_id {match_id} has no games loaded")

    per_game = []
    for gid in game_ids:
        try:
            per_game.append(analyze_game(conn, gid))
        except ValueError:
            continue  # game with no round data loaded — skip, don't fabricate

    if not per_game:
        raise ValueError(f"match_id {match_id}: no games had usable round data")

    # simple average of per-game impact/rates, weighted equally per map
    avg_a_fk_rate = sum(g["evidence"][0]["team_a"] for g in per_game) / len(per_game)
    avg_b_fk_rate = sum(g["evidence"][0]["team_b"] for g in per_game) / len(per_game)
    diff = avg_a_fk_rate - avg_b_fk_rate
    impact = min(abs(diff) * 2, 1.0)

    if abs(diff) < 0.03:
        winner = None
        summary = (
            f"Across the series, opening duels were roughly even: {team_a_name} averaged "
            f"{avg_a_fk_rate:.0%} first-kill rate, {team_b_name} averaged {avg_b_fk_rate:.0%}."
        )
    else:
        winner = team_a_name if diff > 0 else team_b_name
        loser = team_b_name if diff > 0 else team_a_name
        winner_rate = avg_a_fk_rate if diff > 0 else avg_b_fk_rate
        loser_rate = avg_b_fk_rate if diff > 0 else avg_a_fk_rate
        summary = (
            f"{winner} won the opening-duel battle across the series, averaging a "
            f"{winner_rate:.0%} first-kill rate to {_possessive(loser)} {loser_rate:.0%} "
            f"(across {len(per_game)} map{'s' if len(per_game) != 1 else ''})."
        )

    return AnalyzerResult(
        category="Opening Duels",
        impact=round(impact, 2),
        winner=winner,
        summary=summary,
        evidence=[
            Evidence("Avg First Kill Rate", round(avg_a_fk_rate, 3), round(avg_b_fk_rate, 3)),
        ],
    ).to_dict()


if __name__ == "__main__":
    # quick manual smoke test — run with: python opening_duels.py path/to/valorant.db <match_id>
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

    cur = conn.execute("SELECT game_id FROM games WHERE match_id = ?", (match_id,))
    for (gid,) in cur.fetchall():
        print(f"\n--- analyze_game({gid}) ---")
        try:
            print(json.dumps(analyze_game(conn, gid), indent=2))
        except ValueError as e:
            print(f"  skipped: {e}")
