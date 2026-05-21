from fastapi.routing import APIRouter
from fastapi import Depends, status
from typing import Annotated

from app.core.db import SessionDep
from app.accounts.services import AccountService
from app.accounts.repository import AccountRepo
from app.accounts.schemas import AccountRead, AccountCreate


router = APIRouter(prefix='/accounts', tags=["accounts"])

# ------------------------------------------------------
# DEPENDENCIES
# ------------------------------------------------------

def get_account_services(db: SessionDep) -> AccountService:
    repo = AccountRepo(db)
    return AccountService(repo)


ServiceDep = Annotated[AccountService, Depends(get_account_services)]

# ------------------------------------------------------
# ACCOUNT ROUTES
# ------------------------------------------------------

@router.get("/", response_model=list[AccountRead], status_code=status.HTTP_200_OK)
async def get_accounts(service: ServiceDep):
    return await service.get_accounts()


@router.post('/', response_model=AccountRead, status_code=status.HTTP_201_CREATED)
async def create_account(service: ServiceDep, new_account: AccountCreate):
    return await service.create_account(new_account)