"""
backend/app/analyzers/agent_analysis.py

Core question: "What did each team's composition look like, and does it
show any real weakness (missing role) or adaptation (changed comp between
maps)?"

Deliberately conservative on "impact" and "winner" compared to the other
analyzers. Composition alone doesn't decide a match — role coverage and
comp-swapping are real, checkable facts, but "Team A won because of their
comp" is exactly the kind of tactical claim the project rules say not to
manufacture without real support. So this module:
  - always returns evidence-backed facts (comps used, role coverage,
    whether a team changed comp after a loss)
  - keeps impact low/moderate at most, and only sets a winner when there's
    a concrete, checkable signal (e.g. a team ran a comp with NO
    sentinel/controller at all, a known meta weakness) — never just
    "Team A's comp looked stronger"

Role classification is embedded as a static map (general public VALORANT
knowledge, not derived from the dataset) since the dataset itself has no
role field. Any agent not in the map is reported as "unknown role" rather
than guessed.
"""

import sqlite3
from dataclasses import dataclass, field, asdict

AGENT_ROLES = {
    "jett": "Duelist", "raze": "Duelist", "reyna": "Duelist", "phoenix": "Duelist", "waylay": "Duelist",
    "yoru": "Duelist", "neon": "Duelist", "iso": "Duelist",
    "brimstone": "Controller", "omen": "Controller", "viper": "Controller",
    "astra": "Controller", "harbor": "Controller", "clove": "Controller",
    "sova": "Initiator", "breach": "Initiator", "skye": "Initiator", "kayo": "Initiator",
    "fade": "Initiator", "gekko": "Initiator", "tejo": "Initiator",
    "killjoy": "Sentinel", "cypher": "Sentinel", "sage": "Sentinel",
    "chamber": "Sentinel", "deadlock": "Sentinel", "vyse": "Sentinel",
}
CORE_ROLES = {"Controller", "Sentinel"}  # comps missing either of these are a known meta weakness

MIN_MAPS_FOR_BEST_AGENT = 3  # below this, one hot map can make a rarely-played agent look like a player's "best"


def best_agents_for_players(conn: sqlite3.Connection, player_ids: list) -> dict:
    """Batched "which agent has this player historically performed best
    on?" lookup — used for the player profile icon (an agent photo, not a
    real player photo — see project design principles). One query for
    however many player_ids are asked for, not one query per player,
    since this runs once per page (leaderboards, rosters) for up to ~20
    players at a time.

    "Best" = highest average rating among agents played at least
    MIN_MAPS_FOR_BEST_AGENT times, same reasoning as players_leaderboard's
    min_maps and team_profile's min_matches_for_ranking: a single hot map
    on a rarely-played agent shouldn't outrank a well-established main.
    Players below that threshold on every agent still get an answer (their
    most-played agent) — same tiered fallback as list_teams(), nothing
    hidden, just deprioritized. Returns {player_id: {"agent": str,
    "maps_played": int, "avg_rating": float|None}}, only for player_ids
    that have at least one agent row.
    """
    if not player_ids:
        return {}
    qmarks = ",".join("?" * len(player_ids))
    cur = conn.execute(
        f"""SELECT pga.player_id, a.name AS agent, COUNT(*) AS maps, AVG(s.rating) AS avg_rating
            FROM player_game_agents pga
            JOIN agents a ON a.agent_id = pga.agent_id
            JOIN player_game_stats s
              ON s.game_id = pga.game_id AND s.player_id = pga.player_id AND s.side = 'both'
            WHERE pga.player_id IN ({qmarks})
            GROUP BY pga.player_id, pga.agent_id""",
        list(player_ids),
    )
    by_player: dict = {}
    for player_id, agent, maps, avg_rating in cur.fetchall():
        by_player.setdefault(player_id, []).append((agent, maps, avg_rating))

    best = {}
    for player_id, candidates in by_player.items():
        candidates.sort(
            key=lambda c: (c[1] >= MIN_MAPS_FOR_BEST_AGENT, c[2] if c[2] is not None else -1, c[1]),
            reverse=True,
        )
        agent, maps, avg_rating = candidates[0]
        best[player_id] = {
            "agent": agent,
            "maps_played": maps,
            "avg_rating": round(avg_rating, 2) if avg_rating is not None else None,
        }
    return best


@dataclass
class Evidence:
    metric: str
    team_a: str
    team_b: str


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


def _comp_for(conn, game_id, team_id):
    cur = conn.execute(
        """SELECT a.name FROM team_game_agent_picks pk
           JOIN agents a ON pk.agent_id = a.agent_id
           WHERE pk.game_id = ? AND pk.team_id = ?
           ORDER BY a.name""",
        (game_id, team_id),
    )
    return [r[0] for r in cur.fetchall()]


def _role_breakdown(comp):
    roles = {}
    for agent in comp:
        role = AGENT_ROLES.get(agent, "Unknown")
        roles[role] = roles.get(role, 0) + 1
    return roles


def _missing_core_roles(roles):
    return sorted(CORE_ROLES - set(roles.keys()))


