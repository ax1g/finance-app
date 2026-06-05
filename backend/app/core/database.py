import logging
import re

from collections.abc import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import settings

logger = logging.getLogger(__name__)


# create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.ENVIRONMENT == "local"),  # True only during debugging
    pool_pre_ping=True,  # checks dead connections
    pool_recycle=3600,  # refresh stale connections
)


# session factory
SessionFactory = async_sessionmaker(
    bind=engine, class_=AsyncSession, autoflush=False, expire_on_commit=False
)


async def create_database_if_not_exists() -> None:
    db_name = settings.POSTGRES_DB
    admin_url = (
        f"postgresql+psycopg://{settings.POSTGRES_USER}:"
        f"{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:"
        f"{settings.POSTGRES_PORT}/postgres"
    )
    admin_engine = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")
    if not re.fullmatch(r"[a-zA-Z_][a-zA-Z0-9_]*", db_name):
        raise ValueError(f"Invalid database name: {db_name!r}")

    try:
        async with admin_engine.connect() as conn:
            result = await conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                {"db_name": db_name},
            )
            if not result.scalar():
                await conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                logger.info("Created database '%s'", db_name)
            else:
                logger.info("Database '%s' already exists", db_name)
    finally:
        await admin_engine.dispose()


# database dependency
async def get_db() -> AsyncGenerator[AsyncSession]:
    async with SessionFactory() as session:
        yield session
