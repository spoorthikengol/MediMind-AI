from typing import Optional, Union

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.api.users import get_current_user

from app.schemas.comparison import ComparisonResponse, NotEnoughReportsResponse
from app.services.comparison_service import compare_reports, compare_two_reports

router = APIRouter(
    prefix="/comparison",
    tags=["Report Comparison"]
)


@router.get(
    "/",
    response_model=Union[ComparisonResponse, NotEnoughReportsResponse]
)
def compare(
    report_a_id: Optional[int] = Query(default=None),
    report_b_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if report_a_id is not None and report_b_id is not None:
        return compare_two_reports(
            db,
            current_user,
            report_a_id,
            report_b_id,
        )

    return compare_reports(
        db,
        current_user
    )