from app.analyzers.match_timeline import _parse_k


def test_parse_k_suffix():
    assert _parse_k("3.8k") == 3800


def test_parse_k_whole_thousands():
    assert _parse_k("18.0k") == 18000


def test_parse_k_plain_number():
    assert _parse_k("250") == 250


def test_parse_k_none_is_none():
    assert _parse_k(None) is None


def test_parse_k_unparseable_is_none():
    # A single bad value should never raise, since one malformed row
    # shouldn't break an entire timeline chart.
    assert _parse_k("not a number") is None
