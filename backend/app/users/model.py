from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, DateTime, func

from app.core.base import Base, TimestampMixin


# Database model for the user
class User(Base, TimestampMixin):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(
        String(18), unique=True, nullable=False, index=True
    )

    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )

    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    last_login: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)

    currency_custom_symbol: Mapped[str | None] = mapped_column(String(10), nullable=True, default=None)

    # ---------------------------
    # RELATIONSHIPS
    # ---------------------------

    # One-to-many: One user can have Many transactions, accounts & categories
    transactions: Mapped[list["Transaction"]] = relationship(  # noqa: F821
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )

    accounts: Mapped[list["Account"]] = relationship(  # noqa: F821
        "Account", back_populates="user", cascade="all, delete-orphan"
    )

    categories: Mapped[list["Category"]] = relationship(  # noqa: F821
        "Category", back_populates="user", cascade="all, delete-orphan"
    )
