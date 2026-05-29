import uuid
from collections.abc import Sequence

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy import select, asc

from app.core.exceptions import (
    ResourceNotFoundError,
    RepositoryError,
    ConflictError,
    AccountDeleteError,
)
from app.accounts.model import Account
from app.accounts.schema import AccountCreate, AccountUpdate
from app.core.enums import AccountStatus


class AccountRepo:
    """
    Handles direct database operations using an injected session.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: uuid.UUID, data: AccountCreate) -> Account:

        # Schema to DB Model
        db_obj = Account(
            **data.model_dump(exclude={"opening_balance"}),
            current_balance=data.opening_balance,
            user_id=user_id,
        )

        try:
            self.db.add(db_obj)
            await self.db.flush()
            await self.db.refresh(db_obj)
            return db_obj

        except IntegrityError as e:
            await self.db.rollback()
            raise ConflictError(f"Account already exists: {str(e.orig)}") from e

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    # TODO: filtering by account_type : cash,bank,investments etc.
    async def get_all(self, user_id: uuid.UUID) -> Sequence[Account]:
        try:
            query = (
                select(Account)
                .where(Account.user_id == user_id)
                .where(Account.status == AccountStatus.ACTIVE)
                .order_by(asc(Account.type), asc(Account.name))
            )

            result = await self.db.execute(query)

            return result.scalars().all()

        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_by_id(self, user_id: uuid.UUID, account_id: uuid.UUID) -> Account:
        try:
            query = (
                select(Account)
                .where(Account.user_id == user_id)
                .where(Account.id == account_id)
            )

            result = await self.db.execute(query)
            account = result.scalar_one_or_none()

            if not account:
                raise ResourceNotFoundError(f"Account {account_id} not found")

            return account

        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def update(
        self, user_id: uuid.UUID, account_id: uuid.UUID, data: AccountUpdate
    ):
        try:
            account = await self.get_by_id(user_id, account_id)

            update_data = data.model_dump(exclude_unset=True)

            for key, val in update_data.items():
                setattr(account, key, val)

            await self.db.flush()
            await self.db.refresh(account)
            return account

        except IntegrityError as e:
            await self.db.rollback()
            raise ConflictError(f"Account update conflict: {str(e.orig)}") from e

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def delete(self, user_id: uuid.UUID, account_id: uuid.UUID, data: dict):
        """
        Soft Deletes the account, status = closed
        """
        try:
            account = await self.get_by_id(user_id, account_id)

            if account.current_balance != 0:
                raise AccountDeleteError("Account must have zero balance to be closed.")

            for key, val in data.items():
                setattr(account, key, val)

            await self.db.flush()
            await self.db.refresh(account)

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e
