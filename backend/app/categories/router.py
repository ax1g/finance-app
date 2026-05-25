from fastapi.routing import APIRouter
from fastapi import Depends, status
from typing import Annotated

from app.core.db import SessionDep
from app.categories.services import CategoryService
from app.categories.repository import CategoryRepo
from app.categories.schemas import CategoryRead, CategoryCreate


router = APIRouter(prefix='/categories', tags=["categories"])

# ------------------------------------------------------
# DEPENDENCIES
# ------------------------------------------------------

def get_category_services(db: SessionDep) -> CategoryService:
    repo = CategoryRepo(db)
    return CategoryService(repo)


ServiceDep = Annotated[CategoryService, Depends(get_category_services)]

# ------------------------------------------------------
# CATEGORIES ROUTES
# ------------------------------------------------------

@router.get("/", response_model=list[CategoryRead], status_code=status.HTTP_200_OK)
async def get_expense_categories(service: ServiceDep):
    return await service.get_expense_categories()


@router.post('/', response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(service: ServiceDep, new_category: CategoryCreate):
    return await service.create_category(new_category)