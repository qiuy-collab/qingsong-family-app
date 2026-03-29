from __future__ import annotations

from pydantic import BaseModel


class ServiceLogResponse(BaseModel):
    id: str
    time: str
    title: str
    description: str
    status: str
    icon: str
    image: str | None = None
    extra: str | None = None
