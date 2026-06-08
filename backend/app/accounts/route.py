import uuid

from fastapi import status
from fastapi.routing import APIRouter

from app.accounts.schema import AccountRead, AccountCreate, AccountUpdate

from app.core.dependencies import AccountServiceDep, CurrentUserDep


router = APIRouter()


@router.get("/", response_model=list[AccountRead], status_code=status.HTTP_200_OK)
async def get_accounts(
    service: AccountServiceDep,
    current_user: CurrentUserDep,
):
    return await service.get_accounts(current_user.id)


@router.get("/{account_id}", response_model=AccountRead, status_code=status.HTTP_200_OK)
async def get_account(
    service: AccountServiceDep,
    current_user: CurrentUserDep,
    account_id: uuid.UUID,
):
    return await service.get_account_by_id(current_user.id, account_id)


@router.post("/", response_model=AccountRead, status_code=status.HTTP_201_CREATED)
async def create_account(
    service: AccountServiceDep, current_user: CurrentUserDep, data: AccountCreate
):
    return await service.create_account(current_user.id, data)


@router.patch(
    "/{account_id}", response_model=AccountRead, status_code=status.HTTP_200_OK
)
async def update_account(
    service: AccountServiceDep,
    current_user: CurrentUserDep,
    account_id: uuid.UUID,
    data: AccountUpdate,
):
    return await service.update_account(current_user.id, account_id, data)


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    service: AccountServiceDep, current_user: CurrentUserDep, account_id: uuid.UUID
):
    return await service.delete_account(current_user.id, account_id)
