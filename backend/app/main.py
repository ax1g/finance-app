import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from collections.abc import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import create_database_if_not_exists, get_raw_connection
from app.core.exceptions import (
    AppError,
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    RepositoryError,
    ResourceNotFoundError,
)

logger = logging.getLogger(__name__)


MIGRATION_LOCK_ID = 123456789  # Any arbitrary int — just needs to be consistent


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting up...")
    await create_database_if_not_exists()

    alembic_ini = Path(__file__).parent.parent / "alembic.ini"
    logger.info("Acquiring migration lock...")

    async with get_raw_connection() as conn:
        # Blocks until this instance is the only one holding the lock
        await conn.execute(f"SELECT pg_advisory_lock({MIGRATION_LOCK_ID})")
        try:
            logger.info("Running migrations...")
            proc = await asyncio.create_subprocess_exec(
                "python", "-m", "alembic", "upgrade", "head",
                cwd=alembic_ini.parent,
            )
            rc = await proc.wait()
            if rc != 0:
                raise RuntimeError(f"Alembic exited with code {rc}")
            logger.info("Migrations complete.")
        except Exception:
            logger.exception("Migration failed")
            raise  # Re-raise so the instance doesn't start in a broken state
        finally:
            await conn.execute(f"SELECT pg_advisory_unlock({MIGRATION_LOCK_ID})")

    yield
    logger.info("Shutting down...")


def custom_generate_unique_id(route: APIRoute) -> str:
    return route.name


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://neco-money.vercel.app",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix=settings.API_V1_STR)


@app.exception_handler(AuthenticationError)
async def authentication_error_handler(
    request: Request, exc: AuthenticationError
) -> JSONResponse:
    return JSONResponse(
        status_code=401,
        content={"detail": str(exc)},
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(AuthorizationError)
async def authorization_error_handler(
    request: Request, exc: AuthorizationError
) -> JSONResponse:
    return JSONResponse(status_code=403, content={"detail": str(exc)})


@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(
    request: Request, exc: ResourceNotFoundError
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(ConflictError)
async def conflict_error_handler(
    request: Request, exc: ConflictError
) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(RepositoryError)
async def repository_error_handler(
    request: Request, exc: RepositoryError
) -> JSONResponse:
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=500, content={"detail": "An internal error occurred."}
    )


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    logger.error(f"Unhandled application error: {exc}")
    return JSONResponse(
        status_code=500, content={"detail": "An internal error occurred."}
    )
