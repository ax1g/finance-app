# app/transactions/services
from ..db import SessionDep
from transactions.schemas import TransactionCreate
from transactions.models import Transaction
from transactions.repository import TransactionRepo


class TransactionService:
    """
    This class handles business logic & dependency injection.

    """
    def __init__(self, repo: TransactionRepo):
        self.repo = repo


    async def create_transaction(self, db, txn_data: TransactionCreate):
        txn_dict = txn_data.model_dump()

        new_txn = Transaction(**txn_dict)

        # Business rules
        # e.g. validate amount, type, etc.

        return await self.repo.create(db, new_txn)