import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.api.users import get_current_user

from app.services.dashboard_service import get_dashboard_data

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return get_dashboard_data(
            db=db,
            current_user=current_user
        )

    except Exception:

        logger.exception(
            "Dashboard data failed to load for user_id=%s", current_user.id
        )

        raise HTTPException(
            status_code=500,
            detail="Could not load dashboard data. Please try again shortly.",
        )