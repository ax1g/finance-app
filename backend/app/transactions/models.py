from datetime import datetime
from decimal import Decimal

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Numeric, DateTime, Enum, ForeignKey, Integer

from app.core.base import Base, TimestampMixin
from app.core.enums import TransactionType


# Database model for transaction
class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    txn_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    txn_type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType), nullable=False, index=True
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    description: Mapped[str | None] = mapped_column(String(255), nullable=True)


    # Foreign keys
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
   
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False, index=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)


    #---------------------------
    # RELATIONSHIPS
    #---------------------------

    # Many-to-One: Many transactions belong to One category, account and user
    category: Mapped["Category"] = relationship("Category",back_populates="transactions", lazy="joined")   # type: ignore # noqa

    account: Mapped["Account"] = relationship("Account",back_populates="transactions", lazy="joined")   # type: ignore # noqa

    user: Mapped["User"] = relationship("User", back_populates="transactions", lazy="joined")       # type: ignore # noqa