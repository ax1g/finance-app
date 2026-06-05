import pytest

from app.core.security import create_access_token, decode_access_token
from app.core.exceptions import AuthenticationError


class TestSecurity:
    def test_create_and_decode_token(self):
        token = create_access_token(subject="testuser")
        payload = decode_access_token(token)
        assert payload["sub"] == "testuser"
        assert payload["purpose"] == "auth"

    def test_token_purpose_defaults_to_auth(self):
        token = create_access_token(subject="testuser")
        payload = decode_access_token(token)
        assert payload["purpose"] == "auth"

    def test_password_reset_token_has_different_purpose(self):
        token = create_access_token(subject="test@example.com", purpose="password_reset")
        payload = decode_access_token(token)
        assert payload["purpose"] == "password_reset"

    def test_invalid_token_raises(self):
        with pytest.raises(AuthenticationError):
            decode_access_token("invalid.token.here")
