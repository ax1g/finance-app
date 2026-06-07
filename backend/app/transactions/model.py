from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, DateTime, Enum, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.base import Base, TimestampMixin
from app.core.enums import TransactionType


# Database model for transaction
class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"

    txn_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True, server_default=func.now()
    )

    txn_type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType), nullable=False, index=True
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Foreign keys
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("categories.id"), nullable=True, index=True
    )

    account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("accounts.id"), nullable=False, index=True
    )

    to_account_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=True, index=True
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    # ---------------------------
    # RELATIONSHIPS
    # ---------------------------

    # Many-to-One: Many transactions belong to One category, account and user
    category: Mapped["Category | None"] = relationship(  # noqa: F821
        "Category", back_populates="transactions", lazy="selectin"
    )

    account: Mapped["Account"] = relationship(  # noqa: F821
        "Account",
        back_populates="transactions",
        foreign_keys=[account_id],
        lazy="selectin",
    )

    to_account: Mapped["Account | None"] = relationship(  # noqa: F821
        "Account", foreign_keys=[to_account_id], lazy="selectin"
    )

    user: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="transactions", lazy="selectin"
    )
