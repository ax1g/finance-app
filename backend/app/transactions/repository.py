# app/transactions/repository
from datetime import datetime

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.transactions.models import Transaction
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
        # stmt = select(Transaction).limit(limit).offset(offset)
        # result = await self.db.execute(stmt)
        # return result.scalars().all()
        query = select(Transaction)

        # Dynamically apply filters if they are passed
        if txn_type:
            query = query.where(Transaction.txn_type == txn_type)

        if start:
            query = query.where(Transaction.txn_date >= start)
        
        if end:
            query = query.where(Transaction.txn_date <= end)

        #  CRITICAL: Sort before paginating
        # desc() ensures newest transactions are at the top
        query = query.order_by(desc(Transaction.txn_date))

        # Apply pagination last
        query = query.offset(offset).limit(limit)

        result = await self.db.execute(query)
        return result.scalars().all()


    async def get_by_id(self, txn_id: int):
        return await self.db.get(Transaction, txn_id)

    async def update(self, txn_id: int, data: dict):
        db_transaction = await self.db.get(Transaction, txn_id)

        if not db_transaction:
            return None

        for key, value in data.items():
            setattr(db_transaction, key, value)

        await self.db.commit()
        await self.db.refresh(db_transaction)
        return db_transaction

    async def delete(self, txn_id: int):
        txn = await self.db.get(Transaction, txn_id)

        if not txn:
            return None

        await self.db.delete(txn)
        await self.db.commit()
        return txn

    # async def get_by_date_range(
    #     self, limit: int, offset: int, start: datetime, end: datetime
    # ):
    #     stmt = (
    #         select(Transaction)
    #         .where(Transaction.txn_date.between(start, end))
    #         .limit(limit)
    #         .offset(offset)
    #     )
    #     result = await self.db.execute(stmt)
    #     return result.scalars().all()

    # async def filter_by_type(self, limit: int, offset: int, txn_type: TransactionType):
    #     stmt = select(Transaction).where(Transaction.txn_type == txn_type).limit(limit).offset(offset)
    #     result = await self.db.execute(stmt)
    #     return result.scalars().all()