from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.jwt import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    print("\n========== AUTH DEBUG ==========")
    print("Received Token:", token)
    print("SECRET_KEY:", SECRET_KEY)

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("Payload:", payload)

        email = payload.get("sub")
        print("Email:", email)

        if email is None:
            print("Email is None")
            raise credentials_exception

    except JWTError as e:
        print("JWT ERROR:", e)
        raise credentials_exception

    user = db.query(User).filter(
        User.email == email
    ).first()

    print("Database User:", user)

    if user is None:
        print("User not found in database")
        raise credentials_exception

    print("Authentication Successful")
    return user