from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.api.users import get_current_user

from app.services.dashboard_service import get_dashboard_data

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
        print("\n========== DASHBOARD REQUEST ==========")
        print("Current User:", current_user.email)

        data = get_dashboard_data(
            db=db,
            current_user=current_user
        )

        print("\n========== DASHBOARD DATA ==========")
        print(data)
        print("====================================\n")

        return data

    except Exception as e:

        print("\n========== DASHBOARD ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("====================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )