from __future__ import annotations

from pydantic import BaseModel


class InstitutionCard(BaseModel):
    id: str
    name: str
    rating: float
    reviews: int
    price: int
    beds: int
    distance: str
    tags: list[str]
    image: str
    status: str | None = None


class InstitutionServiceItem(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    highlights: list[str]


class InstitutionReviewItem(BaseModel):
    id: str
    author_name: str
    relation_label: str
    stay_duration_label: str
    content: str
    created_at_label: str


class InstitutionDetail(BaseModel):
    id: str
    name: str
    city: str
    district: str
    address: str
    distance: str
    rating: float
    reviews_count: int
    price: int
    beds: int
    care_type: str
    description: str
    image: str
    tags: list[str]
    services: list[InstitutionServiceItem]
    reviews: list[InstitutionReviewItem]
