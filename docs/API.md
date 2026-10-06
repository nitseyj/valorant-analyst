# API reference

The backend is a FastAPI application. It serves JSON over HTTP at
`http://127.0.0.1:8000` by default. While the server runs, the generated
interactive documentation is at `/docs`, and the OpenAPI schema is at
`/openapi.json`.

This document describes every endpoint, its parameters, the fields it
returns, and its error responses. The field lists are taken from live
responses against the 2021 to 2026 database, so they show the shape the
frontend depends on. Nested objects are summarised where they are long.

## Conventions

**Base URL.** `http://127.0.0.1:8000`. Start the server from the `backend/`
directory with `python -m uvicorn app.main:app --reload`.

**Format.** Every response is `application/json`. Matches are identified by
numeric IDs, and seasons by year.

**Identifiers.**

| Name | Type | Meaning |
|---|---|---|
| `match_id` | integer | One series, such as a best-of-three |
| `game_id` | integer | One map played inside a series |
| `team_id` | integer | A team |
| player names | string | Players are identified by their exact in-game name |

**Scores.** A series score such as `"2-1"` is maps won by each side. A map
score in `games` is the rounds won by each side on that map.

**Errors.** Errors return a JSON body of the form `{"detail": "..."}`.

| Status | When |
|---|---|
| 400 | A parameter has an invalid value that the endpoint checks itself, such as an unknown `tier`, an unknown leaderboard `metric`, or an unknown roster player |
| 404 | An identifier or name does not exist in the loaded data |
| 422 | A parameter fails type or range validation (for example `limit=9999`) |

**Caching.** The heavier endpoints are memoised in process with
`functools.lru_cache`, so repeated requests with the same arguments are fast.
The cache lives for the life of the server process, so restart the server to
pick up a rebuilt database.

**Security.** CORS is currently open to every origin (`allow_origins=["*"]`),
which suits local development. Restrict it to your frontend's origin before
any deployment. The comment in `main.py` says the same.

## Health

### `GET /health`

Reports whether the server can reach the database.

| Field | Type | Description |
|---|---|---|
| `status` | string | Overall status |
| `database` | string | Path of the database file in use |
| `database_reachable` | boolean | Whether a connection could be opened |

## Matches

### `GET /matches`

Lists matches with filters and pagination.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `team` | string | none | Partial, case-insensitive team name |
| `tournament` | string | none | Partial tournament name |
| `year` | integer | none | Season year, 2021 to 2026 |
| `limit` | integer | 50 | 1 to 500 |
| `offset` | integer | 0 | Pagination offset |

Response:

| Field | Type | Description |
|---|---|---|
| `count` | integer | Matches in this page |
| `total` | integer | Matches matching the filters, across all pages |
| `matches` | array | Each item: `match_id`, `match_name`, `tournament`, `year`, `stage`, `match_type`, `team_a`, `team_b`, `team_a_score`, `team_b_score`, `winner` |

Example:

```bash
curl "http://127.0.0.1:8000/matches?team=Paper+Rex&year=2025&limit=5"
```

### `GET /matches/{match_id}`

Basic information for one series, including every map played.

| Field | Type | Description |
|---|---|---|
| `match_id`, `match_name`, `tournament`, `stage`, `match_type` | | Identification |
| `team_a`, `team_b` | string | Team names |
| `team_a_score`, `team_b_score` | integer | Maps won by each side |
| `winner` | string or null | Winning team, when recorded |
| `games` | array | One item per map: `game_id`, `map_name`, `team_a_score`, `team_b_score` (rounds) |

Errors: 404 when `match_id` does not exist.

The verdict endpoint does not list map names. Use this endpoint for them.

### `GET /matches/{match_id}/verdict`

The series-level analysis. Six analyzers run against the whole series, each
returns an impact score, and the results are ranked by that score.

| Field | Type | Description |
|---|---|---|
| `match_id`, `match_name`, `team_a`, `team_b`, `winner` | | Identification |
| `score` | string | Series score, for example `"2-1"` |
| `map_scores` | array of strings | Round score for each map, in play order |
| `roster` | object | `team_a` and `team_b`: player stat rows for the series |
| `primary_factor` | object | The highest-impact factor: `category`, `impact_label`, `summary` |
| `ranked_factors` | array | Each factor: `rank`, `category`, `impact` (0 to 1), `impact_label`, `winner`, `summary`, `evidence` |
| `skipped_analyzers` | array | Analyzers that had no usable data, each with `analyzer` and `reason` |

