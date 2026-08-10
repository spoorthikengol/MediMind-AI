from fastapi import APIRouter, Depends

from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def read_current_user(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "is_active": current_user.is_active
    }