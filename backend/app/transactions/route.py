import uuid
from datetime import datetime

from fastapi import APIRouter, status, HTTPException, Query

from app.transactions.schema import (
    TransactionRead,
    TransactionCreate,
    TransactionUpdate,
)
from app.core.enums import TransactionType

from app.core.dependencies import TransactionServiceDep


router = APIRouter()


@router.get("/", response_model=list[TransactionRead], status_code=status.HTTP_200_OK)
async def read_transactions(
    service: TransactionServiceDep,
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    start: datetime | None = None,              # Optional filter
    end: datetime | None = None,                # Optional filter
    txn_type: TransactionType | None = None,    # Optional filter
):
    if start and end and (start > end):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date range"
        )

    return await service.get_transactions(
        limit=limit,
        offset=offset,
        start=start,
        end=end,
        txn_type=txn_type
    )


@router.get("/{txn_id}", response_model=TransactionRead, status_code=status.HTTP_200_OK)
async def read_transaction(txn_id: uuid.UUID, service: TransactionServiceDep):
    txn = await service.get_transaction_by_id(txn_id)
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )
    return txn


@router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
async def create_transaction(txn_data: TransactionCreate, service: TransactionServiceDep):
    return await service.create_transaction(txn_data)


@router.patch(
    "/{txn_id}", response_model=TransactionRead, status_code=status.HTTP_200_OK
)
async def update_transaction(
    txn_id: uuid.UUID, txn_data: TransactionUpdate, service: TransactionServiceDep
):
    updated_txn = await service.update_transaction(txn_id, txn_data)
    if not updated_txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )
    return updated_txn


@router.delete("/{txn_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(txn_id: uuid.UUID, service: TransactionServiceDep):
    deleted = await service.delete_transaction(txn_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )
    # 204 returns no content body automatically
