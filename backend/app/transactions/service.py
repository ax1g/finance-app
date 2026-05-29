import uuid
from datetime import datetime
import logging

from fastapi import HTTPException

from app.core.enums import TransactionType
from app.transactions.schema import TransactionCreate, TransactionUpdate
from app.transactions.exceptions import (
    TransactionCreateError,
    RepositoryError,
    ResourceNotFoundError,
)
from app.transactions.repository import TransactionRepo
from app.accounts.service import AccountService
from app.categories.service import CategoryService


logger = logging.getLogger(__name__)


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
        try:
            transaction = await self.repo.create(user_id, data)

            # TODO: Business logic: if accounts & categories exist

            # validating if enough balance
            # if data.txn_type == TransactionType.EXPENSE:
            #     current_balance = await self.repo.get_balance_by_account(
            #         data.user_id, data.account_id
            #     )

            #     if data.amount > current_balance:
            #         raise ValueError("Insufficient funds in the accounts.")

            await self.repo.db.commit()  # final commit
            return transaction
        except TransactionCreateError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except RepositoryError as e:
            logger.error(f"Transaction creation failed for user {user_id}: {e}")

            raise HTTPException(
                status_code=500,
                detail="An error occurred while creating transaction.",
            )

    async def get_transactions(
        self,
        user_id: uuid.UUID,
        limit: int,
        offset: int,
        txn_type: TransactionType | None,
        start: datetime | None,
        end: datetime | None,
    ):
        try:
            transactions = await self.repo.get_transactions(
                user_id, limit, offset, txn_type, start, end
            )
            return transactions

        except RepositoryError as e:
            logger.error(f"Transaction fetch failed for user {user_id}: {e}")

            raise HTTPException(
                status_code=500,
                detail="An error occurred while retrieving transactions.",
            )

    async def get_transaction_by_id(self, user_id: uuid.UUID, txn_id: uuid.UUID):
        try:
            return await self.repo.get_by_id(user_id, txn_id)

        except ResourceNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except RepositoryError as e:
            logger.error(f"Transaction fetch failed for user {user_id}: {e}")

            raise HTTPException(
                status_code=500,
                detail="An error occurred while retrieving transaction.",
            )

    async def update_transaction(
        self, user_id: uuid.UUID, txn_id: uuid.UUID, data: TransactionUpdate
    ):
        try:
            transaction = await self.repo.update(user_id, txn_id, data)

            if not transaction:
                raise HTTPException(status_code=404, detail="Transaction not found")

            await self.repo.db.commit()
            return transaction

        except RepositoryError as e:
            logger.error(f"Transaction updation failed for user {user_id}: {e}")

            raise HTTPException(
                status_code=500,
                detail="An error occurred while updating transaction.",
            )

    async def delete_transaction(self, user_id: uuid.UUID, txn_id: uuid.UUID):
        try:
            await self.repo.delete(user_id, txn_id)
            await self.repo.db.commit()

        except ResourceNotFoundError:
            raise HTTPException(status_code=404, detail="Transaction not found")

        except RepositoryError as e:
            logger.error(f"Transaction deletion failed for user {user_id}: {e}")

            raise HTTPException(
                status_code=500,
                detail="An error occurred while deleting transaction.",
            )
