from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.utils.jwt import SECRET_KEY, ALGORITHM
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.get("/")
def users_home():
    return {
        "message": "Users API is working!"
    }


@router.get("/me", response_model=UserResponse)
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:
        raise credentials_exception

    return user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.full_name = user_update.full_name

    db.commit()
    db.refresh(current_user)

    return current_user