def analyze_game(conn: sqlite3.Connection, game_id: int) -> dict:
    cur = conn.execute(
        """SELECT m.team_a_id, ta.name, m.team_b_id, tb.name, g.map_name
           FROM games g JOIN matches m ON g.match_id = m.match_id
           JOIN teams ta ON m.team_a_id = ta.team_id
           JOIN teams tb ON m.team_b_id = tb.team_id
           WHERE g.game_id = ?""",
        (game_id,),
    )
    row = cur.fetchone()
    if row is None:
        raise ValueError(f"game_id {game_id} not found")
    team_a_id, team_a_name, team_b_id, team_b_name, map_name = row

    a_comp = _comp_for(conn, game_id, team_a_id)
    b_comp = _comp_for(conn, game_id, team_b_id)
    if not a_comp or not b_comp:
        raise ValueError(f"game_id {game_id}: composition data missing for one or both teams")

    a_roles = _role_breakdown(a_comp)
    b_roles = _role_breakdown(b_comp)
    a_missing = _missing_core_roles(a_roles)
    b_missing = _missing_core_roles(b_roles)

    parts = [f"{team_a_name} ran {', '.join(a_comp)} vs {team_b_name}'s {', '.join(b_comp)} on {map_name}."]
    winner = None
    impact = 0.1  # composition alone rarely decides a map; keep this low by default
    if a_missing and not b_missing:
        parts.append(f"{team_a_name} played without a dedicated {'/'.join(a_missing)} — a real coverage gap.")
        winner = team_b_name
        impact = 0.3
    elif b_missing and not a_missing:
        parts.append(f"{team_b_name} played without a dedicated {'/'.join(b_missing)} — a real coverage gap.")
        winner = team_a_name
        impact = 0.3
    summary = " ".join(parts)

    def fmt_roles(roles):
        return ", ".join(f"{v}x {k}" for k, v in sorted(roles.items())) or "—"

    evidence = [
        Evidence("Composition", ", ".join(a_comp), ", ".join(b_comp)),
        Evidence("Role Breakdown", fmt_roles(a_roles), fmt_roles(b_roles)),
        Evidence("Missing Core Role", "/".join(a_missing) or "none", "/".join(b_missing) or "none"),
    ]

    return AnalyzerResult(
        category="Agent Composition",
        impact=impact,
        winner=winner,
        summary=summary,
        evidence=evidence,
    ).to_dict()


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

    cur = conn.execute("SELECT game_id, map_name FROM games WHERE match_id = ? ORDER BY game_id", (match_id,))
    games = cur.fetchall()
    if not games:
        raise ValueError(f"match_id {match_id} has no games loaded")

    a_comps, b_comps = [], []
    # Tracks the identity of whichever team/map first showed a role gap
    # directly (not as a formatted string) — see the winner assignment
    # below for why. Only the first gap found is kept: with more than one
    # coverage gap in a series, "most recent map processed" isn't a
    # meaningful way to pick which one matters more, so keep it deterministic
    # instead by always keeping the first one found (games are iterated in
    # game_id order).
    missing_role_event = None
    for gid, map_name in games:
        a_comp = _comp_for(conn, gid, team_a_id)
        b_comp = _comp_for(conn, gid, team_b_id)
        if not a_comp or not b_comp:
            continue
        a_comps.append((map_name, a_comp))
        b_comps.append((map_name, b_comp))
        a_missing = _missing_core_roles(_role_breakdown(a_comp))
        b_missing = _missing_core_roles(_role_breakdown(b_comp))
        if missing_role_event is None:
            if a_missing and not b_missing:
                missing_role_event = {"gap_team": team_a_name, "opponent": team_b_name, "map": map_name, "missing": a_missing}
            elif b_missing and not a_missing:
                missing_role_event = {"gap_team": team_b_name, "opponent": team_a_name, "map": map_name, "missing": b_missing}

    if not a_comps:
        raise ValueError(f"match_id {match_id}: no composition data loaded for any map")

    a_unique_agents = {agent for _, comp in a_comps for agent in comp}
    b_unique_agents = {agent for _, comp in b_comps for agent in comp}

    parts = [f"Across {len(a_comps)} map(s), {team_a_name} used {len(a_unique_agents)} unique agent(s), "
             f"{team_b_name} used {len(b_unique_agents)}."]
    if missing_role_event:
        parts.append(
            f"{missing_role_event['gap_team']} played {missing_role_event['map']} without a "
            f"{'/'.join(missing_role_event['missing'])} — a real coverage gap."
        )
    summary = " ".join(parts)

    winner = None
    impact = 0.1
    if missing_role_event:
        impact = 0.25
        # the team WITHOUT the gap gets credited, identified directly from
        # the event rather than by substring-matching team names into a
        # formatted sentence (that broke whenever one team's name was a
        # substring of the other's, e.g. "Cloud9" vs "Cloud9 Academy")
        winner = missing_role_event["opponent"]

    evidence = [
        Evidence("Unique Agents Used", len(a_unique_agents), len(b_unique_agents)),
    ]
    for map_name, comp in a_comps:
        evidence.append(Evidence(f"{map_name} Comp", ", ".join(comp),
                                   ", ".join(dict(b_comps).get(map_name, []))))

    return AnalyzerResult(
        category="Agent Composition",
        impact=impact,
        winner=winner,
        summary=summary,
        evidence=evidence,
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
