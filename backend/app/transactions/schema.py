import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict

from app.core.enums import TransactionType
from app.accounts.schema import AccountRead
from app.categories.schema import CategoryRead

# shared properties
class TransactionBase(BaseModel):
    txn_date: datetime

    txn_type: TransactionType

    amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)

    description: str | None = Field(default=None, max_length=255)


# Create Schema
class TransactionCreate(TransactionBase):
    account_id: uuid.UUID
    category_id: uuid.UUID
    
# Read Schema
class TransactionRead(TransactionBase):
    id: uuid.UUID
    account_id: uuid.UUID
    account: AccountRead

    category_id: uuid.UUID
    category: CategoryRead

    model_config = ConfigDict(from_attributes=True)


# Update Schema (partial updates)
class TransactionUpdate(BaseModel):
    txn_date: datetime | None = None

    txn_type: TransactionType | None = None

    amount: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)

    category_id: uuid.UUID | None = None

    account_id: uuid.UUID | None = None

    description: str | None = Field(default=None, max_length=255)
