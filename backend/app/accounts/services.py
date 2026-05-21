from app.accounts.repository import AccountRepo
from app.accounts.schemas import AccountCreate
from app.accounts.models import Account


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