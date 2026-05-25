from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Boolean, DateTime

from app.core.base import Base,TimestampMixin


# Database model for the user
class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    username: Mapped[str] = mapped_column(String(18),unique=True, nullable=False, index=True)

    email: Mapped[str] = mapped_column(String(255),unique=True, nullable=False, index=True)

    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    last_login: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)


    #---------------------------
    # RELATIONSHIPS
    #---------------------------

    # One-to-many: One user can have Many transactions, accounts & categories
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="user", cascade="all, delete-orphan") # type: ignore # noqa
 
    accounts: Mapped[list["Account"]] = relationship("Account", back_populates="user", cascade="all, delete-orphan") # type: ignore # noqa

    categories: Mapped[list["Category"]] = relationship("Category", back_populates="user", cascade="all, delete-orphan") # type: ignore # noqa