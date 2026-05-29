import uuid
from datetime import datetime, timezone

from app.accounts.repository import AccountRepo
from app.accounts.schema import AccountCreate, AccountUpdate
from app.core.enums import AccountStatus


class AccountService:
    """
    Handles business & specialized field logic.
    """

    def __init__(self, repo: AccountRepo):
        self.repo = repo

    async def create_account(self, user_id: uuid.UUID, data: AccountCreate):
        account = await self.repo.create(user_id, data)
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
