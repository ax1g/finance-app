import uuid
from datetime import datetime

from app.core.enums import TransactionType
from app.transactions.schema import TransactionCreate, TransactionUpdate
from app.transactions.repository import TransactionRepo
from app.accounts.service import AccountService
from app.categories.service import CategoryService


class TransactionService:
    """
    Handles Business & specialize field logic.
    """

    def __init__(
        self,
        repo: TransactionRepo,
        accounts_service: AccountService,
        category_service: CategoryService,
    ):
        self.repo = repo
        self.accounts_service = accounts_service
        self.category_service = category_service

    async def create_transaction(self, user_id: uuid.UUID, data: TransactionCreate):
        transaction = await self.repo.create(user_id, data)

        if data.txn_type == TransactionType.EXPENSE:
            await self.accounts_service.decrease_balance(
                user_id, data.account_id, data.amount
            )

        if data.txn_type == TransactionType.INCOME:
            await self.accounts_service.increase_balance(
                user_id, data.account_id, data.amount
            )

        await self.repo.db.commit()
        return transaction

    async def get_transactions(
        self,
        user_id: uuid.UUID,
        limit: int,
        offset: int,
        txn_type: TransactionType | None,
        start: datetime | None,
        end: datetime | None,
    ):
        return await self.repo.get_transactions(
            user_id, limit, offset, txn_type, start, end
        )

    async def get_transaction_by_id(self, user_id: uuid.UUID, txn_id: uuid.UUID):
        return await self.repo.get_by_id(user_id, txn_id)

    async def update_transaction(
        self, user_id: uuid.UUID, txn_id: uuid.UUID, data: TransactionUpdate
    ):
        old = await self.repo.get_by_id(user_id, txn_id)
        was_adjustment = old.txn_type == TransactionType.ADJUSTMENT

        transaction = await self.repo.update(user_id, txn_id, data)

        if was_adjustment and data.amount is not None:
            delta = data.amount - old.amount
            if delta != 0:
                await self.accounts_service.adjust_balance(
                    user_id, old.account_id, delta
                )

        await self.repo.db.commit()
        return transaction

    async def delete_transaction(self, user_id: uuid.UUID, txn_id: uuid.UUID):
        transaction = await self.repo.get_by_id(user_id, txn_id)

        await self.repo.delete(user_id, txn_id)

        if transaction.txn_type == TransactionType.ADJUSTMENT:
            await self.accounts_service.adjust_balance(
                user_id, transaction.account_id, -transaction.amount
            )

        await self.repo.db.commit()
