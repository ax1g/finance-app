from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.core.database import get_db
from app.core.dependencies import get_current_user


@pytest.fixture
def mock_session():
    session = AsyncMock(spec=AsyncSession)
    session.add = MagicMock()
    return session


@pytest.fixture
def override_db(mock_session):
    async def _get_test_db():
        yield mock_session
    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def fake_user():
    return type("FakeUser", (), {
        "id": "00000000-0000-0000-0000-000000000001",
        "username": "testuser",
        "email": "test@example.com",
    })()


@pytest.fixture
def override_auth(fake_user):
    async def _fake_auth():
        return fake_user
    app.dependency_overrides[get_current_user] = _fake_auth
    yield
    app.dependency_overrides.clear()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_client(client, override_auth):
    return client
