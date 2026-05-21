# app/transactions/services
from app.transactions.schemas import TransactionCreate, TransactionUpdate
from app.transactions.models import Transaction
from app.transactions.repository import TransactionRepo


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
    

    async def get_all_transactions(self, db):
        return await self.repo.get_all(db)

    async def get_transaction_by_id(self, db, txn_id: int):
        return await self.repo.get_by_id(db,txn_id)
    
    async def update_transaction(self,db, txn_id: int, data: TransactionUpdate):
        return await self.repo.update(db, txn_id, data.model_dump(exclude_unset=True))
    
    async def delete_transaction(self, db, txn_id):
        return await self.repo.delete(db, txn_id)