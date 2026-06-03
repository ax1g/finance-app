from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm


from app.core.security import create_access_token
from app.core.exceptions import AuthenticationError
from app.users.schema import Token, UserRead, UserCreate, ForgotPasswordRequest, ResetPasswordRequest

from app.core.dependencies import UserServiceDep


router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    service: UserServiceDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = await service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise AuthenticationError("Incorrect username or password.")

    access_token = create_access_token(subject=user.username)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/signup", response_model=UserRead, status_code=201)
async def create_user(service: UserServiceDep, new_user: UserCreate):
    return await service.create_user(new_user)


@router.post("/forgot-password")
async def forgot_password(service: UserServiceDep, data: ForgotPasswordRequest):
    token = await service.forgot_password(data.email)
    return {"reset_token": token}


@router.post("/reset-password", status_code=204)
async def reset_password(service: UserServiceDep, data: ResetPasswordRequest):
    await service.reset_password(data.token, data.new_password)
