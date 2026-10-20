import pytest

from app.analyzers import radar_stats


def _first_team_id(conn):
    row = conn.execute("SELECT team_id FROM teams WHERE team_id IN (SELECT team_a_id FROM matches) LIMIT 1").fetchone()
    assert row is not None, "no team with a loaded match found"
    return row["team_id"]


def test_team_radar_has_five_axes(conn):
    team_id = _first_team_id(conn)
    radar = radar_stats.team_radar(conn, team_id)
    assert len(radar["axes"]) == 5


def test_team_radar_normalized_values_are_in_range(conn):
    team_id = _first_team_id(conn)
    radar = radar_stats.team_radar(conn, team_id)
    for axis in radar["axes"]:
        if axis["normalized"] is not None:
            assert 0.0 <= axis["normalized"] <= 1.0


def test_team_radar_unknown_team_id_raises_value_error(conn):
    with pytest.raises(ValueError):
        radar_stats.team_radar(conn, -1)


def test_team_radar_comparison_shares_one_set_of_bounds(conn):
    team_id = _first_team_id(conn)
    comparison = radar_stats.team_radar_comparison(conn, team_id, compare_team_id=team_id)
    # Comparing a team against itself on shared bounds must land on
    # identical normalized values for every axis.
    a_axes = comparison["a"]["axes"]
    b_axes = comparison["b"]["axes"]
    for a, b in zip(a_axes, b_axes):
        assert a["normalized"] == b["normalized"]
