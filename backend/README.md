# FastAPI wrapper — setup & test

This could not be run/tested in the sandbox that built it (no internet
access there to `pip install fastapi uvicorn`). The import wiring and every
endpoint's underlying SQL/logic WAS verified directly against the real
database — see the conversation for those results — but the actual HTTP
layer (routing, query param parsing, response serialization) needs to be
tested for the first time on your machine.

## Setup

    pip install fastapi "uvicorn[standard]"
    cd backend
    uvicorn app.main:app --reload

Then open http://127.0.0.1:8000/docs — FastAPI auto-generates interactive
API docs from the code, nothing extra needed for that.

## Quick test (once the server is running)

    curl http://127.0.0.1:8000/health
    curl "http://127.0.0.1:8000/matches?team=Paper+Rex&limit=3"
    curl http://127.0.0.1:8000/matches/542195
    curl http://127.0.0.1:8000/matches/542195/verdict
    curl http://127.0.0.1:8000/games/233397/verdict

Expected: /matches/542195/verdict should return Paper Rex as the winner
with "Player Impact" as the primary_factor, HIGH IMPACT — matches what the
script version (match_verdict.py run standalone) already produced.

## If something breaks

Most likely failure point: the database path. main.py defaults to
backend/data/valorant_test_2025.db (relative to main.py's own location).
If your DB is somewhere else, either move it there or run with:

    VALORANT_DB_PATH=/full/path/to/your.db uvicorn app.main:app --reload

Second most likely: import errors if backend/app/__init__.py or
backend/app/analyzers/__init__.py got lost in transit — both must exist
(can be empty) for `from app.analyzers import match_verdict` to work.
