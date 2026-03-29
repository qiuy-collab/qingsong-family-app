from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import DemoLoginRequest, TokenResponse
from app.services.auth import demo_login


router = APIRouter()


@router.post("/demo-login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def demo_login_endpoint(payload: DemoLoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return demo_login(db, payload.phone)
