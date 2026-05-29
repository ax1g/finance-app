import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc

from app.users.model import User


class UserRepo:
    """
    Handles direct database operations
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, user: User):
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_users(self, is_superuser) -> list[User]:

        if is_superuser:
            query = select(User).order_by(asc(User.username))
            result = await self.db.execute(query)
            return list(result.scalars().all())
        else:
            raise Exception("Not Authorized: Need Super User Privilages")

    async def get_by_id(self, user_id: uuid.UUID):
        return await self.db.get(User, user_id)

    async def get_by_username(self, username: str):
        query = select(User).where(User.username == username)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_by_email(self, email: str):
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def update(self, user_id: uuid.UUID, data: dict):
        user = await self.db.get(User, user_id)

        if not user:
            return None

        for key, value in data.items():
            setattr(user, key, value)

        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: uuid.UUID):
        user = await self.db.get(User, user_id)

        if not user:
            return None

        await self.db.delete(user)
        await self.db.commit()
        return user
