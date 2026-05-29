from fastapi.routing import APIRouter
from fastapi import status

from app.categories.schema import CategoryRead, CategoryCreate
from app.core.enums import CategoryType

from app.core.dependencies import CategoryServiceDep, CurrentUserDep


router = APIRouter()


@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    service: CategoryServiceDep,
    current_user: CurrentUserDep,
    new_category: CategoryCreate,
):
    return await service.create_category(current_user.id, new_category)


@router.get("/", response_model=list[CategoryRead], status_code=status.HTTP_200_OK)
async def get_categories(
    service: CategoryServiceDep,
    current_user: CurrentUserDep,
    category_type: CategoryType | None = None,
):
    return await service.get_categories(current_user.id, category_type)
