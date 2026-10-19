import pytest

from app.analyzers import match_verdict


def _first_match_id(conn):
    row = conn.execute("SELECT match_id FROM matches ORDER BY match_id LIMIT 1").fetchone()
    assert row is not None, "the loaded database has no matches at all"
    return row["match_id"]


def test_impact_label_thresholds():
    assert match_verdict._impact_label(0.75) == "HIGH IMPACT"
    assert match_verdict._impact_label(0.45) == "MODERATE"
    assert match_verdict._impact_label(0.1) == "LOW"


def test_build_verdict_ranks_factors_by_descending_impact(conn):
    verdict = match_verdict.build_verdict(conn, _first_match_id(conn))
    impacts = [f["impact"] for f in verdict["ranked_factors"]]
    assert impacts == sorted(impacts, reverse=True)


def test_build_verdict_primary_factor_matches_the_top_ranked_one(conn):
    verdict = match_verdict.build_verdict(conn, _first_match_id(conn))
    top = verdict["ranked_factors"][0]
    assert verdict["primary_factor"]["category"] == top["category"]
    assert verdict["primary_factor"]["impact_label"] == top["impact_label"]


def test_build_verdict_impact_scores_are_normalised(conn):
    verdict = match_verdict.build_verdict(conn, _first_match_id(conn))
    for factor in verdict["ranked_factors"]:
        assert 0.0 <= factor["impact"] <= 1.0


def test_build_verdict_winner_is_one_of_the_two_teams(conn):
    verdict = match_verdict.build_verdict(conn, _first_match_id(conn))
    assert verdict["winner"] in (verdict["team_a"], verdict["team_b"])


def test_build_verdict_unknown_match_id_raises_value_error(conn):
    with pytest.raises(ValueError):
        match_verdict.build_verdict(conn, -1)
