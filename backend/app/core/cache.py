import hashlib
import uuid

from fastapi import Request, Response
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

CACHE_CONTROL = "private, max-age=30"


async def compute_etag(
    db: AsyncSession,
    user_id: uuid.UUID,
    *models,
) -> str | None:
    max_dates = []
    for model in models:
        stmt = select(func.max(model.updated_at)).where(model.user_id == user_id)
        result = await db.execute(stmt)
        max_date = result.scalar()
        if max_date is not None:
            max_dates.append(max_date)

    if not max_dates:
        return None

    latest = max(max_dates)
    raw = hashlib.md5(latest.isoformat().encode()).hexdigest()
    return f'"{raw}"'


async def compute_resource_etag(
    db: AsyncSession,
    model,
    resource_id: uuid.UUID,
) -> str | None:
    stmt = select(model.updated_at).where(model.id == resource_id)
    result = await db.execute(stmt)
    updated_at = result.scalar_one_or_none()
    if updated_at is None:
        return None
    raw = hashlib.md5(updated_at.isoformat().encode()).hexdigest()
    return f'"{raw}"'


async def handle_etag(
    request: Request,
    response: Response,
    etag: str | None,
) -> bool:
    if etag is None:
        return False
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = CACHE_CONTROL
    if request.headers.get("if-none-match") == etag:
        return True
    return False
