from fastapi.routing import APIRouter
from fastapi import status

from app.categories.schema import CategoryRead, CategoryCreate
from app.core.enums import CategoryType

from app.core.dependencies import CategoryServiceDep


router = APIRouter()


@router.post('/', response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(service: CategoryServiceDep, new_category: CategoryCreate):
    return await service.create_category(new_category)


@router.get("/", response_model=list[CategoryRead], status_code=status.HTTP_200_OK)
async def get_categories(service: CategoryServiceDep, category_type: CategoryType | None = None):
    return await service.get_categories(category_type)
