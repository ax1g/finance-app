from __future__ import annotations

import base64
import json
import uuid
from datetime import datetime

from sqlalchemy import select, desc, tuple_
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


def encode_cursor(txn_date: datetime, created_at: datetime, id: uuid.UUID) -> str:
    data = json.dumps(
        [txn_date.isoformat(), created_at.isoformat(), str(id)],
        separators=(",", ":"),
    )
    return base64.urlsafe_b64encode(data.encode()).decode()


def decode_cursor(cursor: str) -> tuple[datetime, datetime, uuid.UUID]:
    data = json.loads(base64.urlsafe_b64decode(cursor.encode()).decode())
    return (
        datetime.fromisoformat(data[0]),
        datetime.fromisoformat(data[1]),
        uuid.UUID(data[2]),
    )


class TransactionRepo:
    """
    Handles direct database operations using an injected session.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, user_id: uuid.UUID, data: TransactionCreate) -> Transaction:
        db_obj = Transaction(**data.model_dump(), user_id=user_id)
        try:
            self.db.add(db_obj)
            await self.db.flush()
            await self.db.refresh(db_obj)
            return db_obj
        except IntegrityError as e:
            await self.db.rollback()
            raise TransactionCreateError(f"Integrity violation: {str(e.orig)}") from e
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_transactions(
        self,
        user_id: uuid.UUID,
        limit: int,
        cursor: str | None = None,
        txn_type: TransactionType | None = None,
        start: datetime | None = None,
        end: datetime | None = None,
    ) -> tuple[list[Transaction], str | None, bool]:
        try:
            query = select(Transaction).where(Transaction.user_id == user_id)

            if txn_type:
                query = query.where(Transaction.txn_type == txn_type)
            if start:
                query = query.where(Transaction.txn_date >= start)
            if end:
                query = query.where(Transaction.txn_date <= end)

            if cursor:
                txn_date, created_at, txn_id = decode_cursor(cursor)
                query = query.where(
                    tuple_(Transaction.txn_date, Transaction.created_at, Transaction.id)
                    < tuple_(txn_date, created_at, txn_id)
                )

            query = query.order_by(
                desc(Transaction.txn_date),
                desc(Transaction.created_at),
                desc(Transaction.id),
            ).limit(limit + 1)

            result = await self.db.execute(query)
            rows = list(result.scalars().all())

            has_more = len(rows) > limit
            if has_more:
                rows = rows[:limit]

            next_cursor = None
            if has_more and rows:
                last = rows[-1]
                next_cursor = encode_cursor(last.txn_date, last.created_at, last.id)

            return rows, next_cursor, has_more

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
