import pytest

from app.analyzers import agent_analysis, clutch_analysis, economy_analysis, opening_duels, player_impact, side_performance

# These six are the ones match_verdict.ANALYZERS actually calls, and they
# all share one return contract (see match_verdict.py's RankedFactor). One
# parametrized test here covers all six, instead of six near-identical files.
ANALYZER_MODULES = [agent_analysis, clutch_analysis, economy_analysis, opening_duels, player_impact, side_performance]


def _first_match_id(conn):
    row = conn.execute("SELECT match_id FROM matches ORDER BY match_id LIMIT 1").fetchone()
    assert row is not None, "the loaded database has no matches at all"
    return row["match_id"]


@pytest.mark.parametrize("module", ANALYZER_MODULES, ids=lambda m: m.__name__.rsplit(".", 1)[-1])
def test_analyze_match_returns_the_shared_contract(conn, module):
    match_id = _first_match_id(conn)
    try:
        result = module.analyze_match(conn, match_id)
    except ValueError:
        pytest.skip(f"{module.__name__}: no usable data for match_id {match_id}")
    assert isinstance(result["category"], str) and result["category"]
    assert isinstance(result["summary"], str) and result["summary"]
    assert 0.0 <= result["impact"] <= 1.0
    assert result["winner"] is None or isinstance(result["winner"], str)
    assert isinstance(result["evidence"], list)


@pytest.mark.parametrize("module", ANALYZER_MODULES, ids=lambda m: m.__name__.rsplit(".", 1)[-1])
def test_analyze_match_unknown_match_id_raises_value_error(conn, module):
    with pytest.raises(ValueError):
        module.analyze_match(conn, -1)
