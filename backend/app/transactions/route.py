from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, status, HTTPException, Query

from app.transactions.schema import (
    TransactionRead,
    TransactionSummary,
    CursorPage,
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
    if data.txn_type == TransactionType.ADJUSTMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Adjustments are system-generated and cannot be created manually.",
        )
    if data.txn_type == TransactionType.TRANSFER and not data.to_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="to_account_id is required for transfers.",
        )

    return await service.create_transaction(current_user.id, data)


@router.get("/", response_model=CursorPage[TransactionSummary])
async def read_transactions(
    service: TransactionServiceDep,
    current_user: CurrentUserDep,
    txn_type: TransactionType | None = None,
    limit: int = Query(default=50, ge=1, le=500),
    cursor: str | None = Query(default=None),
    start: datetime | None = None,
    end: datetime | None = None,
):
    if start and end and (start > end):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date range"
        )

    transactions, next_cursor, has_more = await service.get_transactions(
        user_id=current_user.id,
        txn_type=txn_type,
        limit=limit,
        cursor=cursor,
        start=start,
        end=end,
    )

    items = [
        TransactionSummary(
            id=t.id,
            txn_date=t.txn_date,
            txn_type=t.txn_type,
            amount=t.amount,
            description=t.description,
            account_id=t.account_id,
            account_name=t.account.name,
            to_account_id=t.to_account_id,
            to_account_name=t.to_account.name if t.to_account else None,
            category_id=t.category_id,
            category_name=t.category.name if t.category else None,
        )
        for t in transactions
    ]

    return CursorPage(items=items, next_cursor=next_cursor, has_more=has_more)


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
    txn = await service.get_transaction_by_id(current_user.id, txn_id)
    if txn.txn_type == TransactionType.ADJUSTMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Adjustments are system-generated and cannot be modified.",
        )
    return await service.update_transaction(current_user.id, txn_id, txn_data)


@router.delete("/{txn_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    service: TransactionServiceDep,
    current_user: CurrentUserDep,
    txn_id: uuid.UUID,
) -> None:
    txn = await service.get_transaction_by_id(current_user.id, txn_id)
    if txn.txn_type == TransactionType.ADJUSTMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Adjustments are system-generated and cannot be deleted.",
        )
    return await service.delete_transaction(current_user.id, txn_id)
