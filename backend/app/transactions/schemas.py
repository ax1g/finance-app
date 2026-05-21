from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict

from app.core.enums import TransactionType


# shared properties
class TransactionBase(BaseModel):
    txn_date: datetime

    txn_type: TransactionType

    amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)

    category: str = Field(min_length=3, max_length=100)

    account: str = Field(min_length=3, max_length=100)

    description: str | None = Field(default=None, max_length=255)


# Create Schema
class TransactionCreate(TransactionBase):
    pass


# Read Schema
class TransactionRead(TransactionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Update Schema (partial updates)
class TransactionUpdate(BaseModel):
    txn_date: datetime | None = None

    txn_type: TransactionType | None = None

    amount: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)

    category: str | None = Field(default=None, min_length=3, max_length=100)

    account: str | None = Field(default=None, min_length=3, max_length=100)

    description: str | None = Field(default=None, max_length=255)
