# app/transactions/repository
from transactions.models import Transaction


class TransactionRepo:
    """
    This repository handles database.
    """

    async def create(self,db, transaction: Transaction):
        db.add(transaction)
        await db.commit()
        await db.refresh(transaction)
        return transaction