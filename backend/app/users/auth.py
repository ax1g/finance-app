from typing import Annotated

from fastapi import APIRouter, Depends, BackgroundTasks, Query
from fastapi.security import OAuth2PasswordRequestForm


from app.core.security import create_access_token
from app.core.exceptions import AuthenticationError
from app.users.schema import (
    Token,
    UserRead,
    UserCreate,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)

from app.core.dependencies import UserServiceDep, CurrentUserDep


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
async def create_user(
    service: UserServiceDep,
    new_user: UserCreate,
    bg: BackgroundTasks,
):
    return await service.create_user(new_user, bg)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    service: UserServiceDep,
    data: ForgotPasswordRequest,
    bg: BackgroundTasks,
):
    await service.forgot_password(data.email, bg)
    return MessageResponse(
        message="If an account with that email exists, a reset link has been sent."
    )


@router.post("/reset-password", status_code=204)
async def reset_password(service: UserServiceDep, data: ResetPasswordRequest):
    await service.reset_password(data.token, data.new_password)


@router.get("/verify-email", response_model=MessageResponse)
async def verify_email(
    service: UserServiceDep,
    token: str = Query(...),
):
    await service.verify_email(token)
    return MessageResponse(message="Email verified successfully.")


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    service: UserServiceDep,
    current_user: CurrentUserDep,
    bg: BackgroundTasks,
):
    await service.resend_verification(current_user.id, bg)
    return MessageResponse(message="Verification email sent if your email is not yet verified.")
