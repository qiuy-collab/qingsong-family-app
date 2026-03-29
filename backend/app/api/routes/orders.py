from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.health import Elder
from app.models.institution import Institution
from app.models.order import Order, OrderReview
from app.models.profile import Profile
from app.schemas.orders import OrderResponse, OrderReviewCreate, OrderSignRequest


router = APIRouter()


@router.get("", response_model=list[OrderResponse])
def list_orders(current_user: Profile = Depends(get_current_user), db: Session = Depends(get_db)) -> list[OrderResponse]:
    orders = (
        db.query(Order)
        .options(joinedload(Order.institution))
        .filter(Order.profile_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [
        OrderResponse(
            id=order.id,
            order_no=order.order_no,
            service_name=order.service_name,
            org_name=order.institution.name,
            price=order.total_price,
            date=order.created_at.date().isoformat(),
            status=order.status,
            type=order.package_type,
        )
        for order in orders
    ]


@router.post("/sign", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def sign_order(
    payload: OrderSignRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrderResponse:
    institution = db.get(Institution, payload.institution_id)
    elder = db.get(Elder, payload.elder_id)
    if institution is None or elder is None:
        raise HTTPException(status_code=404, detail="Institution or elder not found")

    total_price = 5000 + (1500 if payload.is_pro_package else 0)
    service_name = "康复进阶包" if payload.is_pro_package else "基础生活照护"
    now = datetime.now()
    order = Order(
        order_no=f"ORD-{now.strftime('%Y%m%d%H%M%S')}",
        profile_id=current_user.id,
        elder_id=elder.id,
        institution_id=institution.id,
        service_name=service_name,
        package_type="pro" if payload.is_pro_package else "base",
        total_price=total_price,
        status="pending",
        contact_name=payload.name,
        contact_phone=payload.phone,
        relationship_label=payload.relationship,
        signature_data_url=payload.signature_data,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return OrderResponse(
        id=order.id,
        order_no=order.order_no,
        service_name=order.service_name,
        org_name=institution.name,
        price=order.total_price,
        date=order.created_at.date().isoformat(),
        status=order.status,
        type=order.package_type,
    )


@router.post("/{order_id}/reviews", status_code=status.HTTP_201_CREATED)
def create_order_review(
    order_id: str,
    payload: OrderReviewCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id, Order.profile_id == current_user.id).one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    review = OrderReview(order_id=order.id, rating=payload.rating, comment=payload.comment)
    db.add(review)
    if order.status == "active":
        order.status = "completed"
    db.commit()
    return {"status": "ok"}
