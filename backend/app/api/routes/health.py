from __future__ import annotations

from statistics import mean

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.health import Elder, HealthMetric
from app.models.profile import Profile
from app.schemas.health import HealthMetricsResponse, HealthPoint, HealthSummaryResponse


router = APIRouter()


@router.get("/elders/{elder_id}/health/summary", response_model=HealthSummaryResponse)
def get_health_summary(
    elder_id: str,
    _: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HealthSummaryResponse:
    elder = db.query(Elder).filter(Elder.id == elder_id).one_or_none()
    if elder is None:
        raise HTTPException(status_code=404, detail="Elder not found")

    metrics = (
        db.query(HealthMetric)
        .filter(HealthMetric.elder_id == elder_id, HealthMetric.range_bucket == "7d")
        .order_by(HealthMetric.recorded_at.asc())
        .all()
    )
    if not metrics:
        raise HTTPException(status_code=404, detail="Health metrics not found")

    latest = metrics[-1]
    abnormal = next((metric for metric in reversed(metrics) if metric.is_abnormal), None)
    average_bpm = round(mean(metric.bpm or 0 for metric in metrics))

    return HealthSummaryResponse(
        elder_id=elder.id,
        elder_name=elder.name,
        elder_avatar_url=elder.avatar_url,
        status_text=elder.status_text,
        last_sync_time=latest.recorded_at.astimezone().strftime("%H:%M"),
        average_bpm=average_bpm,
        current_bpm=latest.bpm or average_bpm,
        current_blood_pressure=f"{latest.systolic}/{latest.diastolic}",
        blood_pressure_level="偏高" if latest.is_abnormal else "正常",
        warning_title="血压异常警报" if abnormal else None,
        warning_message=(
            f"检测到读数高于日常基准（{abnormal.systolic}/{abnormal.diastolic} mmHg），请提醒长辈注意休息。"
            if abnormal
            else None
        ),
    )


@router.get("/elders/{elder_id}/health/metrics", response_model=HealthMetricsResponse)
def get_health_metrics(
    elder_id: str,
    range: str = Query(default="7d", pattern="^(7d|30d)$"),
    _: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HealthMetricsResponse:
    elder = db.query(Elder).options(joinedload(Elder.health_metrics)).filter(Elder.id == elder_id).one_or_none()
    if elder is None:
        raise HTTPException(status_code=404, detail="Elder not found")

    metrics = (
        db.query(HealthMetric)
        .filter(HealthMetric.elder_id == elder_id, HealthMetric.range_bucket == range)
        .order_by(HealthMetric.recorded_at.asc())
        .all()
    )
    if not metrics:
        raise HTTPException(status_code=404, detail="Health metrics not found")

    points = [
        HealthPoint(
            x=index * (50 if range == "7d" else 100),
            label=metric.recorded_at.strftime("%m-%d"),
            systolic=metric.systolic or 0,
            diastolic=metric.diastolic or 0,
            bpm=metric.bpm or 0,
            blood_pressure_display=f"{metric.systolic}/{metric.diastolic}",
        )
        for index, metric in enumerate(metrics)
    ]
    return HealthMetricsResponse(elder_id=elder_id, range=range, points=points)
