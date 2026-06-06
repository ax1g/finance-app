import uuid
from datetime import datetime

from app.core.enums import TransactionType
from app.transactions.schema import TransactionCreate, TransactionUpdate
from app.transactions.repository import TransactionRepo
from app.accounts.service import AccountService
from app.categories.service import CategoryService


class TransactionService:

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

        if data.txn_type == TransactionType.TRANSFER:
            await self.accounts_service.decrease_balance(
                user_id, data.account_id, data.amount
            )
            if data.to_account_id:
                await self.accounts_service.increase_balance(
                    user_id, data.to_account_id, data.amount
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

    async def _reverse_txn(
        self, user_id: uuid.UUID, account_id: uuid.UUID, txn_type: TransactionType, amount: float, to_account_id: uuid.UUID | None = None
    ):
        if txn_type == TransactionType.INCOME:
            await self.accounts_service.decrease_balance(user_id, account_id, amount)
        elif txn_type == TransactionType.EXPENSE:
            await self.accounts_service.increase_balance(user_id, account_id, amount)
        elif txn_type == TransactionType.ADJUSTMENT:
            await self.accounts_service.adjust_balance(user_id, account_id, -amount)
        elif txn_type == TransactionType.TRANSFER:
            await self.accounts_service.increase_balance(user_id, account_id, amount)
            if to_account_id:
                await self.accounts_service.decrease_balance(user_id, to_account_id, amount)

    async def _apply_txn(
        self, user_id: uuid.UUID, account_id: uuid.UUID, txn_type: TransactionType, amount: float, to_account_id: uuid.UUID | None = None
    ):
        if txn_type == TransactionType.INCOME:
            await self.accounts_service.increase_balance(user_id, account_id, amount)
        elif txn_type == TransactionType.EXPENSE:
            await self.accounts_service.decrease_balance(user_id, account_id, amount)
        elif txn_type == TransactionType.ADJUSTMENT:
            await self.accounts_service.adjust_balance(user_id, account_id, amount)
        elif txn_type == TransactionType.TRANSFER:
            await self.accounts_service.decrease_balance(user_id, account_id, amount)
            if to_account_id:
                await self.accounts_service.increase_balance(user_id, to_account_id, amount)

    async def update_transaction(
        self, user_id: uuid.UUID, txn_id: uuid.UUID, data: TransactionUpdate
    ):
        old = await self.repo.get_by_id(user_id, txn_id)

        new_type = data.txn_type if data.txn_type is not None else old.txn_type
        new_amount = data.amount if data.amount is not None else old.amount
        new_to_id = data.to_account_id if data.to_account_id is not None else old.to_account_id

        type_changed = data.txn_type is not None and data.txn_type != old.txn_type
        amount_changed = data.amount is not None and data.amount != old.amount
        to_account_changed = data.to_account_id is not None and data.to_account_id != old.to_account_id

        if type_changed or amount_changed or to_account_changed:
            await self._reverse_txn(user_id, old.account_id, old.txn_type, old.amount, old.to_account_id)
            transaction = await self.repo.update(user_id, txn_id, data)
            await self._apply_txn(user_id, transaction.account_id, new_type, new_amount, new_to_id)
        else:
            transaction = await self.repo.update(user_id, txn_id, data)

        await self.repo.db.commit()
        return transaction

    async def delete_transaction(self, user_id: uuid.UUID, txn_id: uuid.UUID):
        transaction = await self.repo.get_by_id(user_id, txn_id)

        if transaction.txn_type == TransactionType.TRANSFER and transaction.to_account_id:
            await self.accounts_service.increase_balance(
                user_id, transaction.account_id, transaction.amount
            )
            await self.accounts_service.decrease_balance(
                user_id, transaction.to_account_id, transaction.amount
            )
        elif transaction.txn_type == TransactionType.INCOME:
            await self.accounts_service.decrease_balance(
                user_id, transaction.account_id, transaction.amount
            )
        elif transaction.txn_type == TransactionType.EXPENSE:
            await self.accounts_service.increase_balance(
                user_id, transaction.account_id, transaction.amount
            )
        elif transaction.txn_type == TransactionType.ADJUSTMENT:
            await self.accounts_service.adjust_balance(
                user_id, transaction.account_id, -transaction.amount
            )

        await self.repo.delete(user_id, txn_id)
        await self.repo.db.commit()
