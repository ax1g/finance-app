from fastapi import APIRouter

from app.users.route import router as user_route
from app.transactions.route import router as transactions_route
from app.accounts.route import router as accounts_route
from app.categories.route import router as categories_route
from app.users.auth import router as auth_route
from app.reports.route import router as reports_route


api_router = APIRouter()
api_router.include_router(user_route, prefix="/user", tags=["User"])
api_router.include_router(
    transactions_route, prefix="/transactions", tags=["Transactions"]
)
api_router.include_router(categories_route, prefix="/categories", tags=["Categories"])
api_router.include_router(accounts_route, prefix="/accounts", tags=["Accounts"])
api_router.include_router(auth_route, prefix="/auth", tags=["Security"])
api_router.include_router(reports_route, prefix="/reports", tags=["Reports"])