Errors: 404 when the match does not exist or cannot be analysed.

Note that `impact` is a measured value in the range 0 to 1, not a probability.
`impact_label` is the human-readable band for it.

### `GET /matches/{match_id}/timeline`

Round-by-round and economy data for the series.

| Field | Type | Description |
|---|---|---|
| `match_id` | integer | Identification |
| `round_timeline` | array | One item per map: `game_id`, `map`, `rounds` (round results in order) |
| `economy_timeline` | array | Per map: `game_id`, `map`, `rounds`. Each round has `round`, `team_a_loadout`, `team_b_loadout` (buy value), and `team_a_remaining`, `team_b_remaining` (credits left after buying). A value is null when the source does not record it. VCT 2026 has no loadout values, only remaining credits |

## Games (single map)

### `GET /games/{game_id}/verdict`

The same analysis as the series verdict, scoped to one map.

| Field | Type | Description |
|---|---|---|
| `game_id` | integer | Identification |
| `primary_factor` | object | Highest-impact factor, with `rank` included |
| `ranked_factors` | array | Same shape as the series verdict |
| `skipped_analyzers` | array | Analyzers without usable data |

Errors: 404 when no analyzer produced a usable result for the map.

### `GET /games/{game_id}/lineups`

Each team's players on one map, with the agent each played.

| Field | Type | Description |
|---|---|---|
| `game_id`, `map` | | Identification |
| `team_a`, `team_b` | object | `team_id`, `name`, and `players` |

Each player has `name`, `agent` (the agent played most on this map, or null),
and `agents` (every agent recorded for them on this map, most-used first).

Players are sorted by name. A side can have fewer than five players when the
source data is incomplete, so clients should not assume exactly five. Some
maps have no agent records at all, in which case `agent` is null.

Errors: 404 when `game_id` does not exist.

## Teams

### `GET /teams`

Every team with at least one loaded match, ranked by all-time win rate.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `q` | string | none | Partial team name |
| `tier` | string | none | `tier1` (international and franchised organisations) or `tier2` (everyone else). Omit for every team |

Response: `teams`, an array. Each item has `team_id`, `name`, `matches`,
`wins`, `win_rate`, and `ranked` (true when the team has enough matches to be
ranked).

Errors: 400 when `tier` is neither `tier1` nor `tier2`.

Tier membership comes from real tournament names in the loaded data. It is
not an official designation.

### `GET /teams/{team_id}/profile`

The full-season profile for one team.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `year` | integer | none | Scope the roster to one loaded season. Falls back to all-time when the team has no data for that year |

| Field | Type | Description |
|---|---|---|
| `team_id`, `name` | | Identification |
| `record` | object | `wins`, `losses`, `matches` |
| `win_rate` | number | All-time win rate |
| `map_stats` | array | Per map: `map`, `maps_played`, `maps_won`, `map_win_rate`, `round_win_rate` |
| `top_players` | array | Roster for the chosen scope: `name`, `maps_played`, `rating`, `acs`, `adr`, `kast_pct`, `kills`, `deaths`, `assists`, `first_kills`, `first_deaths`, `best_agent` |
| `roster_year` | integer or null | The year shown, or null for all-time |
| `roster_years` | array of integers | Every year with roster data |
| `agent_usage` | array | Per agent: `agent`, `games_used` |
| `recent_matches` | array | Recent series, with `match_id`, `team_a`, `team_b`, `score`, `tournament`, `match_type` |
| `note` | string | Optional caveat about the data |

Errors: 404 when `team_id` does not exist.

### `GET /teams/{team_id}/map-leaders`

The standout players for one team on one map.

| Parameter | Type | Description |
|---|---|---|
| `map` | string, required | Map name, for example `Bind` |

| Field | Type | Description |
|---|---|---|
| `map` | string | Map name |
| `most_kills` | object or null | `name`, `value`, `maps_played` |
| `most_assists` | object or null | `name`, `value`, `maps_played` |
| `most_effective` | object or null | Highest average rating: `name`, `value`, `maps_played` |
| `small_sample` | boolean | True when the map has few games, so the result is less reliable |

