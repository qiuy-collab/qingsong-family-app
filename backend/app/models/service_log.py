from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid


class ServiceLog(TimestampMixin, Base):
    __tablename__ = "service_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    elder_id: Mapped[str] = mapped_column(ForeignKey("elders.id", ondelete="CASCADE"), nullable=False, index=True)
    day_index: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    time_label: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    icon: Mapped[str] = mapped_column(String(40), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(255))
    extra: Mapped[str | None] = mapped_column(String(60))

    elder = relationship("Elder", back_populates="service_logs")
