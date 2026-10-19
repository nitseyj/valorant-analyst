from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    # Liveness only: this must return 200 whether or not the (gitignored,
    # locally-built) database happens to be present on this machine.
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] in ("ok", "degraded")


def test_matches_list_returns_a_total_and_a_page(db_path):
    res = client.get("/matches?limit=5")
    assert res.status_code == 200
    body = res.json()
    assert body["total"] >= len(body["matches"])
    assert len(body["matches"]) <= 5


def test_unknown_match_verdict_is_404(db_path):
    res = client.get("/matches/999999999/verdict")
    assert res.status_code == 404


def test_games_verdict_endpoint_was_removed():
    # Dropped as a dead endpoint (never called from the frontend). The
    # framework's own routing 404 ("Not Found" with no app-level detail)
    # confirms the route itself is gone, not that game 1 just wasn't found.
    res = client.get("/games/1/verdict")
    assert res.status_code == 404
    assert res.json() == {"detail": "Not Found"}


def test_cors_allows_the_frontend_dev_origin():
    res = client.get("/health", headers={"Origin": "http://localhost:5173"})
    assert res.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_rejects_an_arbitrary_origin():
    # Regression guard for allow_origins=["*"]: an unrelated site's browser
    # JavaScript must not be able to read this API's responses.
    res = client.get("/health", headers={"Origin": "http://evil.example.com"})
    assert res.status_code == 200  # the request itself still succeeds server-side
    assert "access-control-allow-origin" not in res.headers
