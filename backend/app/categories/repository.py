
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
    
    # Fetch all categories from the database, filter if optional category_type is given
    async def get(self, category_type: CategoryType | None = None) -> list[Category]:
        query = select(Category)

        if category_type: 
            query = query.where(Category.type == category_type)

        query = query.order_by(asc(Category.name))
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    