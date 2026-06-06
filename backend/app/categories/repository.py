import uuid

from sqlalchemy import select, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.categories.model import Category
from app.core.enums import CategoryType, CategoryStatus
from app.core.exceptions import RepositoryError, ConflictError, ResourceNotFoundError


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
            raise ConflictError(f"Category conflict: {str(e.orig)}") from e

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    # Fetch all active categories from the database, filter if optional category_type is given
    async def get(
        self, user_id: uuid.UUID, category_type: CategoryType | None = None
    ) -> list[Category]:
        query = (
            select(Category)
            .where(Category.user_id == user_id)
            .where(Category.status == CategoryStatus.ACTIVE)
            .where(Category.type != CategoryType.SYSTEM)
        )

        if category_type:
            query = query.where(Category.type == category_type)

        query = query.order_by(asc(Category.name))

        try:
            result = await self.db.execute(query)
            return list(result.scalars().all())
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def update(self, user_id: uuid.UUID, category_id: uuid.UUID, data: dict):
        try:
            category = await self.get_by_id(user_id, category_id)

            for key, val in data.items():
                setattr(category, key, val)

            await self.db.flush()
            await self.db.refresh(category)
            return category

        except IntegrityError as e:
            await self.db.rollback()
            raise ConflictError(f"Category update conflict: {str(e.orig)}") from e

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def delete(self, user_id: uuid.UUID, category_id: uuid.UUID, payload: dict):
        """
        Soft deletes the category, status = closed
        """
        try:
            category = await self.get_by_id(user_id, category_id)

            for key, val in payload.items():
                setattr(category, key, val)

            await self.db.flush()
            await self.db.refresh(category)
            return category

        except SQLAlchemyError as e:
            await self.db.rollback()
            raise RepositoryError(f"Database error: {str(e)}") from e

    async def get_by_id(self, user_id: uuid.UUID, category_id: uuid.UUID):
        query = (
            select(Category)
            .where(Category.user_id == user_id)
            .where(Category.id == category_id)
        )
        try:
            result = await self.db.execute(query)
            category = result.scalar_one_or_none()
            if not category:
                raise ResourceNotFoundError(f"Category {category_id} not found")
            return category
        except SQLAlchemyError as e:
            raise RepositoryError(f"Database error: {str(e)}") from e
