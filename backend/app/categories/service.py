import uuid
from datetime import datetime, timezone

from app.categories.repository import CategoryRepo
from app.categories.schema import CategoryCreate
from app.categories.model import Category
from app.categories.schema import CategoryUpdate
from app.core.enums import CategoryType, CategoryStatus
from app.core.exceptions import ResourceNotFoundError


class CategoryService:
    """
    Handles business & specialized field logic.
    """

    def __init__(self, repo: CategoryRepo):
        self.repo = repo

    async def create_category(self, user_id: uuid.UUID, category: CategoryCreate):
        category_dict = category.model_dump()
        new_category = Category(**category_dict)
        created = await self.repo.create(user_id, new_category)
        await self.repo.db.commit()
        return created

    async def get_categories(
        self, user_id: uuid.UUID, category_type: CategoryType | None = None
    ):
        return await self.repo.get(user_id, category_type)

    async def get_category_by_id(self, user_id: uuid.UUID, category_id: uuid.UUID):
        category = await self.repo.get_by_id(user_id, category_id)
        if category is None:
            raise ResourceNotFoundError(f"Category {category_id} not found")
        return category

    async def update_category(
        self, user_id: uuid.UUID, category_id: uuid.UUID, data: CategoryUpdate
    ):
        category = await self.repo.update(
            user_id, category_id, data.model_dump(exclude_unset=True)
        )
        if not category:
            raise ResourceNotFoundError(f"Category {category_id} not found")

        await self.repo.db.commit()
        return category

    async def delete_category(self, user_id: uuid.UUID, category_id: uuid.UUID):
        delete_payload = {
            "status": CategoryStatus.CLOSED,
            "closed_at": datetime.now(timezone.utc),
        }

        category = await self.repo.delete(user_id, category_id, delete_payload)
        if not category:
            raise ResourceNotFoundError(f"Category {category_id} not found")

        await self.repo.db.commit()
