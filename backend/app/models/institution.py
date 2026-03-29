from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, generate_uuid


class Institution(TimestampMixin, Base):
    __tablename__ = "institutions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped[str] = mapped_column(String(50), nullable=False)
    district: Mapped[str] = mapped_column(String(50), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=4.5, nullable=False)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    base_price: Mapped[int] = mapped_column(Integer, nullable=False)
    total_beds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    available_beds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    distance_desc: Mapped[str] = mapped_column(String(50), nullable=False)
    hero_image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    care_type: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    tags = relationship("InstitutionTag", back_populates="institution", cascade="all, delete-orphan")
    services = relationship("InstitutionService", back_populates="institution", cascade="all, delete-orphan")
    reviews = relationship("InstitutionReview", back_populates="institution", cascade="all, delete-orphan")
    elders = relationship("Elder", back_populates="institution")
    orders = relationship("Order", back_populates="institution")


class InstitutionTag(Base):
    __tablename__ = "institution_tags"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    institution_id: Mapped[str] = mapped_column(ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    label: Mapped[str] = mapped_column(String(40), nullable=False)

    institution = relationship("Institution", back_populates="tags")


class InstitutionService(Base):
    __tablename__ = "institution_services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    institution_id: Mapped[str] = mapped_column(ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(40), nullable=False)
    highlight_1: Mapped[str | None] = mapped_column(String(40))
    highlight_2: Mapped[str | None] = mapped_column(String(40))

    institution = relationship("Institution", back_populates="services")


class InstitutionReview(Base):
    __tablename__ = "institution_reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    institution_id: Mapped[str] = mapped_column(ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    author_name: Mapped[str] = mapped_column(String(50), nullable=False)
    relation_label: Mapped[str] = mapped_column(String(40), nullable=False)
    stay_duration_label: Mapped[str] = mapped_column(String(40), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at_label: Mapped[str] = mapped_column(String(40), nullable=False)

    institution = relationship("Institution", back_populates="reviews")
