from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from config import settings


engine = create_async_engine(settings.DATABASE_URL, echo=True)

SessionLocal = async_sessionmaker(bind=engine, autoflush=False, autocommit=False)
