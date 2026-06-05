import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func

from app.users.token_model import UserToken
from app.core.enums import TokenPurpose
from app.core.exceptions import RepositoryError


class UserTokenRepo:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, token: UserToken) -> UserToken:
        try:
            self.db.add(token)
            await self.db.flush()
            await self.db.refresh(token)
            return token
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_valid(
        self, token_hash: str, purpose: TokenPurpose
    ) -> UserToken | None:
        try:
            query = (
                select(UserToken)
                .where(UserToken.token_hash == token_hash)
                .where(UserToken.purpose == purpose)
                .where(UserToken.used_at.is_(None))
                .where(UserToken.expires_at > func.now())
            )
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def mark_used(self, token: UserToken) -> None:
        try:
            token.used_at = datetime.now()
            await self.db.flush()
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def invalidate_pending(
        self, user_id: uuid.UUID, purpose: TokenPurpose
    ) -> None:
        try:
            query = (
                select(UserToken)
                .where(UserToken.user_id == user_id)
                .where(UserToken.purpose == purpose)
                .where(UserToken.used_at.is_(None))
            )
            result = await self.db.execute(query)
            for token in result.scalars().all():
                token.used_at = datetime.now()
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e
