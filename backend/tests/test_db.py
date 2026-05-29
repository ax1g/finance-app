import os


def test_database_url_is_set():
    db_url = os.getenv("DATABASE_URL")
    assert db_url is not None
    assert "postgres" in db_url
