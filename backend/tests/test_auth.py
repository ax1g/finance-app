
import pytest
from httpx import AsyncClient



@pytest.fixture
def _override_db_for_auth(override_db):
    pass


class TestAuth:
    async def test_login_missing_fields(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/login")
        assert resp.status_code == 422

    async def test_signup_validation(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/signup", json={})
        assert resp.status_code == 422

    async def test_forgot_password_validates_email(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/forgot-password", json={"email": "not-an-email"})
        assert resp.status_code == 422
