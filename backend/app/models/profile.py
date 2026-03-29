from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid


class Profile(TimestampMixin, Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(255))
    is_demo_user: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    orders = relationship("Order", back_populates="profile")
    chat_sessions = relationship("ChatSession", back_populates="profile")
    dynamic_likes = relationship("DynamicLike", back_populates="profile")
