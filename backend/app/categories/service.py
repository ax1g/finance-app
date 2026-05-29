import uuid
import logging

from fastapi import HTTPException

from app.categories.repository import CategoryRepo
from app.categories.schema import CategoryCreate
from app.categories.model import Category
from app.core.enums import CategoryType
from app.core.exceptions import RepositoryError


logger = logging.getLogger(__name__)


class CategoryService:
    """
    Handles business & specialized field logic.
    """

    def __init__(self, repo: CategoryRepo):
        self.repo = repo

    async def create_category(self, user_id: uuid.UUID, category: CategoryCreate):
        try:
            category_dict = category.model_dump()
            new_category = Category(**category_dict)
            created = await self.repo.create(user_id, new_category)
            await self.repo.db.commit()
            return created

        except RepositoryError as e:
            logger.error(f"Category creation failed for user {user_id}: {e}")
            raise HTTPException(
                status_code=500, detail="An error occurred while creating category."
            )

    async def get_categories(
        self, user_id: uuid.UUID, category_type: CategoryType | None = None
    ):
        try:
            return await self.repo.get(user_id, category_type)

        except RepositoryError as e:
            logger.error(f"Category fetch failed for user {user_id}: {e}")
            raise HTTPException(
                status_code=500, detail="An error occurred while retrieving categories."
            )

    async def get_category_by_id(self, user_id: uuid.UUID, category_id: uuid.UUID):
        try:
            category = await self.repo.get_by_id(user_id, category_id)
            if category is None:
                raise HTTPException(status_code=404, detail="Category not found")
            return category

        except RepositoryError as e:
            logger.error(f"Category fetch failed for user {user_id}: {e}")
            raise HTTPException(
                status_code=500, detail="An error occurred while retrieving category."
            )
