import uuid

from fastapi import Request, Response, status
from fastapi.routing import APIRouter

from app.categories.model import Category
from app.categories.schema import CategoryRead, CategoryCreate, CategoryUpdate
from app.core.enums import CategoryType
from app.core.cache import compute_etag, compute_resource_etag, handle_etag

from app.core.dependencies import CategoryServiceDep, CurrentUserDep, SessionDep


router = APIRouter()


@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    service: CategoryServiceDep,
    current_user: CurrentUserDep,
    new_category: CategoryCreate,
):
    return await service.create_category(current_user.id, new_category)


@router.get(
    "/{category_id}", response_model=CategoryRead, status_code=status.HTTP_200_OK
)
async def get_category(
    request: Request,
    response: Response,
    service: CategoryServiceDep,
    current_user: CurrentUserDep,
    category_id: uuid.UUID,
    db: SessionDep,
):
    etag = await compute_resource_etag(db, Category, category_id)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)
    return await service.get_category_by_id(current_user.id, category_id)


@router.get("/", response_model=list[CategoryRead], status_code=status.HTTP_200_OK)
async def get_categories(
    request: Request,
    response: Response,
    service: CategoryServiceDep,
    current_user: CurrentUserDep,
    db: SessionDep,
    category_type: CategoryType | None = None,
):
    etag = await compute_etag(db, current_user.id, Category)
    if await handle_etag(request, response, etag):
        return Response(status_code=304)
    return await service.get_categories(current_user.id, category_type)


@router.patch(
    "/{category_id}", response_model=CategoryRead, status_code=status.HTTP_200_OK
)
async def update_category(
    service: CategoryServiceDep,
    current_user: CurrentUserDep,
    category_id: uuid.UUID,
    data: CategoryUpdate,
):
    return await service.update_category(current_user.id, category_id, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    service: CategoryServiceDep,
    current_user: CurrentUserDep,
    category_id: uuid.UUID,
):
    return await service.delete_category(current_user.id, category_id)
