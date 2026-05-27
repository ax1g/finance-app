from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm


from app.core.security import create_access_token
from app.users.schema import Token, UserRead, UserCreate

from app.core.dependencies import UserServiceDep, CurrentUserDep


router = APIRouter()


@router.post("/login", response_model=Token)
async def login(service: UserServiceDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.username)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post('/signup', response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(service: UserServiceDep, new_user: UserCreate):
    return await service.create_user(new_user)


@router.get('/me', response_model=UserRead, status_code=status.HTTP_200_OK)
async def read_user_me(current_user: CurrentUserDep):
    return current_user