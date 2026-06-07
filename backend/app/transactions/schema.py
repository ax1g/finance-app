import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict, model_validator

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
    category_id: uuid.UUID | None = None
    to_account_id: uuid.UUID | None = None

    @model_validator(mode="after")
    def validate_transfer(self):
        if self.txn_type == TransactionType.TRANSFER:
            if not self.to_account_id:
                raise ValueError("to_account_id is required for transfers")
            if self.to_account_id == self.account_id:
                raise ValueError("from and to accounts must be different")
            self.category_id = None
        return self


# Read Schema
class TransactionRead(TransactionBase):
    id: uuid.UUID
    account_id: uuid.UUID
    account: AccountRead

    category_id: uuid.UUID | None
    category: CategoryRead | None = None

    to_account_id: uuid.UUID | None
    to_account: AccountRead | None = None

    model_config = ConfigDict(from_attributes=True)


# Update Schema (partial updates)
class TransactionUpdate(BaseModel):
    txn_date: datetime | None = None

    txn_type: TransactionType | None = None

    amount: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)

    category_id: uuid.UUID | None = None

    account_id: uuid.UUID | None = None

    to_account_id: uuid.UUID | None = None

    description: str | None = Field(default=None, max_length=255)

    @model_validator(mode="after")
    def validate_transfer(self):
        txn_type = self.txn_type
        to_account_id = self.to_account_id
        if to_account_id and txn_type is not None and txn_type != TransactionType.TRANSFER:
            raise ValueError("to_account_id is only valid for transfers")
        if txn_type == TransactionType.TRANSFER:
            if not to_account_id:
                raise ValueError("to_account_id is required for transfers")
            if to_account_id and self.account_id and to_account_id == self.account_id:
                raise ValueError("from and to accounts must be different")
        return self
