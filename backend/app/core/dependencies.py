from typing import Annotated, Type

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationError
from app.users.schema import UserRead

# Repos and Services
from app.accounts.repository import AccountRepo
from app.accounts.service import AccountService
from app.categories.repository import CategoryRepo
from app.categories.service import CategoryService
from app.users.repository import UserRepo
from app.users.token_repo import UserTokenRepo
from app.users.service import UserService
from app.transactions.repository import TransactionRepo
from app.transactions.service import TransactionService
from app.reports.repository import ReportRepo
from app.reports.service import ReportService


# Session Dependency
SessionDep = Annotated[AsyncSession, Depends(get_db)]


def get_service(service_class: Type, repo_class: Type):
    """A factory to create service dependencies."""

    def _get_service(db: SessionDep):
        return service_class(repo_class(db))

    return _get_service


# My Models Dependencies
AccountServiceDep = Annotated[
    AccountService, Depends(get_service(AccountService, AccountRepo))
]
CategoryServiceDep = Annotated[
    CategoryService, Depends(get_service(CategoryService, CategoryRepo))
]


async def get_user_service(db: SessionDep):
    user_repo = UserRepo(db)
    token_repo = UserTokenRepo(db)
    return UserService(user_repo, token_repo)


UserServiceDep = Annotated[UserService, Depends(get_user_service)]


# custom service for transactions since its quite spaghetti
async def get_txn_service(
    db: SessionDep,
    account_service: AccountServiceDep,
    category_service: CategoryServiceDep,
):
    txn_repo = TransactionRepo(db)
    return TransactionService(txn_repo, account_service, category_service)


TransactionServiceDep = Annotated[TransactionService, Depends(get_txn_service)]

ReportServiceDep = Annotated[
    ReportService, Depends(get_service(ReportService, ReportRepo))
]


# OAuth Dependecy for Current User
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# Auth Dependency Logic
async def get_current_user(
    service: UserServiceDep, token: Annotated[str, Depends(oauth2_scheme)]
):
    payload = decode_access_token(token)
    if payload.get("purpose", "auth") != "auth":
        raise AuthenticationError("Invalid token purpose.")

    username: str | None = payload.get("sub")
    if username is None:
        raise AuthenticationError("Could not validate credentials.")

    user = await service.get_user_by_username(username)
    if user is None:
        raise AuthenticationError("Could not validate credentials.")
    return user


# Current User Injection
CurrentUserDep = Annotated[UserRead, Depends(get_current_user)]
