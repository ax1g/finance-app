from app.categories.repository import CategoryRepo
from app.categories.schemas import CategoryCreate
from app.categories.models import Category


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
    

    async def get_expense_categories(self):
        return await self.repo.get_expense_categories()
    

    async def get_income_categories(self):
        return await self.repo.get_income_categories()