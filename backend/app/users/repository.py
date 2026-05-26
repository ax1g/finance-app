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


    async def get_users(self) -> list[User]:
        query = select(User).order_by(asc(User.username))
        result = await self.db.execute(query)
        return list(result.scalars().all())


    async def get_user_by_id(self, user_id: uuid.UUID):
        return await self.db.get(User, user_id)
    

    async def update(self, user_id: uuid.UUID, data:dict):
        user = await self.db.get(User, user_id)

        if not user:
            return None
        
        for key,value in data.items():
            setattr(user, key,value)

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