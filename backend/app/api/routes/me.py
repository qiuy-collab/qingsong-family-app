from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.config import get_settings
from app.models.profile import Profile
from app.schemas.auth import ProfileResponse


router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
def get_me(current_user: Profile = Depends(get_current_user)) -> ProfileResponse:
    settings = get_settings()
    return ProfileResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        default_elder_id=settings.demo_elder_id,
    )
