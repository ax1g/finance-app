import uuid

from fastapi.routing import APIRouter
from fastapi import Depends, status
from typing import Annotated

from app.core.db import SessionDep
from app.accounts.service import AccountService
from app.accounts.repository import AccountRepo
from app.accounts.schema import AccountRead, AccountCreate, AccountUpdate


router = APIRouter()

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


@router.get("/{account_id}", response_model=AccountRead, status_code=status.HTTP_200_OK)
async def get_account(service: ServiceDep, account_id: uuid.UUID):
    return await service.get_account_by_id(account_id)


@router.post('/', response_model=AccountRead, status_code=status.HTTP_201_CREATED)
async def create_account(service: ServiceDep, new_account: AccountCreate):
    return await service.create_account(new_account)


@router.patch("/{account_id}", response_model=AccountRead, status_code=status.HTTP_200_OK)
async def update_account(service: ServiceDep, account_id: uuid.UUID, updated_data: AccountUpdate):
    return await service.update_account(account_id, updated_data)


@router.delete('/{account_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(service: ServiceDep, account_id: uuid.UUID):
    return await service.delete_account(account_id)