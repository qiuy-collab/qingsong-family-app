from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid, utcnow


class Dynamic(TimestampMixin, Base):
    __tablename__ = "dynamics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    elder_id: Mapped[str] = mapped_column(ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(80), nullable=False)
    location: Mapped[str] = mapped_column(String(80), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(255))
    happened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    likes_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    elder = relationship("Elder", back_populates="dynamics")
    comments = relationship("DynamicComment", back_populates="dynamic", cascade="all, delete-orphan")
    likes = relationship("DynamicLike", back_populates="dynamic", cascade="all, delete-orphan")


class DynamicComment(TimestampMixin, Base):
    __tablename__ = "dynamic_comments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    dynamic_id: Mapped[str] = mapped_column(ForeignKey("dynamics.id", ondelete="CASCADE"), nullable=False)
    author_name: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    time_label: Mapped[str] = mapped_column(String(40), default="刚刚", nullable=False)

    dynamic = relationship("Dynamic", back_populates="comments")


class DynamicLike(Base):
    __tablename__ = "dynamic_likes"
    __table_args__ = (UniqueConstraint("dynamic_id", "profile_id", name="uq_dynamic_like_dynamic_profile"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    dynamic_id: Mapped[str] = mapped_column(ForeignKey("dynamics.id", ondelete="CASCADE"), nullable=False)
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    dynamic = relationship("Dynamic", back_populates="likes")
    profile = relationship("Profile", back_populates="dynamic_likes")
