-- =====================================================================
-- Valorant Analyst — Match Analyzer schema (V0.1 → V0.2 scope only)
-- =====================================================================
-- Scope: only what section 10 (Match Analyzer) needs. Team profiles,
-- roster history, personal/ranked data, and meta tables come later —
-- don't build them until their own module is up (project philosophy,
-- section 21).
--
-- Source: "Valorant Champion Tour 2021-2026 Data" (Ryan Luong, Kaggle,
-- MIT license). Every column below was checked against real rows in
-- vct_2025/matches/*.csv and vct_2025/agents/teams_picked_agents.csv —
-- see backend/data/dataset_report.md for the full field inventory.
--
-- Key design notes (read before changing anything):
--
-- 1. SOURCE HAS NO SINGLE MATCH/GAME ID in matches/*.csv or
--    agents/teams_picked_agents.csv. Rows are keyed by the text tuple
--    (Tournament, Stage, Match Type, Match Name[, Map]). The numeric
--    IDs live only in all_ids/all_matches_games_ids.csv. Every table
--    below keeps a `source_key` (the raw text tuple, hashed or
--    concatenated) alongside the real FK, so the ETL step can verify
--    the join against all_ids instead of assuming it's unique.
--
-- 2. "matches" here = a BO1/BO3/BO5 series (what the source calls a
--    match). "games" = one individual map played within that series
--    (what the source's own ID file calls "Game ID"). This avoids
--    confusion with `map_name` (Haven, Bind, ...), which is just a
--    string attribute of a game, not an entity.
--
-- 3. overview.csv gives THREE rows per player per map: one for side
--    = 'both' (the full-map aggregate) and one each for 'attack' and
--    'defend'. player_game_stats keeps `side` as part of the primary
--    key rather than trying to flatten these into one row — the
--    attack/defend splits are exactly what side_performance.py needs
--    and shouldn't be derived/recomputed if the source already gives
--    them.
--
-- 4. teams_picked_agents.csv is one row per (team, agent, map) with
--    win/loss counts for that agent on that map — NOT one row per
--    5-agent lineup. Reconstructing a composition is a GROUP BY on
--    (game_id, team_id). Kept as its own join table rather than a
--    JSON array column on games, so "how often was X+Y+Z run
--    together" stays a normal query.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Lookup entities
-- ---------------------------------------------------------------------

CREATE TABLE tournaments (
    tournament_id   INTEGER PRIMARY KEY,   -- from all_ids: "Tournament ID"
    name            TEXT NOT NULL,         -- e.g. "Valorant Champions 2025"
    year            INTEGER NOT NULL
);

CREATE TABLE stages (
    stage_id        INTEGER PRIMARY KEY,   -- from all_ids: "Stage ID"
    tournament_id   INTEGER NOT NULL REFERENCES tournaments(tournament_id),
    name            TEXT NOT NULL          -- e.g. "Group Stage", "Playoffs", "Swiss Stage"
);

CREATE TABLE teams (
    team_id         INTEGER PRIMARY KEY,   -- from all_ids/all_teams_ids.csv
    name            TEXT NOT NULL,         -- full name, e.g. "Paper Rex"
    abbreviation    TEXT,                  -- from team_mapping.csv, e.g. "PRX" (nullable: TBD/placeholder teams)
    is_placeholder  BOOLEAN NOT NULL DEFAULT 0  -- flags "TBD"/qualifier-slot rows per dataset's own warning
);

CREATE TABLE players (
    player_id       INTEGER PRIMARY KEY,   -- from all_ids/all_players_ids.csv
    name            TEXT NOT NULL          -- caution: a real player is literally named "nan" — never coerce this column with pandas default NA handling
);

CREATE TABLE agents (
    agent_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL UNIQUE   -- e.g. "omen", "jett" — lowercase as-scraped
);


-- ---------------------------------------------------------------------
-- Match / game structure
-- ---------------------------------------------------------------------

CREATE TABLE matches (
    match_id        INTEGER PRIMARY KEY,   -- from all_ids: "Match ID"
    tournament_id   INTEGER NOT NULL REFERENCES tournaments(tournament_id),
    stage_id        INTEGER NOT NULL REFERENCES stages(stage_id),
    match_type      TEXT NOT NULL,         -- e.g. "Opening (A)", "Upper Quarterfinals" — kept as text, not normalized (see note below)
    match_name      TEXT NOT NULL,         -- e.g. "Paper Rex vs Xi Lai Gaming" — human label only, not a key
    team_a_id       INTEGER NOT NULL REFERENCES teams(team_id),
    team_b_id       INTEGER NOT NULL REFERENCES teams(team_id),
    team_a_score    INTEGER NOT NULL,      -- maps won, from scores.csv
    team_b_score    INTEGER NOT NULL,
    winner_team_id  INTEGER REFERENCES teams(team_id),
    source_key      TEXT NOT NULL UNIQUE   -- concat(Tournament, Stage, Match Type, Match Name) — ETL join/validation key, see note 1
);

CREATE TABLE games (
    game_id             INTEGER PRIMARY KEY,   -- from all_ids: "Game ID"
    match_id            INTEGER NOT NULL REFERENCES matches(match_id),
    map_name             TEXT NOT NULL,         -- e.g. "Bind" — from maps_played.csv / maps_scores.csv
    duration            TEXT,                  -- "MM:SS", from maps_scores.csv, nullable — not always recorded
    team_a_score         INTEGER NOT NULL,
    team_a_attack_score   INTEGER,
    team_a_defend_score   INTEGER,
    team_a_overtime_score INTEGER,
    team_b_score         INTEGER NOT NULL,
    team_b_attack_score   INTEGER,
    team_b_defend_score   INTEGER,
    team_b_overtime_score INTEGER,
    source_key           TEXT NOT NULL UNIQUE  -- concat(match.source_key, Map) — see note 1
);

CREATE TABLE rounds (
    game_id         INTEGER NOT NULL REFERENCES games(game_id),
    round_number    INTEGER NOT NULL,
    winning_team_id INTEGER NOT NULL REFERENCES teams(team_id),
    win_method      TEXT NOT NULL,   -- 'Elimination' | 'Detonated' | 'Defused' | 'Time Expiry (No Plant)' | 'Time Expiry (Failed to Plant)' — from win_loss_methods_round_number.csv
    PRIMARY KEY (game_id, round_number)
);

CREATE TABLE round_team_economy (
    game_id             INTEGER NOT NULL,
    round_number        INTEGER NOT NULL,
    team_id             INTEGER NOT NULL REFERENCES teams(team_id),
    loadout_value       INTEGER,   -- from eco_rounds.csv; NULL for matches at/after Masters Toronto 2025 (VLR stopped publishing it — see dataset README)
    remaining_credits   TEXT,      -- source gives this as "0.2k" style strings, not raw ints — decide in ETL whether to parse to int (recommended) or keep as text
    buy_type            TEXT,      -- e.g. "Eco: 0-5k"
    outcome             TEXT NOT NULL,  -- 'Win' | 'Loss'
    FOREIGN KEY (game_id, round_number) REFERENCES rounds(game_id, round_number),
    PRIMARY KEY (game_id, round_number, team_id)
);


-- ---------------------------------------------------------------------
-- Player performance (this is the core of the Match Analyzer)
-- ---------------------------------------------------------------------

CREATE TABLE player_game_stats (
    game_id         INTEGER NOT NULL REFERENCES games(game_id),
    player_id       INTEGER NOT NULL REFERENCES players(player_id),
    team_id         INTEGER NOT NULL REFERENCES teams(team_id),
    side            TEXT NOT NULL,   -- 'both' | 'attack' | 'defend' — see note 3, do NOT collapse into one row
    rating          REAL,
    acs             REAL,            -- Average Combat Score
    kills           INTEGER,
    deaths          INTEGER,
    assists         INTEGER,
    kd_diff         INTEGER,         -- "Kills - Deaths (KD)" as given, not recomputed
    kast_pct        REAL,            -- stored as parsed float (e.g. 0.91), source gives "91%" string — parse in ETL
    adr             REAL,
    hs_pct          REAL,
    first_kills     INTEGER,
    first_deaths    INTEGER,
    fk_fd_diff      INTEGER,
    PRIMARY KEY (game_id, player_id, side)
);

CREATE TABLE player_game_agents (
    game_id     INTEGER NOT NULL REFERENCES games(game_id),
    player_id   INTEGER NOT NULL REFERENCES players(player_id),
    agent_id    INTEGER NOT NULL REFERENCES agents(agent_id),
    PRIMARY KEY (game_id, player_id, agent_id)
    -- from overview.csv "Agents" column — kept plural/many-to-many because
    -- agent swaps mid-map do happen and the source sometimes lists more than one
);

CREATE TABLE player_game_impact (
    game_id         INTEGER NOT NULL REFERENCES games(game_id),
    player_id       INTEGER NOT NULL REFERENCES players(player_id),
    team_id         INTEGER NOT NULL REFERENCES teams(team_id),
    two_k           INTEGER DEFAULT 0,
    three_k         INTEGER DEFAULT 0,
    four_k          INTEGER DEFAULT 0,
    five_k          INTEGER DEFAULT 0,
    clutch_1v1      INTEGER DEFAULT 0,
    clutch_1v2      INTEGER DEFAULT 0,
    clutch_1v3      INTEGER DEFAULT 0,
    clutch_1v4      INTEGER DEFAULT 0,
    clutch_1v5      INTEGER DEFAULT 0,
    econ_rating     REAL,        -- "Econ" column, kills_stats.csv
    spike_plants    INTEGER DEFAULT 0,
    spike_defuses   INTEGER DEFAULT 0,
    PRIMARY KEY (game_id, player_id)
    -- note: source's kills_stats.csv has Map='All Maps' rows too (series aggregate) —
    -- ETL must only load true per-map rows here, and handle the 'All Maps' rows
    -- separately (they belong at the match level, not game level, if kept at all)
);


-- ---------------------------------------------------------------------
-- Agent composition & draft
-- ---------------------------------------------------------------------

CREATE TABLE team_game_agent_picks (
    game_id         INTEGER NOT NULL REFERENCES games(game_id),
    team_id         INTEGER NOT NULL REFERENCES teams(team_id),
    agent_id        INTEGER NOT NULL REFERENCES agents(agent_id),
    map_wins        INTEGER,   -- "Total Wins By Map" — tournament-scoped stat attached to this agent+map+team, NOT this specific game's result
    map_losses      INTEGER,
    maps_played     INTEGER,
    PRIMARY KEY (game_id, team_id, agent_id)
    -- CAUTION (see note 1): source key here is (Tournament, Stage, Match Type,
    -- Map, Team) with NO Match Name column. Validate against all_ids before
    -- trusting this joins to exactly one game_id — flag and skip on ambiguity
    -- rather than guess.
);

CREATE TABLE match_draft_actions (
    match_id        INTEGER NOT NULL REFERENCES matches(match_id),
    sequence_no     INTEGER NOT NULL,   -- order of pick/ban actions as listed in draft_phase.csv
    team_id         INTEGER NOT NULL REFERENCES teams(team_id),
    action          TEXT NOT NULL,      -- 'pick' | 'ban'
    map_name         TEXT NOT NULL,
    PRIMARY KEY (match_id, sequence_no)
);
