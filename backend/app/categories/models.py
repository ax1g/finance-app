import uuid

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Enum, ForeignKey

from app.core.base import Base, TimestampMixin
from app.core.enums import CategoryType


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    type: Mapped[CategoryType] = mapped_column(Enum(CategoryType), nullable=False, index=True)

    description: Mapped[str | None] = mapped_column(String(255))

    icon: Mapped[str | None] = mapped_column(String(50))

    is_active: Mapped[bool] = mapped_column(default=True, index=True)

    sort_order: Mapped[int] = mapped_column(default=0)

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)


    #---------------------------
    # RELATIONSHIPS
    #---------------------------

    # Many-to-One: Many categories belong to one user
    user: Mapped["User"] = relationship("User", back_populates="category") # type: ignore # noqa

    # One-to-Many: One category has many transactions
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="categories")  # type: ignore  # noqa