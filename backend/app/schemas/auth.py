from __future__ import annotations

from pydantic import BaseModel, Field


class DemoLoginRequest(BaseModel):
    phone: str = Field(min_length=6, max_length=20)
    verification_code: str | None = Field(default=None, max_length=10)


class ProfileResponse(BaseModel):
    id: str
    full_name: str
    phone: str
    avatar_url: str | None
    default_elder_id: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile: ProfileResponse
