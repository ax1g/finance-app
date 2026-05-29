import uuid

from fastapi.routing import APIRouter
from fastapi import status

from app.accounts.schema import AccountRead, AccountCreate, AccountUpdate

# dependencies
from app.core.dependencies import AccountServiceDep, CurrentUserDep


router = APIRouter()


@router.get("/", response_model=list[AccountRead], status_code=status.HTTP_200_OK)
async def get_accounts(service: AccountServiceDep, user: CurrentUserDep):
    return await service.get_accounts(user.id)


@router.get("/{account_id}", response_model=AccountRead, status_code=status.HTTP_200_OK)
async def get_account(
    service: AccountServiceDep, user: CurrentUserDep, account_id: uuid.UUID
):
    return await service.get_account_by_id(user.id, account_id)


@router.post("/", response_model=AccountRead, status_code=status.HTTP_201_CREATED)
async def create_account(
    service: AccountServiceDep, user: CurrentUserDep, data: AccountCreate
):
    return await service.create_account(user.id, data)


@router.patch(
    "/{account_id}", response_model=AccountRead, status_code=status.HTTP_200_OK
)
async def update_account(
    service: AccountServiceDep,
    user: CurrentUserDep,
    account_id: uuid.UUID,
    data: AccountUpdate,
):
    return await service.update_account(user.id, account_id, data)


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    service: AccountServiceDep, user: CurrentUserDep, account_id: uuid.UUID
):
    return await service.delete_account(user.id, account_id)
