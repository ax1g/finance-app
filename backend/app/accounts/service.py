import uuid

from app.accounts.repository import AccountRepo
from app.accounts.schema import AccountCreate, AccountUpdate
from app.accounts.model import Account


class AccountService:
    """
        Handles business & specialized field logic.
    """

    def __init__(self, repo: AccountRepo):
        self.repo = repo

    async def create_account(self, account_data: AccountCreate):
        account_dict = account_data.model_dump()
        new_account = Account(**account_dict)
        return await self.repo.create(new_account)
    
    async def get_accounts(self):
        return await self.repo.get_accounts()

    async def get_account_by_id(self, account_id: uuid.UUID):
        return await self.repo.get_by_id(account_id)

    async def update_account(self, account_id: uuid.UUID, data: AccountUpdate):
        return await self.repo.update(account_id, data.model_dump(exclude_unset=True))
    
    async def delete_account(self, account_id: uuid.UUID):
        return await self.repo.delete(account_id)