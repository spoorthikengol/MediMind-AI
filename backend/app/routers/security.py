from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.utils.security import hash_password, verify_password

router = APIRouter(
    prefix="/security",
    tags=["Security & Privacy"]
)


@router.post("/change-password")
def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not verify_password(
        current_password,
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    # Basic password validation
    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters long"
        )

    # Prevent using the same password
    if verify_password(
        new_password,
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password"
        )

    # Update password
    current_user.hashed_password = hash_password(new_password)

    db.commit()

    return {
        "message": "Password changed successfully"
    }