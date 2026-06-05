import uuid
from datetime import datetime
from collections.abc import Sequence

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.transactions.model import Transaction
from app.transactions.schema import TransactionCreate, TransactionUpdate
from app.core.exceptions import (
    TransactionCreateError,
    TransactionUpdateError,
    RepositoryError,
    ResourceNotFoundError,
)
from app.core.enums import TransactionType


class TransactionRepo:
    """
    Handles direct database operations using an injected session.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, user_id: uuid.UUID, data: TransactionCreate) -> Transaction:
        """
        Creates a new transaction bound to a specific user.
        """

        # Convert Schema to DB Model & inject user context
        db_obj = Transaction(**data.model_dump(), user_id=user_id)

        try:
            self.db.add(db_obj)
            # Flush to trigger database constraints/triggers without committing yet
            await self.db.flush()
            # Refresh to get DB-generated fields (like ID or created_at)
            await self.db.refresh(db_obj)
            return db_obj

        except IntegrityError as e:
            # Handles Foreign Key or Unique Constraint failures
            await self.db.rollback()
            raise TransactionCreateError(f"Integrity violation: {str(e.orig)}") from e

        except SQLAlchemyError as e:
            # Handles general DB connectivity or syntax issues
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_transactions(
        self,
        user_id: uuid.UUID,
        limit: int,
        offset: int,
        txn_type: TransactionType | None = None,
        start: datetime | None = None,
        end: datetime | None = None,
    ) -> Sequence[Transaction]:
        """
        Get all the transactions of the user, apply filter if available
        """
        try:
            query = select(Transaction).where(Transaction.user_id == user_id)

            # Dynamically apply filters if they are passed
            if txn_type:
                query = query.where(Transaction.txn_type == txn_type)
            if start:
                query = query.where(Transaction.txn_date >= start)
            if end:
                query = query.where(Transaction.txn_date <= end)

            # Order by newest first (break ties by creation time), then paginate
            query = (
                query.order_by(desc(Transaction.txn_date), desc(Transaction.created_at)).offset(offset).limit(limit)
            )

            result = await self.db.execute(query)
            return result.scalars().all()

        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_by_id(self, user_id: uuid.UUID, txn_id: uuid.UUID) -> Transaction:
        """
        Fetches a transaction or raises ResourceNotFoundError.
        """
        try:
            query = (
                select(Transaction)
                .where(Transaction.user_id == user_id)
                .where(Transaction.id == txn_id)
            )
            result = await self.db.execute(query)
            transaction = result.scalar_one_or_none()

            if not transaction:
                raise ResourceNotFoundError(f"Transaction {txn_id} not found")

            return transaction

        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def update(
        self, user_id: uuid.UUID, txn_id: uuid.UUID, data: TransactionUpdate
    ) -> Transaction:
        """
        Updates a specific transaction of the user
        """

        try:
            transaction = await self.get_by_id(user_id, txn_id)

            # exclude_unset=True prevents overwriting existing data with default None values
            update_data = data.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(transaction, key, value)

            await self.db.flush()
            await self.db.refresh(transaction)
            return transaction

        except IntegrityError as e:
            # Handles Foreign Key or Unique Constraint failures
            await self.db.rollback()
            raise TransactionUpdateError(f"Integrity violation: {str(e.orig)}") from e

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def delete(self, user_id: uuid.UUID, txn_id: uuid.UUID) -> None:
        """
        Removes a specific transaction of the user.
        """
        try:
            transaction = await self.get_by_id(
                user_id, txn_id
            )  # get_by_id raises ResourceNotFoundError if not success

            await self.db.delete(transaction)
            await self.db.flush()

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e
