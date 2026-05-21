# app/transactions/router

from fastapi import APIRouter

from app.transactions.schemas import TransactionRead, TransactionCreate, TransactionUpdate
from app.db import SessionDep
from app.transactions.repository import TransactionRepo
from app.transactions.services import TransactionService


router = APIRouter(prefix="/transactions", tags=["transactions"])

repo = TransactionRepo()
service = TransactionService(repo)


@router.get("/")
async def read_transactions(db: SessionDep):
    return await service.get_all_transactions(db)

@router.get('/{txn_id}')
async def read_transaction(db:SessionDep, txn_id: int):
    return await service.get_transaction_by_id(db, txn_id)


@router.post('/', response_model=TransactionRead)
async def create_transactions(txn_data: TransactionCreate, db: SessionDep):
    return await service.create_transaction(db, txn_data)


@router.patch('/{txn_id}')
async def update_transaction(db: SessionDep, txn_id: int, txn_data: TransactionUpdate):
    return await service.update_transaction(db,txn_id,txn_data)

@router.delete('/{txn_id}')
async def delete_transaction(db: SessionDep, txn_id: int):
    return await service.delete_transaction(db, txn_id)