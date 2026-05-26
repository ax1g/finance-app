
from sqlalchemy import select, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.categories.model import Category
from app.core.enums import CategoryType


class CategoryRepo:
    """
    Handles direct database operations using an injected session.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, category: Category):
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category
    
    async def get_income_categories(self):
        query = select(Category).where(Category.type == CategoryType.INCOME).order_by(asc(Category.name))
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_expense_categories(self):
        query = select(Category).where(Category.type == CategoryType.EXPENSE).order_by(asc(Category.name))
        result = await self.db.execute(query)
        return result.scalars().all()