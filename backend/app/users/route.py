import uuid

from fastapi.routing import APIRouter
from fastapi import status

from app.users.schema import UserRead

from app.core.dependencies import UserServiceDep, CurrentUserDep


router = APIRouter()


@router.get('/me', response_model=UserRead)
async def read_user_me(current_user: CurrentUserDep):
    return current_user


@router.get('/', response_model=list[UserRead], status_code=status.HTTP_200_OK)
async def get_users(service: UserServiceDep):
    return await service.get_users()


@router.get('/{user_id}', response_model=UserRead, status_code=status.HTTP_200_OK)
async def get_user(service: UserServiceDep, user_id: uuid.UUID):
    return await service.get_user_by_id(user_id)