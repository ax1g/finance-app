import uuid
from datetime import datetime

from fastapi import APIRouter, Request, Response, status, HTTPException, Query

from app.transactions.model import Transaction
from app.transactions.schema import (
    TransactionRead,
    TransactionCreate,
    TransactionUpdate,
)
from app.core.enums import TransactionType
from app.core.cache import compute_etag, compute_resource_etag, handle_etag

from app.core.dependencies import TransactionServiceDep, CurrentUserDep, SessionDep


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


@router.get("/", response_model=list[TransactionRead], status_code=status.HTTP_200_OK)
async def read_transactions(
    request: Request,
    response: Response,
    service: TransactionServiceDep,
    current_user: CurrentUserDep,
    db: SessionDep,
    txn_type: TransactionType | None = None,
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    start: datetime | None = None,
    end: datetime | None = None,
):
    if start and end and (start > end):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date range"
        )

    etag = await compute_etag(db, current_user.id, Transaction)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)

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
    request: Request,
    response: Response,
    service: TransactionServiceDep,
    current_user: CurrentUserDep,
    db: SessionDep,
    txn_id: uuid.UUID,
):
    etag = await compute_resource_etag(db, Transaction, txn_id)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)
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
