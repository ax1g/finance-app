import uuid
from datetime import datetime, timezone

from app.categories.repository import CategoryRepo
from app.categories.schema import CategoryCreate
from app.categories.model import Category
from app.categories.schema import CategoryUpdate
from app.categories.defaults import DEFAULT_CATEGORIES
from app.core.enums import CategoryType, CategoryStatus


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

    async def _ensure_defaults(self, user_id: uuid.UUID) -> None:
        existing = await self.repo.get(user_id)
        if existing:
            return
        for cat in DEFAULT_CATEGORIES:
            category = Category(
                name=cat["name"],
                type=cat["type"],
                icon=cat.get("icon"),
                description=cat.get("description"),
                sort_order=cat.get("sort_order", 0),
                user_id=user_id,
            )
            self.repo.db.add(category)
        await self.repo.db.commit()

    async def get_categories(
        self, user_id: uuid.UUID, category_type: CategoryType | None = None
    ):
        categories = await self.repo.get(user_id, category_type)
        if not categories:
            await self._ensure_defaults(user_id)
            categories = await self.repo.get(user_id, category_type)
        return categories

    async def get_category_by_id(self, user_id: uuid.UUID, category_id: uuid.UUID):
        return await self.repo.get_by_id(user_id, category_id)

    async def update_category(
        self, user_id: uuid.UUID, category_id: uuid.UUID, data: CategoryUpdate
    ):
        category = await self.repo.update(
            user_id, category_id, data.model_dump(exclude_unset=True)
        )

        await self.repo.db.commit()
        return category

    async def delete_category(self, user_id: uuid.UUID, category_id: uuid.UUID):
        delete_payload = {
            "status": CategoryStatus.CLOSED,
            "closed_at": datetime.now(timezone.utc),
        }

        await self.repo.delete(user_id, category_id, delete_payload)

        await self.repo.db.commit()
