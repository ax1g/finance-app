import uuid
from datetime import datetime

from app.core.enums import TransactionType
from app.transactions.schema import TransactionCreate, TransactionUpdate
from app.transactions.model import Transaction
from app.transactions.repository import TransactionRepo
from app.accounts.service import AccountService
from app.categories.service import CategoryService

class TransactionService:
    """
        Handles Business & specialize field logic.
    """

    def __init__(self, repo: TransactionRepo, accounts_service: AccountService, category_service: CategoryService):
        self.repo = repo
        self.accounts_service = accounts_service
        self.category_service = category_service


    async def create_transaction(self, txn: TransactionCreate):

        # validating if accounts exists, raises an exception if not found
        await self.accounts_service.get_account_by_id(txn.account_id) 

        # validating if category exists too
        await self.category_service.get_category_by_id(txn.category_id)

        # validating if enough balance in the accounts 
        if txn.txn_type == TransactionType.EXPENSE:
            account_balance = await self.repo.get_balance_by_account(txn.user_id, txn.account_id)

            if txn.amount > account_balance:
                raise ValueError("Insufficient funds in the account.")
        

        # Map dict to model
        txn_dict = txn.model_dump()
        new_txn = Transaction(**txn_dict)

        return await self.repo.create(new_txn)

    async def get_transactions(self, limit: int, offset: int, txn_type: TransactionType | None, start: datetime | None, end: datetime| None):
        return await self.repo.get_transactions(limit, offset, txn_type, start,end)

    async def get_transaction_by_id(self, txn_id: uuid.UUID):
        return await self.repo.get_by_id(txn_id)

    async def update_transaction(self, txn_id: uuid.UUID, data: TransactionUpdate):
        return await self.repo.update(txn_id, data.model_dump(exclude_unset=True))

    async def delete_transaction(self, txn_id):
        return await self.repo.delete(txn_id)
    