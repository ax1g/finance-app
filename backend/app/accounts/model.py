from __future__ import annotations

import uuid
from decimal import Decimal
from datetime import date

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, Enum, Date, ForeignKey, UniqueConstraint

from app.core.base import Base, TimestampMixin
from app.core.enums import AccountType, AccountStatus


# Database model for Account
class Account(Base, TimestampMixin):
    __tablename__ = "accounts"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_accounts_user_id_name"),
    )

    name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    type: Mapped[AccountType] = mapped_column(
        Enum(AccountType), nullable=False, index=True
    )

    current_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus), nullable=False, default=AccountStatus.ACTIVE
    )

    closed_at: Mapped[date] = mapped_column(Date, default=None, nullable=True)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    # ---------------------------
    # RELATIONSHIPS
    # ---------------------------

    # Many-to-One: Many accounts belong to one user
    user: Mapped["User"] = relationship("User", back_populates="accounts")  # noqa: F821

    # One-to-Many: One account has many transactions (source account)
    transactions: Mapped[list["Transaction"]] = relationship(  # noqa: F821
        "Transaction", back_populates="account", foreign_keys="Transaction.account_id"
    )

    # One-to-Many: One account receives transfers (destination account)
    incoming_transfers: Mapped[list["Transaction"]] = relationship(  # noqa: F821
        "Transaction", back_populates="to_account", foreign_keys="Transaction.to_account_id"
    )
