from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.dynamics import Dynamic, DynamicComment, DynamicLike
from app.models.profile import Profile
from app.schemas.dynamics import (
    DynamicCommentCreate,
    DynamicCommentResponse,
    DynamicResponse,
    DynamicToggleLikeResponse,
)


router = APIRouter()


def _serialize_dynamic(dynamic: Dynamic, profile_id: str) -> DynamicResponse:
    return DynamicResponse(
        id=dynamic.id,
        type=dynamic.type,
        time=dynamic.happened_at.astimezone().strftime("%H:%M"),
        timestamp=int(dynamic.happened_at.timestamp() * 1000),
        title=dynamic.title,
        location=dynamic.location,
        content=dynamic.content,
        image=dynamic.image_url,
        is_liked=any(like.profile_id == profile_id for like in dynamic.likes),
        likes=dynamic.likes_count,
        comments=[
            DynamicCommentResponse(
                id=comment.id,
                user=comment.author_name,
                text=comment.content,
                time=comment.time_label,
                timestamp=int(comment.created_at.timestamp() * 1000),
            )
            for comment in sorted(dynamic.comments, key=lambda item: item.created_at)
        ],
    )


@router.get("/elders/{elder_id}/dynamics", response_model=list[DynamicResponse])
def list_dynamics(
    elder_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DynamicResponse]:
    dynamics = (
        db.query(Dynamic)
        .options(joinedload(Dynamic.comments), joinedload(Dynamic.likes))
        .filter(Dynamic.elder_id == elder_id)
        .order_by(Dynamic.happened_at.desc())
        .all()
    )
    return [_serialize_dynamic(dynamic, current_user.id) for dynamic in dynamics]


@router.post("/dynamics/{dynamic_id}/like", response_model=DynamicToggleLikeResponse)
def toggle_dynamic_like(
    dynamic_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DynamicToggleLikeResponse:
    dynamic = db.query(Dynamic).options(joinedload(Dynamic.likes)).filter(Dynamic.id == dynamic_id).one_or_none()
    if dynamic is None:
        raise HTTPException(status_code=404, detail="Dynamic not found")

    existing = next((like for like in dynamic.likes if like.profile_id == current_user.id), None)
    if existing:
        db.delete(existing)
        dynamic.likes_count = max(dynamic.likes_count - 1, 0)
        liked = False
    else:
        db.add(DynamicLike(dynamic_id=dynamic.id, profile_id=current_user.id))
        dynamic.likes_count += 1
        liked = True
    db.commit()
    return DynamicToggleLikeResponse(id=dynamic.id, is_liked=liked, likes=dynamic.likes_count)


@router.post("/dynamics/{dynamic_id}/comments", response_model=DynamicCommentResponse, status_code=status.HTTP_201_CREATED)
def create_dynamic_comment(
    dynamic_id: str,
    payload: DynamicCommentCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DynamicCommentResponse:
    dynamic = db.query(Dynamic).filter(Dynamic.id == dynamic_id).one_or_none()
    if dynamic is None:
        raise HTTPException(status_code=404, detail="Dynamic not found")

    comment = DynamicComment(
        dynamic_id=dynamic.id,
        author_name=current_user.full_name or "我",
        content=payload.content,
        time_label="刚刚",
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return DynamicCommentResponse(
        id=comment.id,
        user=comment.author_name,
        text=comment.content,
        time=comment.time_label,
        timestamp=int(comment.created_at.timestamp() * 1000),
    )
