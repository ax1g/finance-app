import uuid
from datetime import datetime
from decimal import Decimal

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

        new_type = data.txn_type if data.txn_type is not None else old.txn_type
        new_amount = data.amount if data.amount is not None else old.amount

        type_changed = data.txn_type is not None and data.txn_type != old.txn_type
        amount_changed = data.amount is not None and data.amount != old.amount

        transaction = await self.repo.update(user_id, txn_id, data)

        if type_changed or amount_changed:
            await self._reverse_balance(user_id, old.account_id, old.txn_type, old.amount)
            await self._apply_balance(user_id, old.account_id, new_type, new_amount)

        await self.repo.db.commit()
        return transaction

    async def _reverse_balance(
        self, user_id: uuid.UUID, account_id: uuid.UUID, txn_type: TransactionType, amount: Decimal
    ) -> None:
        if txn_type == TransactionType.INCOME:
            await self.accounts_service.decrease_balance(user_id, account_id, amount)
        elif txn_type == TransactionType.EXPENSE:
            await self.accounts_service.increase_balance(user_id, account_id, amount)
        elif txn_type == TransactionType.ADJUSTMENT:
            await self.accounts_service.adjust_balance(user_id, account_id, -amount)

    async def _apply_balance(
        self, user_id: uuid.UUID, account_id: uuid.UUID, txn_type: TransactionType, amount: Decimal
    ) -> None:
        if txn_type == TransactionType.INCOME:
            await self.accounts_service.increase_balance(user_id, account_id, amount)
        elif txn_type == TransactionType.EXPENSE:
            await self.accounts_service.decrease_balance(user_id, account_id, amount)
        elif txn_type == TransactionType.ADJUSTMENT:
            await self.accounts_service.adjust_balance(user_id, account_id, amount)

    async def delete_transaction(self, user_id: uuid.UUID, txn_id: uuid.UUID):
        transaction = await self.repo.get_by_id(user_id, txn_id)

        await self.repo.delete(user_id, txn_id)

        await self._reverse_balance(user_id, transaction.account_id, transaction.txn_type, transaction.amount)

        await self.repo.db.commit()
