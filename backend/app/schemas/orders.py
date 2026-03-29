from __future__ import annotations

from pydantic import BaseModel, Field


class OrderResponse(BaseModel):
    id: str
    order_no: str
    service_name: str
    org_name: str
    price: int
    date: str
    status: str
    type: str


class OrderSignRequest(BaseModel):
    institution_id: str
    elder_id: str
    name: str = Field(min_length=1, max_length=50)
    id_number: str = Field(min_length=8, max_length=32)
    phone: str = Field(min_length=6, max_length=20)
    relationship: str = Field(min_length=1, max_length=20)
    is_pro_package: bool = False
    photo: str | None = None
    signature_data: str | None = None


class OrderReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=500)
