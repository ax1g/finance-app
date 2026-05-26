import uuid
from datetime import datetime

from sqlalchemy import select, desc, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.transactions.model import Transaction
from app.core.enums import TransactionType


class TransactionRepo:
    """
    Handles direct database operations using an injected session.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, transaction: Transaction):
        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction

    async def get_transactions(
            self, 
            limit: int, 
            offset: int, 
            txn_type: TransactionType | None = None,
            start: datetime | None = None,
            end: datetime | None = None
    ):
        query = select(Transaction)

        # Dynamically apply filters if they are passed
        if txn_type:
            query = query.where(Transaction.txn_type == txn_type)
        if start:
            query = query.where(Transaction.txn_date >= start)
        if end:
            query = query.where(Transaction.txn_date <= end)

        # Order by newest first, then paginate
        query = query.order_by(desc(Transaction.txn_date)).offset(offset).limit(limit)

        result = await self.db.execute(query)
        return result.scalars().all()


    async def get_by_id(self, txn_id: uuid.UUID):
        return await self.db.get(Transaction, txn_id)

    async def update(self, txn_id: uuid.UUID, data: dict):
        db_transaction = await self.db.get(Transaction, txn_id)

        if not db_transaction:
            return None

        for key, value in data.items():
            setattr(db_transaction, key, value)

        await self.db.commit()
        await self.db.refresh(db_transaction)
        return db_transaction

    async def delete(self, txn_id: uuid.UUID) -> bool:
        stmt = delete(Transaction).where(Transaction.id == txn_id)
        result = await self.db.execute(stmt)
        return result.rowcount > 0          # type: ignore


    