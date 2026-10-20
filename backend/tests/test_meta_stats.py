from app.analyzers import meta_stats


def test_agent_meta_pick_rates_are_fractions(conn):
    agents = meta_stats.agent_meta(conn)
    assert agents, "no agent pick data loaded"
    for a in agents:
        assert 0.0 <= a["pick_rate"] <= 1.0
        assert a["picks"] >= 0


def test_agent_meta_sorted_by_pick_rate_descending(conn):
    agents = meta_stats.agent_meta(conn)
    picks = [a["picks"] for a in agents]
    assert picks == sorted(picks, reverse=True)


def test_available_years_and_maps_are_non_empty(conn):
    assert meta_stats.available_years(conn)
    assert meta_stats.available_maps(conn)


def test_build_meta_includes_filter_options_and_agent_meta(conn):
    data = meta_stats.build_meta(conn)
    assert "agent_meta" in data
    assert "available_years" in data
    assert "available_maps" in data


def test_agent_meta_empty_for_a_map_with_no_data(conn):
    assert meta_stats.agent_meta(conn, map_name="Not A Real Map") == []
