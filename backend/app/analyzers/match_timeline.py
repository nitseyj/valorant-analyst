"""
backend/app/analyzers/match_timeline.py

Core question: "Show me what happened round-by-round" — powers the
round timeline and economy tracker charts on the match verdict page.
This is genuinely new granularity beyond match_verdict.py's aggregated
evidence (which answers "who was better," not "what happened when").

Data quirk found and handled here: round_team_economy.loadout_value is
stored as an unparsed string like "3.8k" or "18.0k" (the ETL never
converted it to a number — same "k"-suffix format the schema's own
comments already flagged for remaining_credits, but it turned out
loadout_value has the identical problem). Parsed here via `_parse_k()`
rather than re-running the whole ETL for one column.
"""

import sqlite3


def _parse_k(value):
    """'3.8k' -> 3800, '250' -> 250, None/unparseable -> None. Never
    raises — a single bad value shouldn't break an entire chart."""
    if value is None:
        return None
    s = str(value).strip().lower()
    try:
        if s.endswith("k"):
            return round(float(s[:-1]) * 1000)
        return round(float(s))
    except ValueError:
        return None


def _games_for_match(conn, match_id):
    return conn.execute(
        "SELECT game_id, map_name FROM games WHERE match_id = ? ORDER BY game_id", (match_id,)
    ).fetchall()


def round_timeline(conn, match_id, team_a_id, team_b_id):
    """Per game: list of {round_number, winner: 'a'|'b', win_method}."""
    games = _games_for_match(conn, match_id)
    out = []
    for game_id, map_name in games:
        rows = conn.execute(
            "SELECT round_number, winning_team_id, win_method FROM rounds WHERE game_id = ? ORDER BY round_number",
            (game_id,),
        ).fetchall()
        rounds = []
        for round_number, winning_team_id, win_method in rows:
            side = "a" if winning_team_id == team_a_id else ("b" if winning_team_id == team_b_id else None)
            if side is None:
                continue  # shouldn't happen, but never fabricate a side if the team_id doesn't match either team
            rounds.append({"round": round_number, "winner": side, "method": win_method})
        if rounds:
            out.append({"game_id": game_id, "map": map_name, "rounds": rounds})
    return out


def economy_timeline(conn, match_id, team_a_id, team_b_id):
    """Per game: list of {round_number, team_a_loadout, team_b_loadout},
    parsed to real integers. Games with no economy data loaded (a real,
    known gap — see DATA_QUALITY_FINDINGS.md) are simply omitted, not
    padded with fake zeros."""
    games = _games_for_match(conn, match_id)
    out = []
    for game_id, map_name in games:
        rows = conn.execute(
            "SELECT round_number, team_id, loadout_value FROM round_team_economy WHERE game_id = ? ORDER BY round_number",
            (game_id,),
        ).fetchall()
        by_round = {}
        for round_number, team_id, loadout_value in rows:
            parsed = _parse_k(loadout_value)
            if parsed is None:
                continue
            entry = by_round.setdefault(round_number, {"round": round_number, "team_a_loadout": None, "team_b_loadout": None})
            if team_id == team_a_id:
                entry["team_a_loadout"] = parsed
            elif team_id == team_b_id:
                entry["team_b_loadout"] = parsed
        rounds = [by_round[k] for k in sorted(by_round)]
        if rounds:
            out.append({"game_id": game_id, "map": map_name, "rounds": rounds})
    return out


def build_timeline(conn: sqlite3.Connection, match_id: int) -> dict:
    row = conn.execute(
        "SELECT team_a_id, team_b_id FROM matches WHERE match_id = ?", (match_id,)
    ).fetchone()
    if row is None:
        raise ValueError(f"match_id {match_id} not found")
    team_a_id, team_b_id = row

    return {
        "match_id": match_id,
        "round_timeline": round_timeline(conn, match_id, team_a_id, team_b_id),
        "economy_timeline": economy_timeline(conn, match_id, team_a_id, team_b_id),
    }


if __name__ == "__main__":
    import sys
    import json

    db_path = sys.argv[1] if len(sys.argv) > 1 else "valorant.db"
    match_id = int(sys.argv[2]) if len(sys.argv) > 2 else 459522
    conn = sqlite3.connect(db_path)
    result = build_timeline(conn, match_id)
    print(f"round_timeline games: {len(result['round_timeline'])}")
    print(f"economy_timeline games: {len(result['economy_timeline'])}")
    if result["economy_timeline"]:
        print("First game, first 3 rounds of economy:", result["economy_timeline"][0]["rounds"][:3])
    print(json.dumps(result, indent=2)[:1500])
