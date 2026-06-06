from app.core.config import settings


def test_database_url_is_set():
    url = settings.DATABASE_URL
    assert url is not None
    assert "postgres" in url
