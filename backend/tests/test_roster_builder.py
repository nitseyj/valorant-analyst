import pytest

from app.analyzers import roster_builder

# Real players, loaded in the dataset (also the Legacy Builder's own
# frontend defaults, see frontend/web/src/pages/LegacyBuilder.jsx).
TEAM_A = ["aspas", "Jinggg", "f0rsakeN", "Chronicle", "Boaster"]
TEAM_B = ["zekken", "Derke", "yay", "johnqt", "Sayf"]


def test_search_players_matches_a_substring(conn):
    # "asp" alone matches thousands of players across the full dataset and
    # fills the default 8-result limit before reaching "aspas" alphabetically
    # - a narrower substring keeps this test meaningful rather than flaky.
    results = roster_builder.search_players(conn, "spas")
    assert any(p["name"] == "aspas" for p in results)


def test_search_players_too_short_query_returns_nothing(conn):
    assert roster_builder.search_players(conn, "a") == []


def test_build_lineup_returns_five_players_with_an_average_rating(conn):
    lineup = roster_builder.build_lineup(conn, TEAM_A)
    assert len(lineup["players"]) == 5
    assert lineup["avg_rating"] is not None


def test_simulate_win_probabilities_sum_to_one(conn):
    result = roster_builder.simulate(conn, TEAM_A, TEAM_B)
    assert round(result["win_probability_a"] + result["win_probability_b"], 3) == 1.0


def test_simulate_unresolvable_players_raises_value_error(conn):
    with pytest.raises(ValueError):
        roster_builder.simulate(conn, ["Not A Real Player"] * 5, TEAM_B)
