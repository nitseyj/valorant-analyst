from app.analyzers import overview_stats


def test_overview_counts_are_all_positive(conn):
    counts = overview_stats.overview_counts(conn)
    for key in ("players", "teams", "matches", "maps_played", "events"):
        assert counts[key] > 0, f"{key} should be positive on a loaded database"


def test_top_players_respects_the_limit(conn):
    players = overview_stats.top_players(conn, limit=3)
    assert len(players) <= 3


def test_players_leaderboard_sorted_by_requested_metric_descending(conn):
    players = overview_stats.players_leaderboard(conn, metric="rating", limit=10)
    values = [p["value"] for p in players]
    assert values == sorted(values, reverse=True)


def test_map_stats_only_includes_maps_meeting_the_minimum(conn):
    min_played = 20
    for m in overview_stats.map_stats(conn, min_played=min_played):
        assert m["played"] >= min_played


def test_build_overview_includes_counts_and_top_players(conn):
    data = overview_stats.build_overview(conn)
    assert "counts" in data
    assert "top_players" in data
