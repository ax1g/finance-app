import uuid
from decimal import Decimal
from datetime import date

from pydantic import BaseModel, Field, ConfigDict

from app.core.enums import AccountType


# shared properties
class AccountBase(BaseModel):
    name: str = Field(min_length=3, max_length=64)

    type: AccountType

    opening_balance: Decimal = Field(ge=0, max_digits=12, decimal_places=2)

    opening_balance_date: date


# create schema
class AccountCreate(AccountBase):
    user_id: uuid.UUID

# read schema
class AccountRead(AccountBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)

# update schema (partial updates)
class AccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=64)

    type: AccountType | None = None

    opening_balance: Decimal | None= Field(default=None, ge=0, max_digits=12, decimal_places=2)

    opening_balance_date: date | None = None
