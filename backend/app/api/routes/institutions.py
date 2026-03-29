from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session, joinedload
from fastapi import Depends

from app.db.session import get_db
from app.models.institution import Institution
from app.schemas.institution import (
    InstitutionCard,
    InstitutionDetail,
    InstitutionReviewItem,
    InstitutionServiceItem,
)


router = APIRouter()


@router.get("", response_model=list[InstitutionCard])
def list_institutions(db: Session = Depends(get_db)) -> list[InstitutionCard]:
    institutions = (
        db.query(Institution)
        .options(joinedload(Institution.tags))
        .order_by(Institution.rating.desc(), Institution.created_at.desc())
        .all()
    )
    results: list[InstitutionCard] = []
    for institution in institutions:
        beds = institution.available_beds
        status = None if beds > 0 else "排队中"
        results.append(
            InstitutionCard(
                id=institution.id,
                name=institution.name,
                rating=institution.rating,
                reviews=institution.reviews_count,
                price=institution.base_price,
                beds=beds,
                distance=institution.distance_desc,
                tags=[tag.label for tag in institution.tags],
                image=institution.hero_image_url,
                status=status,
            )
        )
    return results


@router.get("/{institution_id}", response_model=InstitutionDetail)
def get_institution_detail(institution_id: str, db: Session = Depends(get_db)) -> InstitutionDetail:
    institution = (
        db.query(Institution)
        .options(
            joinedload(Institution.tags),
            joinedload(Institution.services),
            joinedload(Institution.reviews),
        )
        .filter(Institution.id == institution_id)
        .one_or_none()
    )
    if institution is None:
        raise HTTPException(status_code=404, detail="Institution not found")

    return InstitutionDetail(
        id=institution.id,
        name=institution.name,
        city=institution.city,
        district=institution.district,
        address=institution.address,
        distance=institution.distance_desc,
        rating=institution.rating,
        reviews_count=institution.reviews_count,
        price=institution.base_price,
        beds=institution.available_beds,
        care_type=institution.care_type,
        description=institution.description,
        image=institution.hero_image_url,
        tags=[tag.label for tag in institution.tags],
        services=[
            InstitutionServiceItem(
                id=service.id,
                title=service.title,
                description=service.description,
                icon=service.icon,
                highlights=[item for item in [service.highlight_1, service.highlight_2] if item],
            )
            for service in institution.services
        ],
        reviews=[
            InstitutionReviewItem(
                id=review.id,
                author_name=review.author_name,
                relation_label=review.relation_label,
                stay_duration_label=review.stay_duration_label,
                content=review.content,
                created_at_label=review.created_at_label,
            )
            for review in institution.reviews
        ],
    )
