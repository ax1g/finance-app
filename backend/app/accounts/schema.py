import uuid
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict

from app.core.enums import AccountType


# shared properties
class AccountBase(BaseModel):
    name: str = Field(min_length=3, max_length=64)

    type: AccountType


# create schema
class AccountCreate(AccountBase):
    opening_balance: Decimal = Field(ge=0, max_digits=12, decimal_places=2)


# read schema
class AccountRead(AccountBase):
    id: uuid.UUID

    current_balance: Decimal = Field(ge=0, max_digits=12, decimal_places=2)

    model_config = ConfigDict(from_attributes=True)


# update schema (partial updates)
class AccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=64)

    type: AccountType | None = None
