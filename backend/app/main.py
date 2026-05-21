from fastapi import FastAPI
from fastapi.routing import APIRoute

from app.core.config import settings
from app.transactions.router import router as txn_router


def custom_generate_unique_id(route: APIRoute) -> str:
    return route.name


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)


app.include_router(txn_router, prefix=settings.API_V1_STR)
