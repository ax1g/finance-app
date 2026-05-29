import os
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


class test_database_connection:
    """
    A simple test to ensure the app starts and can see the
    DATABASE_URL provided by GitHub Actions.
    """

    db_url = os.getenv("DATABASE_URL")
    assert db_url is not None
    assert "postgres" in db_url
