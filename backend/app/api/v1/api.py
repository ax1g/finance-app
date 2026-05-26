from fastapi import APIRouter

from app.users.route import router as user_route
from app.transactions.route import router as transactions_route
from app.accounts.route import router as accounts_route
from app.categories.route import router as categories_route
from app.users.auth import router as auth_route


api_router = APIRouter()
api_router.include_router(user_route, prefix="/user", tags=["user"])
api_router.include_router(transactions_route, prefix="/transactions", tags=["transactions"])
api_router.include_router(categories_route, prefix='/categories', tags=["categories"])
api_router.include_router(accounts_route, prefix='/accounts', tags=["accounts"])
api_router.include_router(auth_route, prefix="/auth", tags=["auth"])