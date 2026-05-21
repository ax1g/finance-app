# app/transactions/services
from datetime import datetime

from app.transactions.schemas import TransactionCreate, TransactionUpdate
from app.transactions.models import Transaction
from app.transactions.repository import TransactionRepo


class TransactionService:
    """
    This class handles business logic & dependency injection.
    """

    def __init__(self, repo: TransactionRepo):
        self.repo = repo

    async def create_transaction(self, txn_data: TransactionCreate):
        txn_dict = txn_data.model_dump()

        new_txn = Transaction(**txn_dict)

        # Business rules
        # e.g. validate amount, type, etc.

        return await self.repo.create(new_txn)

    async def get_all_transactions(self, limit: int, offset: int):
        return await self.repo.get_all(limit, offset)

    async def get_transaction_by_id(self, txn_id: int):
        return await self.repo.get_by_id(txn_id)

    async def update_transaction(self, txn_id: int, data: TransactionUpdate):
        return await self.repo.update(txn_id, data.model_dump(exclude_unset=True))

    async def delete_transaction(self, txn_id):
        return await self.repo.delete(txn_id)

    async def get_transactions_by_date_range(
        self, limit: int, offset: int, start: datetime, end: datetime
    ):
        return await self.repo.get_by_date_range(limit, offset, start, end)
