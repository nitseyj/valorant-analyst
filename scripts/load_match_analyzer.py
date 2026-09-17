#!/usr/bin/env python3
"""
load_match_analyzer.py — loads one VCT year's matches/ + agents/
CSVs into a SQLite database matching match_analyzer_schema.sql.

Usage:
    python load_match_analyzer.py <raw_data_root> <year_folder_name> --out valorant.db --schema <schema.sql>

    e.g. python load_match_analyzer.py backend/data/raw vct_2025 --out backend/data/valorant.db --schema backend/app/database/match_analyzer_schema.sql

Run once per year, pointing --out at the SAME file each time, to build one
combined multi-year database — it accumulates rather than overwrites (see
the --fresh flag if you actually want a from-scratch single-year rebuild):

    for year in vct_2021 vct_2022 vct_2023 vct_2024 vct_2025 vct_2026; do
        python load_match_analyzer.py backend/data/raw "$year" \
            --out backend/data/valorant.db \
            --schema backend/app/database/match_analyzer_schema.sql
    done

<raw_data_root> must contain:
    all_ids/all_teams_ids.csv, all_teams_mapping.csv, all_players_ids.csv
    <year_folder_name>/ids/tournaments_stages_match_types_ids.csv
    <year_folder_name>/ids/tournaments_stages_matches_games_ids.csv
    <year_folder_name>/matches/*.csv
    <year_folder_name>/agents/teams_picked_agents.csv

This intentionally uses only the Python standard library (csv, sqlite3)
plus pandas for CSV reading convenience — no SQLAlchemy dependency, so
it runs anywhere pandas already is (SQLAlchemy models are a separate,
later layer on top of the same schema for the application code).

Design decisions worth knowing before you change this file:

  - Player identity is resolved by (name, team) within the year, not
    name alone — 266 player handles are shared by genuinely different
    people across the dataset (confirmed via differing Player IDs in
    all_players_ids.csv). Any row that still can't be resolved
    unambiguously is logged and SKIPPED, never guessed.
  - Every "games" and "matches" row is joined through the year's own
    ids/tournaments_stages_matches_games_ids.csv using the full
    (Tournament, Stage, Match Type, Match Name, Map) tuple — never
    assumed from row order.
  - team_game_agent_picks uses a weaker source key (no Match Name).
    Rows that map to more than one game_id for the same
    (tournament, stage, match_type, map, team) are logged and SKIPPED.
"""

import argparse
import sqlite3
import sys
import time
from pathlib import Path
from collections import defaultdict

import pandas as pd


def pct_to_float(s):
    if pd.isna(s):
        return None
    return float(str(s).replace("%", "")) / 100.0


def log(msg):
    print(f"  {msg}")


def read_csv_retry(path, attempts=3, delay=2.0, **kwargs):
    """pd.read_csv with a few retries on transient I/O failures. Observed in
    practice on Windows against the larger files here (e.g. vct_2022's
    ~13MB teams_picked_agents.csv): a "Calling read(nbytes) on source
    failed" ParserError that does NOT reproduce when the exact same read is
    retried a moment later — a transient OS-level read hiccup (antivirus/
    indexer contention is the usual suspect), not a malformed file. Retrying
    beats crashing an entire year's load over it; if it's a genuinely
    corrupt file, all attempts fail the same way and this re-raises."""
    last_err = None
    for attempt in range(1, attempts + 1):
        try:
            return pd.read_csv(path, **kwargs)
        except (pd.errors.ParserError, OSError) as e:
            last_err = e
            if attempt < attempts:
                log(f"read_csv({path}) failed on attempt {attempt}/{attempts} ({e}); retrying...")
                time.sleep(delay)
    raise last_err


def build_year_lookup(df, name_col, id_col):
    """{name: id} for names that are unambiguous within this year's id file,
    plus the count of rows excluded because their name was ambiguous.

    Every per-year id file used here (teams_ids.csv, players_ids.csv) has
    been verified to have zero duplicate names for the years this has
    actually been run against — that's what makes resolving by name safe
    at all (see the module docstring). But a `dict(zip(...))` built
    directly from a duplicated column silently keeps whichever row happens
    to be last, with no error and no signal that anything was wrong — so
    if a future year's data ever breaks that invariant, rows would get
    silently attributed to the wrong team/player instead of being skipped.
    Excluding ambiguous names here instead means `.get(name)` returns None
    for them, same as a genuinely unknown name, and they fall into the
    existing "unknown"-style skip counters already checked at every call
    site — never a silent guess.
    """
    counts = df[name_col].value_counts()
    ambiguous_names = set(counts[counts > 1].index)
    safe_rows = df[~df[name_col].isin(ambiguous_names)]
    lookup = dict(zip(safe_rows[name_col], safe_rows[id_col]))
    return lookup, len(ambiguous_names)


