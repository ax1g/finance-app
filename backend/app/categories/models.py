from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Enum


from app.core.base import Base, TimestampMixin
from app.core.enums import CategoryType


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True, unique=True)

    type: Mapped[CategoryType] = mapped_column(Enum(CategoryType), nullable=False, index=True)

    description: Mapped[str | None] = mapped_column(String(255))

    icon: Mapped[str | None] = mapped_column(String(50))

    is_active: Mapped[bool] = mapped_column(default=True, index=True)

    sort_order: Mapped[int] = mapped_column(default=0)

    #---------------------------
    # RELATIONSHIPS
    #---------------------------

    # Many-to-One: Many categories belong to one user
    user: Mapped["User"] = relationship("User", back_populates="categories") # type: ignore # noqa

    # One-to-Many: One account has many transactions
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="categories")  # type: ignore  # noqa