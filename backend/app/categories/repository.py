import uuid

from sqlalchemy import select, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.categories.model import Category
from app.core.enums import CategoryType
from app.core.exceptions import RepositoryError


class CategoryRepo:
    """
    Handles direct database operations using an injected session.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, user_id: uuid.UUID, category: Category):
        # bind category to the user and persist
        category.user_id = user_id
        try:
            self.db.add(category)
            # flush to apply DB constraints without committing
            await self.db.flush()
            await self.db.refresh(category)
            return category

        except IntegrityError as e:
            await self.db.rollback()
            raise RepositoryError(f"Integrity violation: {str(e.orig)}")

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}")

    # Fetch all categories from the database, filter if optional category_type is given
    async def get(
        self, user_id: uuid.UUID, category_type: CategoryType | None = None
    ) -> list[Category]:
        query = select(Category).where(Category.user_id == user_id)

        if category_type:
            query = query.where(Category.type == category_type)

        query = query.order_by(asc(Category.name))

        try:
            result = await self.db.execute(query)
            return list(result.scalars().all())
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}")

    async def get_by_id(self, user_id: uuid.UUID, category_id: uuid.UUID):
        query = (
            select(Category)
            .where(Category.user_id == user_id)
            .where(Category.id == category_id)
        )
        try:
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}")
