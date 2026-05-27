from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.config import settings


# create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # True only during debugging
    pool_pre_ping=True,  # checks dead connections
    pool_recycle=3600,  # refresh stale connections
)


# session factory
SessionFactory = async_sessionmaker(
    bind=engine, class_=AsyncSession, autoflush=False, expire_on_commit=False
)


# database dependency
async def get_db() -> AsyncGenerator[AsyncSession]:
    async with SessionFactory() as session:
        yield session