def normalize_tournament(name):
    """
    Some source files (observed: eco_rounds.csv) use a different tournament
    naming convention than the ids/*.csv files and most other matches/*.csv
    files within the SAME year — e.g. "Champions Tour 2025: EMEA Stage 1"
    vs. "VCT 2025: EMEA Stage 1" for the identical tournament. This is a
    real upstream inconsistency, not something to silently coerce without
    a note. Confirmed via direct comparison for the 2025 season; if other
    years show different alias patterns, extend this function and log it
    in the data-quality notes rather than guessing silently.
    """
    if not isinstance(name, str):
        return name
    if "Masters Bangkok" in name and not name.startswith("Valorant"):
        return "Valorant Masters Bangkok 2025"
    return name.replace("Champions Tour ", "VCT ")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("raw_root", type=str)
    ap.add_argument("year_folder", type=str)
    ap.add_argument("--out", type=str, default="valorant.db")
    ap.add_argument("--schema", type=str, default="schema.sql")
    ap.add_argument(
        "--fresh", action="store_true",
        help="Delete and recreate --out from scratch before loading, instead of accumulating "
             "into an existing database. Use this for a single-year rebuild; omit it when "
             "loading multiple years into one combined database one at a time.",
    )
    args = ap.parse_args()

    root = Path(args.raw_root)
    yr = root / args.year_folder
    schema_path = Path(args.schema)

    for p in [root, yr, schema_path]:
        if not p.exists():
            print(f"Missing required path: {p}", file=sys.stderr)
            sys.exit(1)

    out_path = Path(args.out)
    if args.fresh and out_path.exists():
        out_path.unlink()

    # Only apply the schema when the database is actually new — re-running
    # executescript's CREATE TABLE statements against an existing db (the
    # normal case when loading a second, third, ... year into the same file)
    # would fail with "table already exists". Matches/games/players/teams all
    # carry real IDs from the source's own global all_ids/*.csv files, so
    # accumulating years via INSERT OR IGNORE (see below) is safe — nothing
    # gets double-counted or overwritten across runs.
    is_new_db = not out_path.exists()
    conn = sqlite3.connect(out_path)
    if is_new_db:
        conn.executescript(schema_path.read_text())
    cur = conn.cursor()

    stats = defaultdict(int)
    skipped = defaultdict(int)

    # -----------------------------------------------------------------
    print("Loading teams...")
    # IMPORTANT: 36 team names collide with a DIFFERENT team elsewhere in the
    # dataset (e.g. "G2 Esports" has both Team ID 257 and 11058 — same
    # pattern the dataset's own docs flag for "Exotic"). all_ids/all_teams_ids.csv
    # is global across all years and can't disambiguate these by name alone.
    # The per-year ids/teams_ids.csv IS safe to key by name (0 duplicate names
    # within a single year), so that's used for resolving THIS year's rows.
    # The global file is still used to populate the full teams reference table.
    teams_ids_global = read_csv_retry(root / "all_ids/all_teams_ids.csv")
    teams_map = read_csv_retry(root / "all_ids/all_teams_mapping.csv")
    abbr_by_name = dict(zip(teams_map["Full Name"], teams_map["Abbreviated"]))
    for _, row in teams_ids_global.dropna(subset=["Team ID"]).iterrows():
        tid = int(row["Team ID"])
        name = row["Team"]
        abbr = abbr_by_name.get(name)
        is_placeholder = 1 if name in ("TBD", "Mega Minors") else 0
        cur.execute(
            "INSERT OR IGNORE INTO teams (team_id, name, abbreviation, is_placeholder) VALUES (?,?,?,?)",
            (tid, name, abbr, is_placeholder),
        )
        stats["teams"] += 1
    conn.commit()
    log(f"{stats['teams']} teams loaded (global reference set)")

    teams_ids_year = read_csv_retry(yr / "ids/teams_ids.csv")
    team_id_by_name, ambiguous_team_names = build_year_lookup(teams_ids_year, "Team", "Team ID")
    log(f"{len(team_id_by_name)} team names resolvable unambiguously for {args.year_folder} "
        f"({ambiguous_team_names} ambiguous name(s) excluded, if any — those rows will be skipped "
        f"downstream as unknown-team, not misattributed)")

    # -----------------------------------------------------------------
    print("Loading players...")
    # SAME issue as teams: all_ids/all_players_ids.csv is global across all
    # years and has 224+ duplicate names (genuinely different real players
    # sharing a handle). The per-year ids/players_ids.csv has ZERO duplicate
    # names within a single year (verified: all 343 players appearing in
    # vct_2025/matches/overview.csv resolve against it with no gaps), so
    # THAT is what per-match stat rows are resolved against. The global
    # file is still used to populate the full players reference table.
    players_ids_global = read_csv_retry(root / "all_ids/all_players_ids.csv")
    for _, row in players_ids_global.dropna(subset=["Player ID"]).iterrows():
        pid = int(row["Player ID"])
        name = row["Player"]
        cur.execute("INSERT OR IGNORE INTO players (player_id, name) VALUES (?,?)", (pid, name))
        stats["players"] += 1
    conn.commit()
    log(f"{stats['players']} players loaded (global reference set)")

    players_ids_year = read_csv_retry(yr / "ids/players_ids.csv")
    player_id_by_name, ambiguous_player_names = build_year_lookup(players_ids_year, "Player", "Player ID")
    log(f"{len(player_id_by_name)} player names resolvable unambiguously for {args.year_folder} "
        f"({ambiguous_player_names} ambiguous name(s) excluded, if any — those rows will be skipped "
        f"downstream as unknown-player, not misattributed)")

    # -----------------------------------------------------------------
    print("Loading tournaments/stages...")
    match_types = read_csv_retry(yr / "ids/tournaments_stages_match_types_ids.csv")
    seen_tournaments, seen_stages = set(), set()
    year_num = int(args.year_folder.split("_")[-1])
    for _, row in match_types.dropna(subset=["Tournament ID", "Stage ID"]).iterrows():
        tid = int(row["Tournament ID"])
        if tid not in seen_tournaments:
            cur.execute(
                "INSERT OR IGNORE INTO tournaments (tournament_id, name, year) VALUES (?,?,?)",
                (tid, row["Tournament"], year_num),
            )
            seen_tournaments.add(tid)
        sid = int(row["Stage ID"])
        if sid not in seen_stages:
            cur.execute(
                "INSERT OR IGNORE INTO stages (stage_id, tournament_id, name) VALUES (?,?,?)",
                (sid, tid, row["Stage"]),
            )
            seen_stages.add(sid)
    conn.commit()
    log(f"{len(seen_tournaments)} tournaments, {len(seen_stages)} stages")

    # -----------------------------------------------------------------
    print("Building match/game ID lookup...")
    id_map = read_csv_retry(yr / "ids/tournaments_stages_matches_games_ids.csv")

    def match_key(row):
        return (normalize_tournament(row["Tournament"]), row["Stage"], row["Match Type"], row["Match Name"])

    def game_key(row):
        return match_key(row) + (row["Map"],)

    match_lookup = {}   # match_key -> (match_id, tournament_id, stage_id)
    game_lookup = {}    # game_key -> game_id
    id_cols = ["Match ID", "Tournament ID", "Stage ID", "Game ID"]
    for _, row in id_map.iterrows():
        # A handful of rows in this lookup file (observed: 1 row in vct_2021)
        # have a missing ID column — a genuine upstream scraping gap, not
        # something to guess at. Skip just that row rather than crashing the
        # whole year's load on int(nan).
        if row[id_cols].isna().any():
            skipped["id_map_incomplete_row"] += 1
            continue
        mk = match_key(row)
        match_lookup[mk] = (int(row["Match ID"]), int(row["Tournament ID"]), int(row["Stage ID"]))
        game_lookup[game_key(row)] = int(row["Game ID"])
    log(f"{len(match_lookup)} matches, {len(game_lookup)} games indexed "
        f"({skipped['id_map_incomplete_row']} id-lookup row(s) skipped for a missing ID column)")

    # -----------------------------------------------------------------
    print("Loading matches...")
    scores = read_csv_retry(yr / "matches/scores.csv")
    for _, row in scores.iterrows():
        mk = (normalize_tournament(row["Tournament"]), row["Stage"], row["Match Type"], row["Match Name"])
        if mk not in match_lookup:
            skipped["matches_no_id"] += 1
            continue
        match_id, tournament_id, stage_id = match_lookup[mk]
        team_a_id = team_id_by_name.get(row["Team A"])
        team_b_id = team_id_by_name.get(row["Team B"])
        if team_a_id is None or team_b_id is None:
            skipped["matches_unknown_team"] += 1
            continue
        winner_id = None
        if isinstance(row["Match Result"], str) and " won" in row["Match Result"]:
            winner_name = row["Match Result"].replace(" won", "")
            winner_id = team_id_by_name.get(winner_name)
        source_key = "|".join(mk)
        cur.execute(
            """INSERT OR IGNORE INTO matches
               (match_id, tournament_id, stage_id, match_type, match_name,
                team_a_id, team_b_id, team_a_score, team_b_score, winner_team_id, source_key)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (match_id, tournament_id, stage_id, row["Match Type"], row["Match Name"],
             team_a_id, team_b_id, int(row["Team A Score"]), int(row["Team B Score"]),
             winner_id, source_key),
        )
        stats["matches"] += 1
    conn.commit()
    log(f"{stats['matches']} matches loaded, {skipped['matches_no_id']} skipped (no ID match), "
        f"{skipped['matches_unknown_team']} skipped (unknown team)")

    # -----------------------------------------------------------------
    print("Loading games (maps)...")
    maps_scores = read_csv_retry(yr / "matches/maps_scores.csv")
    for _, row in maps_scores.iterrows():
        gk = (normalize_tournament(row["Tournament"]), row["Stage"], row["Match Type"], row["Match Name"], row["Map"])
        if gk not in game_lookup:
            skipped["games_no_id"] += 1
            continue
        game_id = game_lookup[gk]
        mk = gk[:4]
        if mk not in match_lookup:
            skipped["games_no_match"] += 1
            continue
        match_id = match_lookup[mk][0]
        source_key = "|".join(str(x) for x in gk)
        cur.execute(
            """INSERT OR IGNORE INTO games
               (game_id, match_id, map_name, duration,
                team_a_score, team_a_attack_score, team_a_defend_score, team_a_overtime_score,
                team_b_score, team_b_attack_score, team_b_defend_score, team_b_overtime_score,
                source_key)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (game_id, match_id, row["Map"], row.get("Duration"),
             int(row["Team A Score"]), row.get("Team A Attacker Score"), row.get("Team A Defender Score"),
             row.get("Team A Overtime Score"),
             int(row["Team B Score"]), row.get("Team B Attacker Score"), row.get("Team B Defender Score"),
             row.get("Team B Overtime Score"),
             source_key),
        )
        stats["games"] += 1
    conn.commit()
    log(f"{stats['games']} games loaded, {skipped['games_no_id']} skipped (no ID match), "
        f"{skipped['games_no_match']} skipped (match not loaded)")

    # -----------------------------------------------------------------
    print("Loading rounds (win/loss methods)...")
    wlm = read_csv_retry(yr / "matches/win_loss_methods_round_number.csv")
    wlm_win = wlm[wlm["Outcome"] == "Win"]
    for _, row in wlm_win.iterrows():
        gk = (normalize_tournament(row["Tournament"]), row["Stage"], row["Match Type"], row["Match Name"], row["Map"])
        if gk not in game_lookup:
            skipped["rounds_no_game"] += 1
            continue
        game_id = game_lookup[gk]
        team_id = team_id_by_name.get(row["Team"])
        if team_id is None:
            skipped["rounds_unknown_team"] += 1
            continue
        cur.execute(
            "INSERT OR IGNORE INTO rounds (game_id, round_number, winning_team_id, win_method) VALUES (?,?,?,?)",
            (game_id, int(row["Round Number"]), team_id, row["Method"]),
        )
        stats["rounds"] += 1
    conn.commit()
    log(f"{stats['rounds']} rounds loaded, {skipped['rounds_no_game']} skipped (no game ID), "
        f"{skipped['rounds_unknown_team']} skipped (unknown team)")

    # -----------------------------------------------------------------
    print("Loading round economy...")
    eco = read_csv_retry(yr / "matches/eco_rounds.csv")
    for _, row in eco.iterrows():
        gk = (normalize_tournament(row["Tournament"]), row["Stage"], row["Match Type"], row["Match Name"], row["Map"])
        if gk not in game_lookup:
            skipped["econ_no_game"] += 1
            continue
        game_id = game_lookup[gk]
        team_id = team_id_by_name.get(row["Team"])
        if team_id is None:
            skipped["econ_unknown_team"] += 1
            continue
        cur.execute(
            """INSERT OR IGNORE INTO round_team_economy
               (game_id, round_number, team_id, loadout_value, remaining_credits, buy_type, outcome)
               VALUES (?,?,?,?,?,?,?)""",
            (game_id, int(row["Round Number"]), team_id, row.get("Loadout Value"),
             row.get("Remaining Credits"), row.get("Type"), row["Outcome"]),
        )
        stats["round_economy"] += 1
    conn.commit()
    log(f"{stats['round_economy']} round-economy rows loaded, "
        f"{skipped['econ_no_game']} skipped (no game ID), {skipped['econ_unknown_team']} skipped (unknown team)")

    # agent_id_cache/get_agent_id are shared by player_game_agents (below) and
    # team_game_agent_picks (further down) — defined once here so both use
    # the same agents.name -> agent_id mapping instead of two independent ones.
    agent_id_cache = {}

    def get_agent_id(name):
        if name in agent_id_cache:
            return agent_id_cache[name]
        cur.execute("INSERT OR IGNORE INTO agents (name) VALUES (?)", (name,))
        cur.execute("SELECT agent_id FROM agents WHERE name = ?", (name,))
        aid = cur.fetchone()[0]
        agent_id_cache[name] = aid
        return aid

    # -----------------------------------------------------------------
    print("Loading player game stats (overview.csv)...")
    overview = read_csv_retry(yr / "matches/overview.csv")
    for _, row in overview.iterrows():
        gk = (normalize_tournament(row["Tournament"]), row["Stage"], row["Match Type"], row["Match Name"], row["Map"])
        if gk not in game_lookup:
            skipped["pstats_no_game"] += 1
            continue
        game_id = game_lookup[gk]
        team_id = team_id_by_name.get(row["Team"])
        if team_id is None:
            skipped["pstats_unknown_team"] += 1
            continue
        player_id = player_id_by_name.get(row["Player"])
        if player_id is None:
            skipped["pstats_unknown_player"] += 1
            continue
        cur.execute(
            """INSERT OR IGNORE INTO player_game_stats
               (game_id, player_id, team_id, side, rating, acs, kills, deaths, assists,
                kd_diff, kast_pct, adr, hs_pct, first_kills, first_deaths, fk_fd_diff)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (game_id, player_id, team_id, row["Side"], row.get("Rating"), row.get("Average Combat Score"),
             row.get("Kills"), row.get("Deaths"), row.get("Assists"), row.get("Kills - Deaths (KD)"),
             pct_to_float(row.get("Kill, Assist, Trade, Survive %")), row.get("Average Damage Per Round"),
             pct_to_float(row.get("Headshot %")), row.get("First Kills"), row.get("First Deaths"),
             row.get("Kills - Deaths (FKD)")),
        )
        stats["player_game_stats"] += 1

        # overview.csv's "Agents" column ("yoru" or, on an agent swap
        # mid-map, "sova, yoru") — this was queried by roster_builder.py
        # from day one but never actually populated by this loader, so
        # every player's primary_agent/primary_role came back empty. Only
        # need it once per (game, player), not once per side='both'/
        # 'attack'/'defend' row, so gate on side='both'.
        if row["Side"] == "both" and isinstance(row.get("Agents"), str):
            for agent_name in row["Agents"].split(","):
                agent_name = agent_name.strip().lower()
                if not agent_name:
                    continue
                agent_id = get_agent_id(agent_name)
                cur.execute(
                    "INSERT OR IGNORE INTO player_game_agents (game_id, player_id, agent_id) VALUES (?,?,?)",
                    (game_id, player_id, agent_id),
                )
                stats["player_game_agents"] += 1
    conn.commit()
    log(f"{stats['player_game_stats']} player_game_stats rows loaded, "
        f"{stats['player_game_agents']} player_game_agents rows loaded")
    log(f"  skipped: no_game={skipped['pstats_no_game']}, unknown_team={skipped['pstats_unknown_team']}, "
        f"unknown_player={skipped['pstats_unknown_player']} (includes any ambiguous names excluded above)")

    # -----------------------------------------------------------------
    print("Loading player game impact (kills_stats.csv)...")
    kills_stats = read_csv_retry(yr / "matches/kills_stats.csv")
    for _, row in kills_stats.iterrows():
        if row["Map"] == "All Maps":
            skipped["pimpact_aggregate_row"] += 1
            continue
        gk = (normalize_tournament(row["Tournament"]), row["Stage"], row["Match Type"], row["Match Name"], row["Map"])
        if gk not in game_lookup:
            skipped["pimpact_no_game"] += 1
            continue
        game_id = game_lookup[gk]
        team_id = team_id_by_name.get(row["Team"])
        if team_id is None:
            skipped["pimpact_unknown_team"] += 1
            continue
        player_id = player_id_by_name.get(row["Player"])
        if player_id is None:
            skipped["pimpact_unknown_player"] += 1
            continue

        def z(v):
            return 0 if pd.isna(v) else int(v)

        cur.execute(
            """INSERT OR IGNORE INTO player_game_impact
               (game_id, player_id, team_id, two_k, three_k, four_k, five_k,
                clutch_1v1, clutch_1v2, clutch_1v3, clutch_1v4, clutch_1v5,
                econ_rating, spike_plants, spike_defuses)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (game_id, player_id, team_id, z(row.get("2k")), z(row.get("3k")), z(row.get("4k")), z(row.get("5k")),
             z(row.get("1v1")), z(row.get("1v2")), z(row.get("1v3")), z(row.get("1v4")), z(row.get("1v5")),
             row.get("Econ"), z(row.get("Spike Plants")), z(row.get("Spike Defuses"))),
        )
        stats["player_game_impact"] += 1
    conn.commit()
    log(f"{stats['player_game_impact']} player_game_impact rows loaded")
    log(f"  skipped: aggregate_row={skipped['pimpact_aggregate_row']}, no_game={skipped['pimpact_no_game']}, "
        f"unknown_team={skipped['pimpact_unknown_team']}, unknown_player={skipped['pimpact_unknown_player']}")

    # -----------------------------------------------------------------
    print("Loading team agent picks...")
    picks = read_csv_retry(yr / "agents/teams_picked_agents.csv")
    # agent_id_cache/get_agent_id defined earlier, shared with player_game_agents

    # (Tournament, Stage, Match Type, Map) alone is NOT unique — in
    # round-robin "Group Stage" weeks the same Match Type label (e.g.
    # "Week 4") is reused across several different matchups that week.
    # Resolve properly instead: find the ONE match in (tournament, stage,
    # match_type) that this team actually played, then find that match's
    # game on this map. Uses the matches/games rows already committed above.
    for _, row in picks.iterrows():
        if row["Stage"] == "All Stages" or row["Match Type"] == "All Match Types":
            # tournament-level aggregate row, not tied to any single game —
            # same pattern as the "All Maps" rows in overview.csv/kills_stats.csv
            skipped["picks_aggregate_row"] += 1
            continue
        team_id = team_id_by_name.get(row["Team"])
        if team_id is None:
            skipped["picks_unknown_team"] += 1
            continue
        tournament = normalize_tournament(row["Tournament"])
        cur.execute(
            """SELECT g.game_id FROM games g
               JOIN matches m ON g.match_id = m.match_id
               JOIN tournaments t ON m.tournament_id = t.tournament_id
               JOIN stages s ON m.stage_id = s.stage_id
               WHERE t.name = ? AND s.name = ? AND m.match_type = ?
                 AND (m.team_a_id = ? OR m.team_b_id = ?)
                 AND g.map_name = ?""",
            (tournament, row["Stage"], row["Match Type"], team_id, team_id, row["Map"]),
        )
        candidate_gids = [r[0] for r in cur.fetchall()]
        if len(candidate_gids) != 1:
            skipped["picks_ambiguous_game"] += 1
            continue
        game_id = candidate_gids[0]
        agent_id = get_agent_id(row["Agent"])
        cur.execute(
            """INSERT OR IGNORE INTO team_game_agent_picks
               (game_id, team_id, agent_id, map_wins, map_losses, maps_played)
               VALUES (?,?,?,?,?,?)""",
            (game_id, team_id, agent_id, row.get("Total Wins By Map"),
             row.get("Total Loss By Map"), row.get("Total Maps Played")),
        )
        stats["agent_picks"] += 1
    conn.commit()
    log(f"{stats['agent_picks']} agent-pick rows loaded, {skipped['picks_ambiguous_game']} skipped (ambiguous game), "
        f"{skipped['picks_unknown_team']} skipped (unknown team)")

    conn.close()

    print("\n=== Load summary ===")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    print("\n=== Skipped (data-quality gaps, not bugs) ===")
    for k, v in skipped.items():
        print(f"  {k}: {v}")
    print(f"\nDatabase written to: {out_path.resolve()}")


if __name__ == "__main__":
    main()
