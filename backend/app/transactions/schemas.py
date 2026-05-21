from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict

from app.core.enums import TransactionType
from app.accounts.schemas import AccountRead
from app.categories.schemas import CategoryRead

# shared properties
class TransactionBase(BaseModel):
    txn_date: datetime

    txn_type: TransactionType

    amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)

    description: str | None = Field(default=None, max_length=255)


# Create Schema
class TransactionCreate(TransactionBase):
    account_id: int
    category_id: int
    
# Read Schema
class TransactionRead(TransactionBase):
    id: int
    account_id: int
    account: AccountRead

    category_id: int
    category: CategoryRead

    model_config = ConfigDict(from_attributes=True)


# Update Schema (partial updates)
class TransactionUpdate(BaseModel):
    txn_date: datetime | None = None

    txn_type: TransactionType | None = None

    amount: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)

    category_id: int | None = None

    account_id: int | None = None

    description: str | None = Field(default=None, max_length=255)
