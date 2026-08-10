from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.doctor_service import get_doctor_dashboard

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"]
)


@router.get("/")
def doctor_dashboard(
    db: Session = Depends(get_db),
):
    return get_doctor_dashboard(db)