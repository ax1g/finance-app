import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict


# share properties
class UserBase(BaseModel):
    username: str

    email: EmailStr


# create schema
class UserCreate(UserBase):
    password: str


# read schema
class UserRead(UserBase):
    id: uuid.UUID
    last_login : datetime
    is_verified: bool
    is_active: bool
    is_superuser: bool

    model_config = ConfigDict(from_attributes=True)


# update schema
class UserUpdate(BaseModel):
    username: str | None = None

    email: EmailStr | None = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None