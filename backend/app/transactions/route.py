import uuid
from datetime import datetime

from fastapi import APIRouter, status, HTTPException, Query

from app.transactions.schema import (
    TransactionRead,
    TransactionCreate,
    TransactionUpdate,
)
from app.core.enums import TransactionType

from app.core.dependencies import TransactionServiceDep, CurrentUserDep


router = APIRouter()


@router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    service: TransactionServiceDep,
    current_user: CurrentUserDep,
    data: TransactionCreate,
):
    return await service.create_transaction(current_user.id, data)


@router.get("/", response_model=list[TransactionRead], status_code=status.HTTP_200_OK)
async def read_transactions(
    service: TransactionServiceDep,
    current_user: CurrentUserDep,
    txn_type: TransactionType | None = None,  # Optional filter
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    start: datetime | None = None,  # Optional filter
    end: datetime | None = None,  # Optional filter
):
    if start and end and (start > end):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date range"
        )

    return await service.get_transactions(
        user_id=current_user.id,
        txn_type=txn_type,
        limit=limit,
        offset=offset,
        start=start,
        end=end,
    )


@router.get("/{txn_id}", response_model=TransactionRead, status_code=status.HTTP_200_OK)
async def read_transaction(
    service: TransactionServiceDep,
    current_user: CurrentUserDep,
    txn_id: uuid.UUID,
):
    return await service.get_transaction_by_id(current_user.id, txn_id)


@router.patch(
    "/{txn_id}", response_model=TransactionRead, status_code=status.HTTP_200_OK
)
async def update_transaction(
    service: TransactionServiceDep,
    current_user: CurrentUserDep,
    txn_id: uuid.UUID,
    txn_data: TransactionUpdate,
):
    return await service.update_transaction(current_user.id, txn_id, txn_data)


@router.delete("/{txn_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    service: TransactionServiceDep,
    current_user: CurrentUserDep,
    txn_id: uuid.UUID,
) -> None:
    return await service.delete_transaction(current_user.id, txn_id)
