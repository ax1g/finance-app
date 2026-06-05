import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy import select, asc, func

from app.users.model import User
from app.core.exceptions import RepositoryError, ResourceNotFoundError, ConflictError


class UserRepo:
    """
    Handles direct database operations
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, user: User):
        try:
            self.db.add(user)
            await self.db.flush()
            await self.db.refresh(user)
            return user
        except IntegrityError as e:
            await self.db.rollback()
            raise ConflictError(f"User already exists: {str(e.orig)}") from e
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_users(self) -> list[User]:
        try:
            query = select(User).order_by(asc(User.username))
            result = await self.db.execute(query)
            return list(result.scalars().all())
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_by_id(self, user_id: uuid.UUID):
        try:
            user = await self.db.get(User, user_id)
            if not user:
                raise ResourceNotFoundError(f"User {user_id} not found")
            return user
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_by_username(self, username: str):
        try:
            query = select(User).where(func.lower(User.username) == username.lower())
            result = await self.db.execute(query)
            return result.scalars().first()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_by_email(self, email: str):
        try:
            query = select(User).where(func.lower(User.email) == email.lower())
            result = await self.db.execute(query)
            return result.scalars().first()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def update(self, user_id: uuid.UUID, data: dict):
        try:
            user = await self.db.get(User, user_id)
            if not user:
                raise ResourceNotFoundError(f"User {user_id} not found")

            for key, value in data.items():
                setattr(user, key, value)

            await self.db.flush()
            await self.db.refresh(user)
            return user
        except IntegrityError as e:
            await self.db.rollback()
            raise ConflictError(f"User update conflict: {str(e.orig)}") from e
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def delete(self, user_id: uuid.UUID):
        try:
            user = await self.db.get(User, user_id)
            if not user:
                raise ResourceNotFoundError(f"User {user_id} not found")

            await self.db.delete(user)
            await self.db.flush()
            return user
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e
