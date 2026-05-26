import uuid

from fastapi.routing import APIRouter
from fastapi import Depends, status
from typing import Annotated

from app.core.db import SessionDep
from app.users.service import UserService
from app.users.repository import UserRepo
from app.users.schema import UserRead, UserCreate


router = APIRouter()

# ------------------------------------------------------
# DEPENDENCIES
# ------------------------------------------------------

def get_user_services(db: SessionDep) -> UserService:
    repo = UserRepo(db)
    return UserService(repo)


ServiceDep = Annotated[UserService, Depends(get_user_services)]

# ------------------------------------------------------
# USER ROUTES
# ------------------------------------------------------

@router.get(
    '/', 
    response_model=list[UserRead], 
    status_code=status.HTTP_200_OK
)
async def get_users(service: ServiceDep):
    return await service.get_users()


@router.get('/{user_id}', response_model=UserRead, status_code=status.HTTP_200_OK)
async def get_user(service: ServiceDep, user_id: uuid.UUID):
    return await service.get_user_by_id(user_id)


@router.post('/', response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(service: ServiceDep, new_user: UserCreate):
    return await service.create_user(new_user)