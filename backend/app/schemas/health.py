from __future__ import annotations

from pydantic import BaseModel


class HealthSummaryResponse(BaseModel):
    elder_id: str
    elder_name: str
    elder_avatar_url: str
    status_text: str
    last_sync_time: str
    average_bpm: int
    current_bpm: int
    current_blood_pressure: str
    blood_pressure_level: str
    warning_title: str | None = None
    warning_message: str | None = None


class HealthPoint(BaseModel):
    x: int
    label: str
    systolic: int
    diastolic: int
    bpm: int
    blood_pressure_display: str


class HealthMetricsResponse(BaseModel):
    elder_id: str
    range: str
    points: list[HealthPoint]
