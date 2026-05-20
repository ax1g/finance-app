from fastapi import APIRouter


router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/")
async def read_transactions():
    return {"message": "reading all transactions"}
