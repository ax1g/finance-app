from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime, ForeignKey, Enum

from app.core.base import Base, TimestampMixin
from app.core.enums import TokenPurpose


class UserToken(Base, TimestampMixin):
    __tablename__ = "user_tokens"

    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    purpose: Mapped[TokenPurpose] = mapped_column(
        Enum(TokenPurpose), nullable=False, index=True
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )

    user: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="tokens"
    )
