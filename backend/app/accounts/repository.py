import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc

from app.accounts.model import Account


class AccountRepo:
    """
    Handles direct database operations using an injected session.
    """

    def __init__(self, db: AsyncSession):
        self.db = db


    async def create(self, account: Account):
        self.db.add(account)
        await self.db.commit()
        await self.db.refresh(account)
        return account
    

    async def get_accounts(self):
        query = select(Account).order_by(asc(Account.name))
        result = await self.db.execute(query)
        return result.scalars().all()
    

    async def get_by_id(self, account_id: uuid.UUID):
        return await self.db.get(Account, account_id)


    async def update(self, account_id: uuid.UUID, data: dict):
        db_account = await self.db.get(Account, account_id)

        if not db_account:
            return None

        for key,value in data.items():
            setattr(db_account, key, value)

        await self.db.commit()
        await self.db.refresh(db_account)
        return db_account
    

    async def delete(self, account_id: uuid.UUID):
        account = await self.db.get(Account, account_id)

        if not account:
            return None

        await self.db.delete(account)
        await self.db.commit()
        return account