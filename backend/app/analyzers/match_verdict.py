"""
backend/app/analyzers/match_verdict.py

Core question: "Why did Team A win?" — the top-level module the frontend
actually calls. Runs every available analyzer against a match, ranks their
`impact` scores, and returns a structured verdict:

    {
      "match_id": ...,
      "team_a": "...", "team_b": "...",
      "winner": "...", "score": "13-9, 13-5",
      "primary_factor": { ...top analyzer's result... },
      "ranked_factors": [ ...every analyzer's result, sorted by impact... ]
    }

Deliberately thin: this module does NOT compute any new statistics itself.
It only calls each analyzer's analyze_match(), reads the `impact` field
each one already produced, and sorts/labels. Per the project's "avoid AI
as the core" rule extended to this module too — ranking by a number the
analyzers already computed is not the same as inventing a new judgment.

Adding a new analyzer later (economy_analysis.py, clutch_analysis.py, ...)
means adding one entry to ANALYZERS below — nothing else in this file
should need to change.
"""

import sqlite3
from dataclasses import dataclass, asdict

try:
    # when imported as part of the app.analyzers package (e.g. by FastAPI)
    from . import opening_duels, side_performance, player_impact, economy_analysis, agent_analysis, clutch_analysis
except ImportError:
    # when run directly as a script (python match_verdict.py ...), for the
    # standalone smoke test at the bottom of this file
    import opening_duels, side_performance, player_impact, economy_analysis, agent_analysis, clutch_analysis


# Each entry: (module, label used if the analyzer raises and gets skipped)
ANALYZERS = [
    opening_duels,
    side_performance,
    player_impact,
    economy_analysis,
    agent_analysis,
    clutch_analysis,
]

IMPACT_HIGH = 0.6
IMPACT_MODERATE = 0.3


def _impact_label(impact: float) -> str:
    if impact >= IMPACT_HIGH:
        return "HIGH IMPACT"
    if impact >= IMPACT_MODERATE:
        return "MODERATE"
    return "LOW"


@dataclass
class RankedFactor:
    rank: int
    category: str
    impact: float
    impact_label: str
    winner: str | None
    summary: str
    evidence: list


def _match_header(conn, match_id):
    cur = conn.execute(
        """SELECT m.match_id, m.match_name, m.team_a_id, ta.name, m.team_b_id, tb.name,
                  m.team_a_score, m.team_b_score, tw.name
           FROM matches m
           JOIN teams ta ON m.team_a_id = ta.team_id
           JOIN teams tb ON m.team_b_id = tb.team_id
           LEFT JOIN teams tw ON m.winner_team_id = tw.team_id
           WHERE m.match_id = ?""",
        (match_id,),
    )
    return cur.fetchone()


def _map_scores(conn, match_id):
    cur = conn.execute("SELECT team_a_score, team_b_score FROM games WHERE match_id = ?", (match_id,))
    return [f"{a}-{b}" for a, b in cur.fetchall()]


def _roster(conn, match_id, team_id):
    """The 5 players who actually played this series for one team, ranked
    by maps played (then rating) — so a one-map substitute doesn't bump a
    starter off the list. Stats are averaged/summed across whatever maps
    they did play in THIS match, side='both' rows only (see schema note
    on the side dimension). Full stat line, not just rating — a rating-
    only roster doesn't answer "what did this player actually do"."""
    cur = conn.execute(
        """SELECT p.name, COUNT(*) AS maps_played, AVG(s.rating) AS avg_rating,
                  AVG(s.acs) AS avg_acs, AVG(s.adr) AS avg_adr, AVG(s.kast_pct) AS avg_kast,
                  SUM(s.kills) AS total_kills, SUM(s.deaths) AS total_deaths, SUM(s.assists) AS total_assists,
                  SUM(s.first_kills) AS total_fk, SUM(s.first_deaths) AS total_fd
           FROM player_game_stats s
           JOIN players p ON s.player_id = p.player_id
           JOIN games g ON s.game_id = g.game_id
           WHERE g.match_id = ? AND s.team_id = ? AND s.side = 'both' AND s.rating IS NOT NULL
           GROUP BY p.player_id
           ORDER BY maps_played DESC, avg_rating DESC
           LIMIT 5""",
        (match_id, team_id),
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


def build_verdict(conn: sqlite3.Connection, match_id: int) -> dict:
    header = _match_header(conn, match_id)
    if header is None:
        raise ValueError(f"match_id {match_id} not found")
    _, match_name, team_a_id, team_a_name, team_b_id, team_b_name, team_a_score, team_b_score, winner_name = header

    results = []
    skipped_analyzers = []
    for module in ANALYZERS:
        try:
            results.append(module.analyze_match(conn, match_id))
        except ValueError as e:
            # an analyzer couldn't compute for this match (e.g. no usable
            # round data) — record that it was skipped, don't fake a result
            skipped_analyzers.append({"analyzer": module.__name__, "reason": str(e)})

    if not results:
        raise ValueError(f"match_id {match_id}: no analyzer produced a usable result")

    results.sort(key=lambda r: r["impact"], reverse=True)

    ranked = []
    for i, r in enumerate(results, start=1):
        ranked.append(
            RankedFactor(
                rank=i,
                category=r["category"],
                impact=r["impact"],
                impact_label=_impact_label(r["impact"]),
                winner=r["winner"],
                summary=r["summary"],
                evidence=r["evidence"],
            )
        )

    primary = ranked[0]

    verdict = {
        "match_id": match_id,
        "match_name": match_name,
        "team_a": team_a_name,
        "team_b": team_b_name,
        "winner": winner_name,
        "score": f"{team_a_score}-{team_b_score}",
        "map_scores": _map_scores(conn, match_id),
        "roster": {
            "team_a": _roster(conn, match_id, team_a_id),
            "team_b": _roster(conn, match_id, team_b_id),
        },
        "primary_factor": {
            "category": primary.category,
            "impact_label": primary.impact_label,
            "summary": primary.summary,
        },
        "ranked_factors": [asdict(f) for f in ranked],
    }
    if skipped_analyzers:
        verdict["skipped_analyzers"] = skipped_analyzers
    return verdict


def print_verdict(verdict: dict):
    """Human-readable rendering matching the plan's example format (section 10/11)."""
    print(f"{verdict['team_a']} vs {verdict['team_b']}  ({verdict['score']}, maps: {', '.join(verdict['map_scores'])})")
    print(f"Winner: {verdict['winner']}\n")
    print(f"Primary factor: {verdict['primary_factor']['category']}")
    print(f"  {verdict['primary_factor']['summary']}\n")
    print("Ranked factors:")
    for f in verdict["ranked_factors"]:
        print(f"  {f['rank']}. {f['category']:<20} {f['impact_label']}")
    if verdict.get("skipped_analyzers"):
        print("\nSkipped analyzers (no usable data):")
        for s in verdict["skipped_analyzers"]:
            print(f"  - {s['analyzer']}: {s['reason']}")


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

    verdict = build_verdict(conn, match_id)
    print_verdict(verdict)
    print("\n--- full JSON ---")
    print(json.dumps(verdict, indent=2))
