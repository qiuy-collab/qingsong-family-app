from __future__ import annotations

from pydantic import BaseModel, Field


class ChatSessionResponse(BaseModel):
    id: str
    title: str
    updated_at: str


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    model_name: str | None = None
    error_state: bool = False
    created_at: str | None = None


class ChatSessionCreateResponse(BaseModel):
    session: ChatSessionResponse
    messages: list[ChatMessageResponse]


class ChatMessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
