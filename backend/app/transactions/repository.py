# app/transactions/repository
from sqlalchemy import select

from app.transactions.models import Transaction


class TransactionRepo:
    """
    This repository handles database.
    """

    async def create(self, db, transaction: Transaction):
        db.add(transaction)
        await db.commit()
        await db.refresh(transaction)
        return transaction

    async def get_all(self, db):
        stmt = select(Transaction)
        result = await db.execute(stmt)
        transactions = result.scalars().all()
        return transactions

    async def get_by_id(self, db, txn_id: int):
        return await db.get(Transaction, txn_id)

    async def update(self, db, txn_id: int, data: dict):
        db_transaction = await db.get(Transaction, txn_id)

        if not db_transaction:
            return None

        for key, value in data.items():
            setattr(db_transaction, key, value)

        await db.commit()
        await db.refresh(db_transaction)
        return db_transaction

    async def delete(self, db, txn_id: int):
        txn = await db.get(Transaction, txn_id)

        if not txn:
            return None

        await db.delete(txn)
        await db.commit()
        return txn
