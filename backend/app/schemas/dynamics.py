from __future__ import annotations

from pydantic import BaseModel, Field


class DynamicCommentResponse(BaseModel):
    id: str
    user: str
    text: str
    time: str
    timestamp: int


class DynamicResponse(BaseModel):
    id: str
    type: str
    time: str
    timestamp: int
    title: str
    location: str
    content: str
    image: str | None = None
    is_liked: bool
    likes: int
    comments: list[DynamicCommentResponse]


class DynamicCommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)


class DynamicToggleLikeResponse(BaseModel):
    id: str
    is_liked: bool
    likes: int
