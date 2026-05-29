import uuid

from fastapi import HTTPException

from app.core.exceptions import RepositoryError
from app.accounts.repository import AccountRepo
from app.accounts.schema import AccountCreate, AccountUpdate


class AccountService:
    """
    Handles business & specialized field logic.
    """

    def __init__(self, repo: AccountRepo):
        self.repo = repo

    async def create_account(self, user_id: uuid.UUID, data: AccountCreate):
        try:
            account = await self.repo.create(user_id, data)
            await self.repo.db.commit()
            return account

        except RepositoryError:
            raise HTTPException(
                status_code=500,
                detail="An error occurred while creating account.",
            )

    async def get_accounts(
        self,
        user_id: uuid.UUID,
    ):
        try:
            return await self.repo.get_all(user_id)
        except RepositoryError:
            raise HTTPException(
                status_code=500,
                detail="An error occurred while fetching accounts.",
            )

    async def get_account_by_id(self, user_id: uuid.UUID, account_id: uuid.UUID):
        try:
            return await self.repo.get_by_id(user_id, account_id)
        except RepositoryError:
            raise HTTPException(
                status_code=500,
                detail="An error occurred while fetching the account.",
            )

    async def update_account(
        self, user_id: uuid.UUID, account_id: uuid.UUID, data: AccountUpdate
    ):
        try:
            account = await self.repo.update(user_id, account_id, data)

            if not account:
                raise HTTPException(status_code=404, detail="Account not found")

            await self.repo.db.commit()
            return account

        except RepositoryError:
            raise HTTPException(
                status_code=500,
                detail="An error occurred while fetching the account.",
            )

    async def delete_account(self, user_id: uuid.UUID, account_id: uuid.UUID):
        try:
            await self.repo.delete(user_id, account_id)
            await self.repo.db.commit()

        except RepositoryError:
            raise HTTPException(
                status_code=500,
                detail="An error occurred while fetching the account.",
            )
