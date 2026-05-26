from fastapi.routing import APIRouter
from fastapi import Depends, status
from typing import Annotated

from app.core.db import SessionDep
from app.categories.service import CategoryService
from app.categories.repository import CategoryRepo
from app.categories.schema import CategoryRead, CategoryCreate
from app.core.enums import CategoryType


router = APIRouter()

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

@router.post('/', response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(service: ServiceDep, new_category: CategoryCreate):
    return await service.create_category(new_category)


@router.get("/", response_model=list[CategoryRead], status_code=status.HTTP_200_OK)
async def get_categories(service: ServiceDep, category_type: CategoryType | None = None):
    return await service.get_categories(category_type)
