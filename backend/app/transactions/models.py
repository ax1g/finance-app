from datetime import datetime
from decimal import Decimal

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Numeric, DateTime, Enum

from app.core.base import Base, TimestampMixin
from app.core.enums import TransactionType


# Database model for transaction
class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)

    txn_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    txn_type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType), nullable=False, index=True
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    category: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )  # TODO: crud & relationship

    account: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )  # TODO: crud & relationship

    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
