import uuid

from app.categories.repository import CategoryRepo
from app.categories.schema import CategoryCreate
from app.categories.model import Category
from app.core.enums import CategoryType


class CategoryService:
    """
        Handles business & specialized field logic.
    """

    def __init__(self, repo: CategoryRepo):
        self.repo = repo


    async def create_category(self, category: CategoryCreate):
        category_dict = category.model_dump()
        new_category = Category(**category_dict)
        return await self.repo.create(new_category)
    

    async def get_categories(self, category_type: CategoryType | None = None):
        return await self.repo.get(category_type)
    
    async def get_category_by_id(self, category_id: uuid.UUID):
        return await self.repo.get_by_id(category_id)