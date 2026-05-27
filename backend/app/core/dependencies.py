from typing import Annotated, Type

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.users.schema import UserRead
from app.users.auth import get_current_user

# Repos and Services
from app.accounts.repository import AccountRepo
from app.accounts.service import AccountService
from app.categories.repository import CategoryRepo
from app.categories.service import CategoryService
from app.users.repository import UserRepo
from app.users.service import UserService
from app.transactions.repository import TransactionRepo
from app.transactions.service import TransactionService


# Session Dependency
SessionDep = Annotated[AsyncSession, Depends(get_db)]

# Current User Dependency
CurrentUserDep = Annotated[UserRead, Depends(get_current_user)]


def get_service(service_class: Type, repo_class: Type):
    """A factory to create service dependencies."""
    def _get_service(db: SessionDep):
        return service_class(repo_class(db))
    return _get_service


# My Models Dependencies
AccountServiceDep = Annotated[AccountService, Depends(get_service(AccountService, AccountRepo))]
CategoryServiceDep = Annotated[CategoryService, Depends(get_service(CategoryService, CategoryRepo))]
UserServiceDep = Annotated[UserService, Depends(get_service(UserService, UserRepo))]


# custom service for transactions since its quite spaghetti
async def get_txn_service(db: SessionDep, account_service: AccountServiceDep, category_service: CategoryServiceDep):
    txn_repo = TransactionRepo(db)
    return TransactionService(txn_repo, account_service, category_service)


TransactionServiceDep = Annotated[TransactionService, Depends(get_txn_service)]
