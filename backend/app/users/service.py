import uuid
import secrets
import hashlib
import logging
from datetime import datetime, timedelta, timezone

from fastapi import BackgroundTasks

from app.users.repository import UserRepo
from app.users.token_repo import UserTokenRepo
from app.users.schema import UserCreate, UserUpdate
from app.users.token_model import UserToken
from app.users.model import User
from app.categories.model import Category
from app.categories.defaults import DEFAULT_CATEGORIES
from app.core.security import get_password_hash, verify_password
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.enums import TokenPurpose
from app.core.email import send_email
from app.core.config import settings

logger = logging.getLogger(__name__)


def _safe_send_email(to: str, subject: str, body: str) -> None:
    try:
        send_email(to, subject, body)
    except Exception:
        logger.exception("Failed to send email to %s", to)


def _generate_token() -> tuple[str, str]:
    raw = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, token_hash


class UserService:
    """
    Handles business logic of the user model.
    """

    def __init__(self, repo: UserRepo, token_repo: UserTokenRepo):
        self.repo = repo
        self.token_repo = token_repo

    async def create_user(self, user_data: UserCreate, bg: BackgroundTasks):
        user_dict = user_data.model_dump()
        plain_password = user_dict.pop("password")
        user_dict["hashed_password"] = get_password_hash(plain_password)
        new_user = User(**user_dict)

        user = await self.repo.create(new_user)

        for cat in DEFAULT_CATEGORIES:
            category = Category(
                name=cat["name"],
                type=cat["type"],
                icon=cat.get("icon"),
                description=cat.get("description"),
                sort_order=cat.get("sort_order", 0),
                user_id=user.id,
            )
            self.repo.db.add(category)

        await self._send_verification_email(user, bg)

        await self.repo.db.commit()
        return user

    async def authenticate_user(self, username: str, password: str) -> User | None:
        lookup = username.lower()
        user = await self.repo.get_by_username(lookup)
        if not user:
            user = await self.repo.get_by_email(lookup)

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    async def get_users(self, is_superuser: bool):
        if not is_superuser:
            raise AuthorizationError("Not authorized: superuser privileges required.")
        return await self.repo.get_users()

    async def get_user_by_id(self, user_id: uuid.UUID):
        return await self.repo.get_by_id(user_id)

    async def get_user_by_username(self, username: str):
        return await self.repo.get_by_username(username)

    async def update_user(self, user_id: uuid.UUID, data: UserUpdate):
        user = await self.repo.update(user_id, data.model_dump(exclude_unset=True))
        await self.repo.db.commit()
        return user

    async def change_password(
        self, user_id: uuid.UUID, current_password: str, new_password: str
    ):
        user = await self.repo.get_by_id(user_id)
        if not verify_password(current_password, user.hashed_password):
            raise AuthenticationError("Current password is incorrect.")
        hashed = get_password_hash(new_password)
        await self.repo.update(user_id, {"hashed_password": hashed})
        await self.repo.db.commit()

    async def forgot_password(self, email: str, bg: BackgroundTasks) -> str | None:
        user = await self.repo.get_by_email(email)
        if not user:
            return None

        await self.token_repo.invalidate_pending(user.id, TokenPurpose.PASSWORD_RESET)

        raw, token_hash = _generate_token()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        db_token = UserToken(
            token_hash=token_hash,
            purpose=TokenPurpose.PASSWORD_RESET,
            expires_at=expires_at,
            user_id=user.id,
        )
        await self.token_repo.create(db_token)

        link = f"{settings.FRONTEND_URL}/reset-password?token={raw}"
        bg.add_task(
            send_email,
            user.email,
            "Reset your Neco password",
            f"Click the link to reset your password:\n\n{link}\n\nThis link expires in 1 hour.",
        )
        return raw

    async def reset_password(self, token: str, new_password: str) -> None:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        db_token = await self.token_repo.get_valid(
            token_hash, TokenPurpose.PASSWORD_RESET
        )
        if not db_token:
            raise AuthenticationError("Invalid or expired reset token.")

        hashed = get_password_hash(new_password)
        await self.repo.update(db_token.user_id, {"hashed_password": hashed})
        await self.token_repo.mark_used(db_token)
        await self.repo.db.commit()

    async def verify_email(self, token: str) -> None:
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        db_token = await self.token_repo.get_valid(
            token_hash, TokenPurpose.EMAIL_VERIFICATION
        )
        if not db_token:
            raise AuthenticationError("Invalid or expired verification token.")

        await self.repo.update(db_token.user_id, {"is_verified": True})
        await self.token_repo.mark_used(db_token)
        await self.repo.db.commit()

    async def resend_verification(self, user_id: uuid.UUID, bg: BackgroundTasks) -> None:
        user = await self.repo.get_by_id(user_id)
        if user.is_verified:
            return

        await self.token_repo.invalidate_pending(
            user_id, TokenPurpose.EMAIL_VERIFICATION
        )
        await self._send_verification_email(user, bg)
        await self.repo.db.commit()

    async def _send_verification_email(
        self, user: User, bg: BackgroundTasks
    ) -> None:
        raw, token_hash = _generate_token()
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
        db_token = UserToken(
            token_hash=token_hash,
            purpose=TokenPurpose.EMAIL_VERIFICATION,
            expires_at=expires_at,
            user_id=user.id,
        )
        await self.token_repo.create(db_token)

        link = f"{settings.FRONTEND_URL}/verify-email?token={raw}"
        bg.add_task(
            send_email,
            user.email,
            "Verify your Neco email",
            f"Click the link to verify your email:\n\n{link}\n\nThis link expires in 24 hours.",
        )

    async def delete_user(self, user_id):
        user = await self.repo.delete(user_id)
        await self.repo.db.commit()
        return user
