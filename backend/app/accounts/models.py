from decimal import Decimal
from datetime import date

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Numeric, Enum, Date

from app.core.base import Base, TimestampMixin
from app.core.enums import AccountType, AccountStatus


# Database model for Account
class Account(Base, TimestampMixin):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(50), nullable=False,unique=True, index=True)

    type: Mapped[AccountType] = mapped_column(
        Enum(AccountType), nullable=False, index=True
    )

    opening_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    opening_balance_date: Mapped[date] = mapped_column(Date, nullable=False)

    status: Mapped[AccountStatus] = mapped_column(Enum(AccountStatus), default=AccountStatus.ACTIVE)

    closed_at: Mapped[date] = mapped_column(Date, default=None, nullable=True)

    #---------------------------
    # RELATIONSHIPS
    #---------------------------

    # Many-to-One: Many accounts belong to one user
    user: Mapped["User"] = relationship("User", back_populates="accounts") # type: ignore # noqa

    # One-to-Many: One account has many transactions
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="accounts")  # type: ignore # noqa