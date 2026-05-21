from fastapi import FastAPI
from fastapi.routing import APIRoute

from app.core.config import settings
from app.transactions.router import router as txn_router
from app.accounts.router import router as account_router
from app.categories.router import router as category_router

def custom_generate_unique_id(route: APIRoute) -> str:
    return route.name

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

app.include_router(txn_router, prefix=settings.API_V1_STR)
app.include_router(account_router, prefix=settings.API_V1_STR)
app.include_router(category_router, prefix=settings.API_V1_STR)