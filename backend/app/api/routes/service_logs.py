from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.profile import Profile
from app.models.service_log import ServiceLog
from app.schemas.service_logs import ServiceLogResponse


router = APIRouter()


@router.get("/elders/{elder_id}/service-logs", response_model=list[ServiceLogResponse])
def list_service_logs(
    elder_id: str,
    day_index: int = Query(default=0, ge=0, le=6),
    _: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ServiceLogResponse]:
    logs = (
        db.query(ServiceLog)
        .filter(ServiceLog.elder_id == elder_id, ServiceLog.day_index == day_index)
        .order_by(ServiceLog.time_label.asc())
        .all()
    )
    return [
        ServiceLogResponse(
            id=log.id,
            time=log.time_label,
            title=log.title,
            description=log.description,
            status=log.status,
            icon=log.icon,
            image=log.image_url,
            extra=log.extra,
        )
        for log in logs
    ]
