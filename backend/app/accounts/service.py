import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import select

from app.accounts.repository import AccountRepo
from app.accounts.schema import AccountCreate, AccountUpdate
from app.transactions.model import Transaction
from app.categories.model import Category
from app.core.enums import AccountStatus, CategoryType, TransactionType


class AccountService:
    """
    Handles business & specialized field logic.
    """

    def __init__(self, repo: AccountRepo):
        self.repo = repo

    async def increase_balance(
        self, user_id: uuid.UUID, account_id: uuid.UUID, amount: Decimal
    ) -> None:
        await self.repo.increase_balance(user_id, account_id, amount)

    async def decrease_balance(
        self, user_id: uuid.UUID, account_id: uuid.UUID, amount: Decimal
    ) -> None:
        await self.repo.decrease_balance(user_id, account_id, amount)

    async def adjust_balance(
        self, user_id: uuid.UUID, account_id: uuid.UUID, delta: Decimal
    ) -> None:
        await self.repo.adjust_balance(user_id, account_id, delta)

    async def lock_account(
        self, user_id: uuid.UUID, account_id: uuid.UUID
    ):
        await self.repo.lock_for_update(user_id, account_id)

    async def create_account(self, user_id: uuid.UUID, data: AccountCreate):
        account = await self.repo.create(user_id, data)

        if data.opening_balance > 0:
            result = await self.repo.db.execute(
                select(Category).where(
                    Category.user_id == user_id,
                    Category.name == "Opening Balance",
                )
            )
            category = result.scalar_one_or_none()
            if not category:
                category = Category(
                    name="Opening Balance",
                    type=CategoryType.SYSTEM,
                    icon="\U0001f3e6",
                    description="System-generated opening balance adjustment",
                    sort_order=0,
                    user_id=user_id,
                )
                self.repo.db.add(category)
                await self.repo.db.flush()

            txn = Transaction(
                txn_date=datetime.now(timezone.utc),
                txn_type=TransactionType.ADJUSTMENT,
                amount=data.opening_balance,
                description=f"Opening balance for {data.name}",
                account_id=account.id,
                category_id=category.id,
                user_id=user_id,
            )
            self.repo.db.add(txn)

        await self.repo.db.commit()
        return account

    async def get_accounts(
        self,
        user_id: uuid.UUID,
    ):
        return await self.repo.get_all(user_id)

    async def get_account_by_id(self, user_id: uuid.UUID, account_id: uuid.UUID):
        return await self.repo.get_by_id(user_id, account_id)

    async def update_account(
        self, user_id: uuid.UUID, account_id: uuid.UUID, data: AccountUpdate
    ):
        account = await self.repo.update(user_id, account_id, data)
        await self.repo.db.commit()
        return account

    async def delete_account(self, user_id: uuid.UUID, account_id: uuid.UUID):
        delete_payload = {
            "status": AccountStatus.CLOSED,
            "closed_at": datetime.now(timezone.utc),
        }

        await self.repo.delete(user_id, account_id, delete_payload)
        await self.repo.db.commit()
