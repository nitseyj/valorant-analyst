import sqlite3
from pathlib import Path

import pytest

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "valorant.db"


@pytest.fixture(scope="session")
def db_path():
    # The combined database is gitignored (about 180MB, over GitHub's push
    # limit — see the root README for the rebuild command), so it will not
    # exist on a fresh clone until someone runs the loader. Tests that need
    # real data skip rather than fail in that case, consistent with this
    # project's rule against ever faking a statistic.
    if not DB_PATH.exists():
        pytest.skip(f"{DB_PATH} not found; run the loader described in the root README first")
    return DB_PATH


@pytest.fixture()
def conn(db_path):
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
    finally:
        connection.close()
