from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token
from app.models.profile import Profile
from app.schemas.auth import ProfileResponse, TokenResponse


def demo_login(db: Session, phone: str) -> TokenResponse:
    settings = get_settings()
    profile = db.query(Profile).filter(Profile.phone == phone).one_or_none()
    if profile is None:
        profile = Profile(
            id=settings.demo_profile_id if phone == "13800138000" else None,
            full_name="家属用户",
            phone=phone,
            avatar_url="https://picsum.photos/seed/family-user/200/200",
            is_demo_user=True,
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    token = create_access_token(profile.id, extra={"phone": phone})
    return TokenResponse(
        access_token=token,
        profile=ProfileResponse(
            id=profile.id,
            full_name=profile.full_name,
            phone=profile.phone,
            avatar_url=profile.avatar_url,
            default_elder_id=settings.demo_elder_id,
        ),
    )
