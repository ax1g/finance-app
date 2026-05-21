from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, asc

from app.accounts.models import Account

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