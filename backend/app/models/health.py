from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid, utcnow


class Elder(TimestampMixin, Base):
    __tablename__ = "elders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    institution_id: Mapped[str] = mapped_column(ForeignKey("institutions.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(60), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(255), nullable=False)
    room_number: Mapped[str] = mapped_column(String(30), nullable=False)
    status_text: Mapped[str] = mapped_column(String(40), default="状态良好", nullable=False)

    institution = relationship("Institution", back_populates="elders")
    health_metrics = relationship("HealthMetric", back_populates="elder", cascade="all, delete-orphan")
    dynamics = relationship("Dynamic", back_populates="elder", cascade="all, delete-orphan")
    service_logs = relationship("ServiceLog", back_populates="elder", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="elder")


class HealthMetric(Base):
    __tablename__ = "health_metrics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    elder_id: Mapped[str] = mapped_column(ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, index=True)
    range_bucket: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    systolic: Mapped[int | None] = mapped_column(Integer)
    diastolic: Mapped[int | None] = mapped_column(Integer)
    bpm: Mapped[int | None] = mapped_column(Integer)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    is_abnormal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    note: Mapped[str | None] = mapped_column(String(120))

    elder = relationship("Elder", back_populates="health_metrics")