### `GET /teams/{team_id}/radar`

A five-axis stat profile for a team: win rate, round win rate, average rating,
average ACS, and clutches per map.

| Parameter | Type | Description |
|---|---|---|
| `compare_with` | integer | A second `team_id` to overlay on the same scale |

Response: `a` and `b`. `b` is null when no comparison team is given. Each side
has `team_id`, `name`, `matches`, and `axes`. Each axis has `metric`, `label`,
`value`, `is_percentage`, `normalized` (0 to 1, scaled to the range of loaded
teams), and `out_of_range`. A side whose axes are incomplete is returned with
`normalized` set to null on the missing axes, and the frontend omits its shape.

## Players

### `GET /players/leaderboard`

Ranked players for one metric.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `metric` | string | `acs` | One of `rating`, `acs`, `adr`, `kast`, `hs` |
| `limit` | integer | 20 | 1 to 100 |
| `min_maps` | integer | 10 | Minimum maps played to qualify |

Response: `metric` and `players`. Each player has `name`, `team`, `value`
(the value for the chosen metric), `rating`, `maps`, and `best_agent` (the
agent they have performed best on, from well-sampled games).

Errors: 400 when `metric` is not one of the five values.

### `GET /players/search`

Name search for player pickers.

| Parameter | Type | Description |
|---|---|---|
| `q` | string, required | Partial player name |

Response: `players`, an array of `name`, `team`, `best_agent`.

### `GET /players/radar`

A five-axis stat profile for a player: rating, ACS, ADR, KAST%, and HS%.

| Parameter | Type | Description |
|---|---|---|
| `name` | string, required | Exact player name |
| `compare_with` | string | Exact name of a second player |

Response: `a` and `b`, with the same axis structure as the team radar, plus
`name`, `maps_played`, and `best_agent`.

Errors: 404 when a player has no loaded stats under that name.

## Statistics

### `GET /stats/overview`

League-wide figures for the Home page.

| Field | Type | Description |
|---|---|---|
| `counts` | object | `players`, `teams`, `matches`, `maps_played`, `events` |
| `season_journey` | array | Matches per phase of the season: `phase`, `matches` |
| `top_players` | array | Ranked by ACS: `name`, `team`, `acs`, `rating`, `maps`, `best_agent` |
| `team_performance` | array | Teams ranked by win rate: `team_id`, `name`, `matches`, `wins`, `win_rate` |
| `map_stats` | array | Every map: `map`, `played` |

### `GET /stats/meta`

Agent pick rates and the role split.

| Parameter | Type | Description |
|---|---|---|
| `year` | integer | Restrict to one season |
| `map` | string | Restrict to one map. Sent as `map`, read as `map_name` |

| Field | Type | Description |
|---|---|---|
| `agent_meta` | array | Per agent: `agent`, `role`, `picks`, `pick_rate` (0 to 1) |
| `role_distribution` | array | Per role: `role`, `picks`, `share` (0 to 1) |
| `available_years` | array of integers | Years available for filtering |
| `available_maps` | array of strings | Maps available for filtering |

A pick rate is the share of team and map slots in which the agent was picked.
Because each team picks independently on every map, an agent picked by every
team reaches 100 percent.

## Legacy Roster Builder

### `GET /roster-builder/simulate`

A transparent model projection of a matchup between two hypothetical
five-player lineups. It is a projection and never a factual prediction. The
response lists what the model does not account for.

| Parameter | Type | Description |
|---|---|---|
| `team_a` | string, required | Five player names, comma-separated |
| `team_b` | string, required | Five player names, comma-separated |

Response:

| Field | Type | Description |
|---|---|---|
| `lineup_a`, `lineup_b` | object | `players`, `avg_rating`, `missing_roles`, `role_penalty` |
| `win_probability_a`, `win_probability_b` | number | Model output, summing to 1 |
| `label` | string | A plain-language label for the matchup |
| `caveats` | array of strings | What is and is not accounted for |

Each player in `players` has `name`, `team`, `rating`, `primary_role`,
`primary_agent`, `best_agent`, `low_sample`, and related fields.

Errors: 400 when a name is not found in the loaded data.

## Versioning

This API has no version prefix yet. Breaking changes will be recorded in
[`CHANGELOG.md`](../CHANGELOG.md).
