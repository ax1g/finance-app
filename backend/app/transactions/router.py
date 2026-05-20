# app/transactions/router

from fastapi import APIRouter
from transactions.schemas import TransactionRead, TransactionCreate
from db import SessionDep
from transactions.repository import TransactionRepo
from transactions.services import TransactionService


router = APIRouter(prefix="/transactions", tags=["transactions"])

repo = TransactionRepo()
service = TransactionService(repo)


@router.get("/")
async def read_transactions():
    return {"message": "reading all transactions"}


@router.post('/', response_model=TransactionRead)
async def create_transactions(txn_data: TransactionCreate, db: SessionDep):
    return await service.create_transaction(db, txn_data)