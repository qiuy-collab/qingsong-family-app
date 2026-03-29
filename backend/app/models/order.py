from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_no: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)
    profile_id: Mapped[str] = mapped_column(ForeignKey("profiles.id"), nullable=False, index=True)
    elder_id: Mapped[str] = mapped_column(ForeignKey("elders.id"), nullable=False)
    institution_id: Mapped[str] = mapped_column(ForeignKey("institutions.id"), nullable=False)
    service_name: Mapped[str] = mapped_column(String(80), nullable=False)
    package_type: Mapped[str] = mapped_column(String(20), nullable=False)
    total_price: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(50), nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    relationship_label: Mapped[str] = mapped_column(String(20), nullable=False)
    signature_data_url: Mapped[str | None] = mapped_column(Text)

    profile = relationship("Profile", back_populates="orders")
    elder = relationship("Elder", back_populates="orders")
    institution = relationship("Institution", back_populates="orders")
    reviews = relationship("OrderReview", back_populates="order", cascade="all, delete-orphan")


class OrderReview(TimestampMixin, Base):
    __tablename__ = "order_reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)

    order = relationship("Order", back_populates="reviews")
