import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator


# share properties
class UserBase(BaseModel):
    username: str

    email: EmailStr


# create schema
class UserCreate(UserBase):
    password: str

    @field_validator("username")
    @classmethod
    def lowercase_username(cls, v: str) -> str:
        return v.lower()

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower()


# read schema
class UserRead(UserBase):
    id: uuid.UUID
    last_login: datetime
    is_verified: bool
    is_active: bool
    is_superuser: bool
    currency: str
    currency_custom_symbol: str | None

    model_config = ConfigDict(from_attributes=True)


# update schema
class UserUpdate(BaseModel):
    username: str | None = None

    email: EmailStr | None = None

    currency: str | None = None

    currency_custom_symbol: str | None = None

    @field_validator("username")
    @classmethod
    def lowercase_username(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return v.lower()

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if isinstance(v, str):
            return v.lower()
        return v


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def lowercase_email(cls, v: str) -> str:
        return v.lower()


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
